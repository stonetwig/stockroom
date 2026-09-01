import { createSyncServer } from "./sync/server.ts";
import { denoKvAdapter } from "./sync/deno-kv.ts";
import { PROTOCOL_VERSION } from "./sync/protocol.ts";

const PUBLIC_DIR = new URL("../public/", import.meta.url);
const PORT = Number(Deno.env.get("PORT") ?? "8000");
const USER_AGENT =
  "Mozilla/5.0 (compatible; LocalPortfolio/1.0; +https://deno.com/deploy)";

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
/* Price history: cached in Deno KV, synced to browsers via BedrockJS sync   */
/* ------------------------------------------------------------------------ */

const HISTORY_MODEL = "history";
const HISTORY_RANGE = "5y";
const HISTORY_INTERVAL = "1d";
// A daily series only really changes once per trading day; the browser lays
// the live quote over the last bar, so a few hours of staleness is fine.
const HISTORY_TTL_MS = 6 * 60 * 60 * 1000;
// Deno KV values are capped at 64 KiB; leave headroom for the row envelope.
const MAX_POINTS_JSON_BYTES = 56 * 1024;
const SYNC_SCOPE = "";

const kv = await Deno.openKv(Deno.env.get("STOCKROOM_KV_PATH") || undefined);
const storage = compactingStorage(denoKvAdapter({ kv }), kv);
const syncHandler = await createSyncServer({
  storage,
  models: [HISTORY_MODEL],
  basePath: "/sync",
});

const cache = new Map();
const inflightHistories = new Map();

Deno.serve({ port: PORT }, async (request) => {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: apiHeaders() });
  }

  try {
    if (url.pathname.startsWith("/sync/")) return await syncHandler(request);
    if (url.pathname === "/api/quotes") return await handleQuotes(url);
    if (url.pathname === "/api/search") return await handleSearch(url);
    if (url.pathname === "/api/history") return await handleHistory(url);

    return await serveStatic(url);
  } catch (error) {
    console.error(error);
    return json(
      { error: error.message || "Oväntat serverfel" },
      { status: 500 },
    );
  }
});

async function handleQuotes(url) {
  const symbols = parseSymbols(url.searchParams.get("symbols"));
  if (symbols.length === 0) {
    return json({ quotes: [], errors: [] }, { status: 400 });
  }

  const quoteResults = await Promise.allSettled(
    symbols.slice(0, 40).map((symbol) =>
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
        message: result.reason?.message ?? "Kursen är inte tillgänglig",
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
  const query = (url.searchParams.get("q") ?? "").trim();
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
          name: item.longname || item.shortname || item.symbol,
          exchange: item.exchDisp || item.exchange || "",
          type: item.typeDisp || item.quoteType || "",
          sector: item.sector || "",
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
 * Makes sure the symbol's five year daily series is cached in Deno KV and
 * returns the synced row. Writing the row goes through the sync server, so
 * every connected browser receives it over SSE at the same time.
 */
async function handleHistory(url) {
  const symbol = normalizeSymbol(url.searchParams.get("symbol"));
  if (!symbol) return json({ error: "Symbol saknas" }, { status: 400 });

  const result = await ensureHistoryRow(symbol, {
    refresh: url.searchParams.get("refresh") === "1",
  });
  return json(result, { headers: { "Cache-Control": "no-store" } });
}

async function ensureHistoryRow(symbol, options = {}) {
  const existing = await storage.get(SYNC_SCOPE, HISTORY_MODEL, symbol);
  const live = existing && !existing.deletedAt ? existing : null;
  const ageMs = live
    ? Date.now() - (Date.parse(live.data?.updatedAt ?? "") || 0)
    : Infinity;

  if (live && !options.refresh && ageMs < HISTORY_TTL_MS) {
    return {
      symbol,
      row: live,
      cursor: await storage.currentCursor(SYNC_SCOPE, HISTORY_MODEL),
      refreshed: false,
      stale: false,
    };
  }

  if (inflightHistories.has(symbol)) return inflightHistories.get(symbol);

  const task = (async () => {
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
        stale: false,
      };
    } catch (error) {
      if (!live) throw error;
      console.warn(`Kurshistorik för ${symbol}: ${error.message}`);
      return {
        symbol,
        row: live,
        cursor: await storage.currentCursor(SYNC_SCOPE, HISTORY_MODEL),
        refreshed: false,
        stale: true,
        error: error.message,
      };
    } finally {
      inflightHistories.delete(symbol);
    }
  })();

  inflightHistories.set(symbol, task);
  return task;
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
 * clients. History rows are rewritten a few times a day, so drop the previous
 * log entry of a row once a newer one exists: clients catching up still get
 * the latest version of every row, and KV does not grow without bound.
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
    throw new Error(`Ingen kurshistorik returnerades för ${symbol}`);
  }

  let encoded = JSON.stringify(points);
  while (encoded.length > MAX_POINTS_JSON_BYTES && points.length > 50) {
    points.splice(0, Math.ceil(points.length * 0.1));
    encoded = JSON.stringify(points);
  }

  return {
    symbol: String(meta.symbol || symbol).toUpperCase(),
    name: meta.longName || meta.shortName ||
      String(meta.symbol || symbol).toUpperCase(),
    currency: meta.currency || "",
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
    throw new Error(`Ingen kurs returnerades för ${symbol}`);
  }

  const change = Number.isFinite(previousClose) ? price - previousClose : 0;
  const changePercent = previousClose ? change / previousClose * 100 : 0;

  return {
    symbol: String(meta.symbol || symbol).toUpperCase(),
    name: meta.longName || meta.shortName ||
      String(meta.symbol || symbol).toUpperCase(),
    price,
    previousClose,
    change,
    changePercent,
    currency: meta.currency || "USD",
    exchange: meta.fullExchangeName || meta.exchangeName || "",
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
    throw new Error(
      error.description || `Marknadsdata är inte tillgänglig för ${symbol}`,
    );
  }

  const chart = payload.chart?.result?.[0];
  if (!chart) throw new Error(`Marknadsdata är inte tillgänglig för ${symbol}`);
  return chart;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `${url.hostname} returnerade ${response.status}: ${text.slice(0, 160)}`,
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${url.hostname} returnerade data som inte är JSON`);
  }
}

async function serveStatic(url) {
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const fileUrl = new URL(`.${pathname}`, PUBLIC_DIR);

  if (!fileUrl.href.startsWith(PUBLIC_DIR.href)) {
    return new Response("Hittades inte", { status: 404 });
  }

  try {
    const file = await Deno.readFile(fileUrl);
    return new Response(file, {
      headers: {
        "Content-Type": MIME_TYPES[extension(pathname)] ??
          "application/octet-stream",
        "Cache-Control": pathname.includes("app.js")
          ? "public, max-age=60"
          : "public, max-age=300",
      },
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound && !pathname.includes(".")) {
      return await serveStatic(new URL("/", url));
    }
    if (error instanceof Deno.errors.NotFound) {
      return new Response("Hittades inte", { status: 404 });
    }
    throw error;
  }
}

async function cached(key, ttlMs, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.createdAt < ttlMs) return hit.value;

  const value = await loader();
  cache.set(key, { value, createdAt: Date.now() });
  return value;
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

function extension(pathname) {
  const index = pathname.lastIndexOf(".");
  return index >= 0 ? pathname.slice(index) : "";
}

function json(body, init = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      ...apiHeaders(),
      ...(init.headers ?? {}),
    },
  });
}

function apiHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
