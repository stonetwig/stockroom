import { createSyncServer } from "./sync/server.ts";
import { denoKvAdapter } from "./sync/deno-kv.ts";
import { PROTOCOL_VERSION } from "./sync/protocol.ts";

const PUBLIC_DIR = new URL("../public/", import.meta.url);
const PORT = Number(Deno.env.get("PORT") ?? "8000");
const USER_AGENT =
  "Mozilla/5.0 (compatible; LocalPortfolio/1.0; +https://deno.com/deploy)";
const UPSTREAM_TIMEOUT_MS = 10_000;

/** Only files with these extensions are ever served from `public/`. */
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

/* ------------------------------------------------------------------------ */
/* Price history: cached in Deno KV, synced read-only to browsers           */
/* ------------------------------------------------------------------------ */

const HISTORY_MODEL = "history";
const HISTORY_RANGE = "5y";
const HISTORY_INTERVAL = "1d";
const SYNC_SCOPE = "";
// Deno KV values are capped at 64 KiB; leave headroom for the row envelope.
const MAX_POINTS_JSON_BYTES = 56 * 1024;
// Upstream is never asked about the same symbol more often than this, no
// matter who asks or how (`refresh=1` included).
const MIN_UPSTREAM_INTERVAL_MS = 15 * 60_000;
// New symbols anyone can add to the cache per window (bounds KV growth).
const NEW_SYMBOL_BUDGET = { limit: 20, windowMs: 15 * 60_000 };
// Symbols nobody has asked for in this long are dropped by the cron job.
const DEMAND_TTL_MS = 30 * 24 * 60 * 60_000;
// Weekdays 22:30 UTC: after the US close, when daily bars are final.
const REFRESH_SCHEDULE = Deno.env.get("STOCKROOM_REFRESH_CRON") ??
  "30 22 * * 1-5";
const MAX_SSE_STREAMS = 500;

const kv = await Deno.openKv(Deno.env.get("STOCKROOM_KV_PATH") || undefined);
const storage = compactingStorage(denoKvAdapter({ kv }), kv);
const syncHandler = await createSyncServer({
  storage,
  models: [HISTORY_MODEL],
  basePath: "/sync",
});

const cache = new Map();
const inflightHistories = new Map();
const upstreamAttempts = new Map();
const demandWrites = new Map();
const rateBuckets = new Map();
let openStreams = 0;

scheduleRefresh();

Deno.serve({ port: PORT }, async (request, info) => {
  const url = new URL(request.url);
  let response;

  try {
    if (request.method === "OPTIONS") {
      response = new Response(null, { status: 204 });
    } else if (url.pathname.startsWith("/sync/")) {
      response = await handleSync(request, url, info);
    } else if (url.pathname.startsWith("/api/")) {
      response = await handleApi(request, url, info);
    } else {
      response = await serveStatic(request, url);
    }
  } catch (error) {
    console.error(error);
    response = json({ error: "Oväntat serverfel" }, { status: 500 });
  }

  return withSecurityHeaders(response, url);
});

/* ---------- routing ---------- */

async function handleApi(request, url, info) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ error: "Metoden stöds inte" }, {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const client = clientKey(request, info);
  if (!allow(`api:${client}`, 300, 60_000)) return tooManyRequests(60);

  if (url.pathname === "/api/quotes") return await handleQuotes(url);
  if (url.pathname === "/api/search") return await handleSearch(url);
  if (url.pathname === "/api/history") {
    if (!allow(`history:${client}`, 60, 60_000)) return tooManyRequests(60);
    return await handleHistory(url);
  }
  return json({ error: "Hittades inte" }, { status: 404 });
}

/**
 * The browser may only *read* the history model: the stream and snapshot
 * routes. Every write goes through `applySyncOp` in-process; a network
 * `POST /sync/:model/ops` is refused before the sync server sees it.
 */
async function handleSync(request, url, info) {
  const [, , model, action] = url.pathname.split("/");
  const readOnly = request.method === "GET" &&
    (action === "stream" || action === "snapshot") &&
    model === HISTORY_MODEL;
  if (!readOnly) {
    return json({ error: "Kurshistoriken kan bara läsas" }, {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  const client = clientKey(request, info);
  if (!allow(`sync:${client}`, 60, 60_000)) return tooManyRequests(60);

  if (action === "stream") {
    if (openStreams >= MAX_SSE_STREAMS) return tooManyRequests(30);
    openStreams += 1;
    request.signal.addEventListener("abort", () => {
      openStreams = Math.max(0, openStreams - 1);
    }, { once: true });
  }

  return await syncHandler(request);
}

/* ---------- market data API ---------- */

async function handleQuotes(url) {
  const symbols = parseSymbols(url.searchParams.get("symbols"));
  if (symbols.length === 0) {
    return json({ quotes: [], errors: [] }, { status: 400 });
  }

  const quoteResults = await Promise.allSettled(
    symbols.map((symbol) =>
      cached(`quote:${symbol}`, 20_000, () => yahooChartQuote(symbol))
    ),
  );

  const quotes = [];
  const errors = [];
  for (let index = 0; index < quoteResults.length; index += 1) {
    const result = quoteResults[index];
    if (result.status === "fulfilled") {
      quotes.push(result.value);
    } else {
      errors.push({
        symbol: symbols[index],
        message: friendlyUpstreamMessage(result.reason, symbols[index]),
      });
    }
  }

  return json({ quotes, errors, provider: "Yahoo Finance chart" }, {
    headers: {
      "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
    },
  });
}

async function handleSearch(url) {
  // deno-lint-ignore no-control-regex
  const query = (url.searchParams.get("q") ?? "").replace(
    /[\u0000-\u001f\u007f]/g,
    "",
  )
    .trim().slice(0, 64);
  if (query.length < 1) return json({ results: [] });

  const results = await cached(
    `search:${query.toUpperCase()}`,
    60_000,
    async () => {
      const endpoint = new URL(
        "https://query1.finance.yahoo.com/v1/finance/search",
      );
      endpoint.searchParams.set("q", query);
      endpoint.searchParams.set("quotesCount", "8");
      endpoint.searchParams.set("newsCount", "0");

      const payload = await fetchJson(endpoint);
      return (payload.quotes ?? [])
        .filter((item) => item.symbol && item.quoteType !== "OPTION")
        .map((item) => ({
          symbol: String(item.symbol).toUpperCase(),
          name: String(item.longname || item.shortname || item.symbol),
          exchange: String(item.exchDisp || item.exchange || ""),
          type: String(item.typeDisp || item.quoteType || ""),
          sector: String(item.sector || ""),
        }));
    },
  );

  return json({ results }, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}

/**
 * GET /api/history?symbol=AAPL[&refresh=1]
 *
 * Returns the cached row for the symbol and registers demand for it so the
 * nightly cron job keeps it fresh. Upstream is only contacted for symbols
 * that are not cached yet (or when `refresh=1` is passed and the cached row
 * is older than fifteen minutes), never more often than once every fifteen
 * minutes per symbol.
 */
async function handleHistory(url) {
  const symbol = normalizeSymbol(url.searchParams.get("symbol"));
  if (!symbol) return json({ error: "Symbol saknas" }, { status: 400 });

  try {
    const result = await ensureHistoryRow(symbol, {
      refresh: url.searchParams.get("refresh") === "1",
    });
    return json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return tooManyRequests(error.retryAfter);
    }
    const status = error instanceof UpstreamError && error.status === 404
      ? 404
      : 502;
    return json({ error: friendlyUpstreamMessage(error, symbol) }, { status });
  }
}

async function ensureHistoryRow(symbol, options = {}) {
  const existing = await storage.get(SYNC_SCOPE, HISTORY_MODEL, symbol);
  const live = existing && !existing.deletedAt ? existing : null;
  await recordDemand(symbol);

  if (live) {
    const wantsRefresh = options.refresh && canContactUpstream(symbol, live);
    if (!wantsRefresh) {
      return {
        symbol,
        row: live,
        cursor: await storage.currentCursor(SYNC_SCOPE, HISTORY_MODEL),
        refreshed: false,
        throttled: Boolean(options.refresh),
      };
    }
    return await refreshHistoryRow(symbol, live);
  }

  if (!canContactUpstream(symbol, null)) {
    throw new RateLimitError(
      `${symbol} har nyss hämtats eller misslyckats; försök igen om en stund.`,
      300,
    );
  }
  if (
    !allow(
      "upstream:new-symbols",
      NEW_SYMBOL_BUDGET.limit,
      NEW_SYMBOL_BUDGET.windowMs,
    )
  ) {
    throw new RateLimitError(
      "Många nya symboler har lagts till nyss; försök igen om några minuter.",
      300,
    );
  }
  return await refreshHistoryRow(symbol, null);
}

/** Fetch from upstream and write the row through the sync server. */
function refreshHistoryRow(symbol, live) {
  if (inflightHistories.has(symbol)) return inflightHistories.get(symbol);

  const task = (async () => {
    upstreamAttempts.set(symbol, Date.now());
    try {
      const data = await yahooSeries(symbol);
      const result = await applySyncOp(
        HISTORY_MODEL,
        symbol,
        live ? { type: "update", patch: data } : { type: "create", data },
      );
      return {
        symbol,
        row: result.row,
        cursor: result.cursor,
        refreshed: true,
        throttled: false,
      };
    } catch (error) {
      if (!live) throw error;
      console.warn(`Kurshistorik för ${symbol}: ${error.message}`);
      return {
        symbol,
        row: live,
        cursor: await storage.currentCursor(SYNC_SCOPE, HISTORY_MODEL),
        refreshed: false,
        throttled: false,
        stale: true,
      };
    } finally {
      inflightHistories.delete(symbol);
    }
  })();

  inflightHistories.set(symbol, task);
  return task;
}

function canContactUpstream(symbol, live) {
  const lastAttempt = upstreamAttempts.get(symbol) ?? 0;
  const lastUpdate = live ? Date.parse(live.data?.updatedAt ?? "") || 0 : 0;
  return Date.now() - Math.max(lastAttempt, lastUpdate) >=
    MIN_UPSTREAM_INTERVAL_MS;
}

/** Remember that someone wants this symbol (at most one KV write per hour). */
async function recordDemand(symbol) {
  const last = demandWrites.get(symbol) ?? 0;
  if (Date.now() - last < 60 * 60_000) return;
  demandWrites.set(symbol, Date.now());
  await kv.set(["stockroom", "demand", symbol], { at: Date.now() }, {
    expireIn: DEMAND_TTL_MS,
  });
}

async function isDemanded(symbol) {
  const entry = await kv.get(["stockroom", "demand", symbol]);
  return Boolean(entry.value);
}

/**
 * Scheduled refresh of every cached symbol. Runs after the US close on
 * weekdays so daily bars are final; intraday the browser lays the live quote
 * over the last bar instead. Symbols without recent demand are removed.
 */
function scheduleRefresh() {
  if (typeof Deno.cron !== "function") {
    console.warn(
      "Deno.cron saknas – kurshistoriken uppdateras var 12:e timme.",
    );
    setInterval(() => void refreshAllHistories(), 12 * 60 * 60_000);
    return;
  }
  Deno.cron("refresh-price-histories", REFRESH_SCHEDULE, () => {
    return refreshAllHistories();
  });
  console.log(`Kurshistorik uppdateras enligt "${REFRESH_SCHEDULE}" (UTC).`);
}

async function refreshAllHistories() {
  const rows = [];
  for await (const row of storage.list(SYNC_SCOPE, HISTORY_MODEL)) {
    rows.push(row);
  }
  console.log(`Uppdaterar kurshistorik för ${rows.length} symboler...`);

  let refreshed = 0;
  let removed = 0;
  for (const row of rows) {
    const symbol = row.id;
    try {
      if (!(await isDemanded(symbol))) {
        await pruneHistoryRow(symbol);
        removed += 1;
        continue;
      }
      const age = Date.now() - (Date.parse(row.data?.updatedAt ?? "") || 0);
      if (age < MIN_UPSTREAM_INTERVAL_MS) continue;
      const result = await refreshHistoryRow(symbol, row);
      if (result.refreshed) refreshed += 1;
    } catch (error) {
      console.warn(`Kunde inte uppdatera ${symbol}: ${error.message}`);
    }
    // Be gentle with upstream.
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  console.log(
    `Kurshistorik klar: ${refreshed} uppdaterade, ${removed} borttagna.`,
  );
}

/**
 * Remove a symbol nobody has asked for in 30 days. The delete goes through
 * the sync server so connected browsers drop the row too; the tombstone the
 * library keeps still carries the full data, so it is slimmed down afterwards
 * to actually free the KV space (clients catching up later still see it).
 */
async function pruneHistoryRow(symbol) {
  const result = await applySyncOp(HISTORY_MODEL, symbol, { type: "delete" });
  const tombstone = result.row;
  if (!tombstone?.deletedAt) return;

  const slim = { ...tombstone, data: {}, fieldTs: {} };
  await kv.set(["bedrockjs", SYNC_SCOPE, HISTORY_MODEL, "row", symbol], slim);
  if (Number.isFinite(tombstone.rev)) {
    await kv.set(
      ["bedrockjs", SYNC_SCOPE, HISTORY_MODEL, "log", tombstone.rev],
      slim,
    );
  }
  demandWrites.delete(symbol);
  upstreamAttempts.delete(symbol);
}

/** Apply one mutation through the sync server (stores + broadcasts). */
async function applySyncOp(model, id, op) {
  const request = new Request(
    `http://stockroom.internal/sync/${encodeURIComponent(model)}/ops`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        protocol: PROTOCOL_VERSION,
        ops: [{
          opId: crypto.randomUUID(),
          model,
          id,
          clientTs: Date.now(),
          ...op,
        }],
      }),
    },
  );
  const response = await syncHandler(request);
  const payload = await response.json();
  const result = payload.results?.[0];
  if (!response.ok || !result || result.status === "rejected") {
    throw new Error(
      result?.error ?? payload.error ?? "Synkroniseringen avvisade ändringen",
    );
  }
  return result;
}

/**
 * The Deno KV adapter appends every change to a log that is replayed to new
 * clients. History rows are rewritten regularly, so drop the previous log
 * entry of a row once a newer one exists: clients catching up still get the
 * latest version of every row, and KV does not grow without bound.
 */
function compactingStorage(base, kvInstance) {
  return {
    ...base,
    async appendChange(scope, model, row) {
      const previous = await base.get(scope, model, row.id);
      const cursor = await base.appendChange(scope, model, row);
      if (previous?.rev && previous.rev !== cursor) {
        await kvInstance.delete([
          "bedrockjs",
          scope,
          model,
          "log",
          previous.rev,
        ]);
      }
      return cursor;
    },
  };
}

/** Compact daily closes for a symbol: `[[date, close], ...]` as JSON. */
async function yahooSeries(symbol) {
  const payload = await yahooChart(symbol, HISTORY_RANGE, HISTORY_INTERVAL);
  const chart = firstChart(payload, symbol);
  const meta = chart.meta ?? {};
  const closes = chart.indicators?.quote?.[0]?.close ?? [];
  const timestamps = chart.timestamp ?? [];

  const points = [];
  for (let index = 0; index < timestamps.length; index += 1) {
    const close = finite(closes[index]);
    if (!Number.isFinite(close) || close <= 0) continue;
    const date = new Date(timestamps[index] * 1000).toISOString().slice(0, 10);
    const rounded = Math.round(close * 10_000) / 10_000;
    if (points.length && points.at(-1)[0] === date) {
      points[points.length - 1][1] = rounded;
    } else {
      points.push([date, rounded]);
    }
  }
  if (points.length === 0) {
    throw new UpstreamError(
      `Ingen kurshistorik returnerades för ${symbol}`,
      404,
    );
  }

  let encoded = JSON.stringify(points);
  while (encoded.length > MAX_POINTS_JSON_BYTES && points.length > 50) {
    points.splice(0, Math.ceil(points.length * 0.1));
    encoded = JSON.stringify(points);
  }

  return {
    symbol: String(meta.symbol || symbol).toUpperCase().slice(0, 24),
    name: String(meta.longName || meta.shortName || meta.symbol || symbol)
      .slice(0, 120),
    currency: String(meta.currency || "").slice(0, 8),
    interval: HISTORY_INTERVAL,
    from: points[0][0],
    to: points.at(-1)[0],
    count: points.length,
    points: encoded,
    updatedAt: new Date().toISOString(),
    source: "Yahoo Finance chart",
  };
}

async function yahooChartQuote(symbol) {
  const payload = await yahooChart(symbol, "5d", "1d");
  const chart = firstChart(payload, symbol);
  const meta = chart.meta ?? {};
  const quote = chart.indicators?.quote?.[0] ?? {};
  const closes = (quote.close ?? []).filter((value) => Number.isFinite(value));

  const price = finite(meta.regularMarketPrice) ?? closes.at(-1);
  const previousClose = closes.length >= 2
    ? closes.at(-2)
    : finite(meta.chartPreviousClose) ?? price;
  if (!Number.isFinite(price)) {
    throw new UpstreamError(`Ingen kurs returnerades för ${symbol}`, 404);
  }

  const change = Number.isFinite(previousClose) ? price - previousClose : 0;
  const changePercent = previousClose ? change / previousClose * 100 : 0;

  return {
    symbol: String(meta.symbol || symbol).toUpperCase().slice(0, 24),
    name: String(meta.longName || meta.shortName || meta.symbol || symbol)
      .slice(0, 120),
    price,
    previousClose,
    change,
    changePercent,
    currency: String(meta.currency || "USD").slice(0, 8),
    exchange: String(meta.fullExchangeName || meta.exchangeName || "").slice(
      0,
      80,
    ),
    marketTime: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
    dayHigh: finite(meta.regularMarketDayHigh),
    dayLow: finite(meta.regularMarketDayLow),
    fiftyTwoWeekHigh: finite(meta.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: finite(meta.fiftyTwoWeekLow),
    volume: finite(meta.regularMarketVolume),
    source: "Yahoo Finance chart",
  };
}

async function yahooChart(symbol, range, interval) {
  const endpoint = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${
      encodeURIComponent(symbol)
    }`,
  );
  endpoint.searchParams.set("range", range);
  endpoint.searchParams.set("interval", interval);
  return await fetchJson(endpoint);
}

function firstChart(payload, symbol) {
  const error = payload.chart?.error;
  if (error) {
    throw new UpstreamError(
      `Hittade ingen marknadsdata för ${symbol}`,
      404,
    );
  }

  const chart = payload.chart?.result?.[0];
  if (!chart) {
    throw new UpstreamError(`Hittade ingen marknadsdata för ${symbol}`, 404);
  }
  return chart;
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError";
    throw new UpstreamError(
      timedOut
        ? "Marknadsdata svarade inte i tid"
        : "Marknadsdata kunde inte nås",
      timedOut ? 504 : 502,
    );
  }

  const text = await response.text();
  if (!response.ok) {
    // Yahoo answers 404 with a JSON error body for unknown symbols.
    throw new UpstreamError(
      response.status === 404
        ? "Hittade ingen marknadsdata"
        : "Marknadsdata är inte tillgänglig just nu",
      response.status === 404 ? 404 : 502,
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new UpstreamError("Marknadsdata är inte tillgänglig just nu", 502);
  }
}

class UpstreamError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
  }
}

class RateLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

function friendlyUpstreamMessage(error, symbol) {
  if (error instanceof UpstreamError) {
    return error.status === 404
      ? `Hittade ingen marknadsdata för ${symbol}`
      : error.message;
  }
  console.error(error);
  return "Marknadsdata är inte tillgänglig just nu";
}

/* ---------- static files ---------- */

async function serveStatic(request, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Metoden stöds inte", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const resolved = resolvePublicPath(url.pathname);
  if (!resolved) return notFound();

  const file = await readPublicFile(resolved.fileUrl);
  if (file) return fileResponse(file, resolved.extension);

  // Client-side routes (/holdings/AAPL, /settings, ...) fall back to the app
  // shell; anything that looks like a file name does not.
  if (!resolved.extension) {
    const index = resolvePublicPath("/index.html");
    const shell = index ? await readPublicFile(index.fileUrl) : null;
    if (shell) return fileResponse(shell, ".html");
  }
  return notFound();
}

/**
 * Map a request path to a file inside `public/`. The path is percent-decoded
 * first and split into segments so encoded slashes and dots can not escape
 * the directory; hidden files and unknown extensions are never served.
 */
function resolvePublicPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0") || decoded.includes("\\")) return null;

  const segments = decoded === "/"
    ? ["index.html"]
    : decoded.split("/").filter((segment) => segment.length > 0);
  if (segments.length === 0 || segments.length > 16) return null;
  if (segments.some((segment) => segment === ".." || segment.startsWith("."))) {
    return null;
  }

  const extension = extensionOf(segments.at(-1));
  if (extension && !(extension in MIME_TYPES)) return null;

  const fileUrl = new URL(
    segments.map(encodeURIComponent).join("/"),
    PUBLIC_DIR,
  );
  if (!fileUrl.href.startsWith(PUBLIC_DIR.href)) return null;
  return { fileUrl, extension };
}

async function readPublicFile(fileUrl) {
  try {
    const stat = await Deno.stat(fileUrl);
    if (!stat.isFile) return null;
    return await Deno.readFile(fileUrl);
  } catch (error) {
    if (
      error instanceof Deno.errors.NotFound ||
      error instanceof Deno.errors.PermissionDenied ||
      error instanceof Deno.errors.NotADirectory
    ) {
      return null;
    }
    throw error;
  }
}

function fileResponse(file, extension) {
  return new Response(file, {
    headers: {
      "Content-Type": MIME_TYPES[extension] ?? MIME_TYPES[".html"],
      "Cache-Control": extension === ".js" || extension === ".map"
        ? "public, max-age=60"
        : extension === ".html"
        ? "no-cache"
        : "public, max-age=300",
    },
  });
}

function notFound() {
  return new Response("Hittades inte", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/* ---------- helpers ---------- */

async function cached(key, ttlMs, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.createdAt < ttlMs) return hit.value;

  const value = await loader();
  cache.set(key, { value, createdAt: Date.now() });
  if (cache.size > 500) {
    for (const [entryKey, entry] of cache) {
      if (cache.size <= 400) break;
      if (Date.now() - entry.createdAt >= ttlMs || entryKey !== key) {
        cache.delete(entryKey);
      }
    }
  }
  return value;
}

/** Fixed-window rate limiter keyed by caller; bounded memory. */
function allow(key, limit, windowMs) {
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.start >= windowMs) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;

  if (rateBuckets.size > 10_000) {
    for (const [bucketKey, entry] of rateBuckets) {
      if (now - entry.start >= windowMs) rateBuckets.delete(bucketKey);
    }
  }
  return bucket.count <= limit;
}

function clientKey(request, info) {
  const remote = info?.remoteAddr;
  if (remote && remote.transport === "tcp" && remote.hostname) {
    return remote.hostname;
  }
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";
}

function tooManyRequests(retryAfterSeconds) {
  return json({ error: "För många förfrågningar, försök igen om en stund." }, {
    status: 429,
    headers: { "Retry-After": String(retryAfterSeconds) },
  });
}

function withSecurityHeaders(response, url) {
  const headers = response.headers;
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (url.protocol === "https:") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  if ((headers.get("Content-Type") ?? "").startsWith("text/html")) {
    headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' https://rendly.stream",
        "connect-src 'self' https://rendly.stream",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join("; "),
    );
  }
  return response;
}

function parseSymbols(value) {
  return [
    ...new Set(
      (value ?? "")
        .split(",")
        .map(normalizeSymbol)
        .filter(Boolean),
    ),
  ]
    .slice(0, 40);
}

function normalizeSymbol(value) {
  const symbol = String(value ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9.^=_-]{1,24}$/.test(symbol)) return "";
  return symbol;
}

function finite(value) {
  // Yahoo sends `null` for bars without data; Number(null) is 0, which would
  // otherwise turn a missing bar into a "price dropped to zero" point.
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function extensionOf(fileName) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(index).toLowerCase() : "";
}

function json(body, init = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}
