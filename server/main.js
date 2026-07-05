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

const cache = new Map();

Deno.serve({ port: PORT }, async (request) => {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: apiHeaders() });
  }

  try {
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

async function handleHistory(url) {
  const symbol = normalizeSymbol(url.searchParams.get("symbol"));
  if (!symbol) return json({ error: "Symbol saknas" }, { status: 400 });

  const range = sanitizeChoice(url.searchParams.get("range"), [
    "1mo",
    "3mo",
    "6mo",
    "1y",
    "2y",
    "5y",
  ], "6mo");
  const interval = sanitizeChoice(url.searchParams.get("interval"), [
    "1d",
    "1wk",
    "1mo",
  ], "1d");

  const history = await cached(
    `history:${symbol}:${range}:${interval}`,
    10 * 60_000,
    () => yahooHistory(symbol, range, interval),
  );

  return json(history, {
    headers: {
      "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
    },
  });
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

async function yahooHistory(symbol, range, interval) {
  const payload = await yahooChart(symbol, range, interval);
  const chart = firstChart(payload, symbol);
  const quote = chart.indicators?.quote?.[0] ?? {};
  const timestamps = chart.timestamp ?? [];

  const points = timestamps.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    open: finite(quote.open?.[index]),
    high: finite(quote.high?.[index]),
    low: finite(quote.low?.[index]),
    close: finite(quote.close?.[index]),
    volume: finite(quote.volume?.[index]),
  })).filter((point) => Number.isFinite(point.close));

  return {
    symbol: String(chart.meta?.symbol || symbol).toUpperCase(),
    range,
    interval,
    points,
    updatedAt: new Date().toISOString(),
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

function sanitizeChoice(value, choices, fallback) {
  return choices.includes(value) ? value : fallback;
}

function finite(value) {
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
