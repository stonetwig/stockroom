/**
 * Server-synced price history.
 *
 * The server keeps one row per symbol in Deno KV (a compact five year daily
 * series) and streams changes to every client over the BedrockJS sync layer
 * (SSE + IndexedDB). The browser never stores histories itself any more: it
 * asks the server to make sure a symbol is cached (`ensureHistory`) and reads
 * the reactive synced model (`historySeries`).
 */
import { createSyncClient, defineSyncedModel } from "@rendly/bedrockjs/sync";
import { normalizeSymbol } from "./market.js";

export const HISTORY_MODEL = "history";
const SYNC_DB_NAME = "stockroom-sync";
const REQUEST_TTL_MS = 5 * 60_000;

const client = createSyncClient({ baseUrl: "/sync" });

// Keep the per-model hooks the library registers so a freshly fetched row
// can be applied locally even when the SSE stream is blocked or not yet open.
const hooksByModel = new Map();
const registerModel = client.registerModel.bind(client);
client.registerModel = (name, hooks) => {
  hooksByModel.set(name, hooks);
  registerModel(name, hooks);
};

export const History = defineSyncedModel(HISTORY_MODEL, {
  fields: {
    id: "string",
    rev: "number",
    symbol: "string",
    name: "string",
    currency: "string",
    interval: "string",
    from: "string",
    to: "string",
    count: "number",
    // JSON string of [[date, close], ...] – keeps rows small (Deno KV values
    // are limited to 64 KiB) and independent of the sync schema kinds.
    points: "string",
    updatedAt: "datetime",
    source: "string",
  },
}, { client, dbName: SYNC_DB_NAME });

if (typeof window !== "undefined") client.start();

const requests = new Map();

/**
 * Ask the server to have `symbol` cached in KV. Resolves with the server's
 * answer; the row itself arrives through the sync stream (and is also applied
 * from the response, idempotently, as a fallback).
 */
export function ensureHistory(symbol, options = {}) {
  const key = normalizeSymbol(symbol);
  if (!key) return Promise.reject(new Error("Symbol saknas"));

  const pending = requests.get(key);
  const maxAgeMs = options.maxAgeMs ?? REQUEST_TTL_MS;
  if (pending && !options.refresh && Date.now() - pending.at < maxAgeMs) {
    return pending.promise;
  }

  const promise = (async () => {
    const params = new URLSearchParams({ symbol: key });
    if (options.refresh) params.set("refresh", "1");
    const response = await fetch(`/api/history?${params}`, {
      headers: { Accept: "application/json" },
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        errorMessage(text) ??
          `Kurshistorik för ${key} kunde inte hämtas (${response.status})`,
      );
    }

    const payload = JSON.parse(text);
    if (payload.row) {
      // Cursor 0 on purpose: never advance the stream cursor from here, so
      // the SSE catch-up still delivers anything we have not seen.
      await hooksByModel.get(HISTORY_MODEL)?.onServerRow(payload.row, 0);
    }
    return payload;
  })();

  requests.set(key, { at: Date.now(), promise });
  promise.catch(() => {
    if (requests.get(key)?.promise === promise) requests.delete(key);
  });
  return promise;
}

const parsedSeries = new Map();

/**
 * The synced series for a symbol as `{ points: [{ date, close }] }` in the
 * instrument's own (raw) units, or null when nothing is cached yet. Reads the
 * reactive model, so components re-render when the row changes.
 */
export function historySeries(symbol) {
  const key = normalizeSymbol(symbol);
  const row = History.get(key);
  if (!row) return null;

  const json = row.points;
  if (typeof json !== "string") return null;

  let entry = parsedSeries.get(key);
  if (!entry || entry.source !== json) {
    entry = { source: json, points: parsePoints(json) };
    parsedSeries.set(key, entry);
  }

  return {
    symbol: row.symbol ?? key,
    name: row.name ?? "",
    currency: row.currency ?? "",
    interval: row.interval ?? "1d",
    updatedAt: row.updatedAt ?? "",
    source: row.source ?? "",
    points: entry.points,
  };
}

export const RANGE_DAYS = {
  "1mo": 31,
  "3mo": 92,
  "6mo": 183,
  "1y": 366,
  "2y": 731,
  "5y": Infinity,
};

/** Slice a daily series to the last `range` (same names as Yahoo ranges). */
export function pointsInRange(points, range) {
  const days = RANGE_DAYS[range] ?? RANGE_DAYS["6mo"];
  if (!Number.isFinite(days)) return points;
  const from = new Date(Date.now() - days * 86_400_000).toISOString()
    .slice(0, 10);
  return points.filter((point) => point.date >= from);
}

/**
 * Overlay the live quote on a daily series: today's bar becomes the latest
 * price (or is appended when the cached series ends yesterday). `scale`
 * converts the quote back into the series' raw units (e.g. pence).
 */
export function withLiveQuote(points, quote, scale = 1) {
  const price = Number(quote?.price);
  if (!Number.isFinite(price) || price <= 0 || points.length === 0) {
    return points;
  }
  const marketDate = quote.marketTime
    ? String(quote.marketTime).slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const last = points.at(-1);
  if (!last || marketDate < last.date) return points;

  const live = { date: marketDate, close: price * scale };
  return marketDate === last.date
    ? [...points.slice(0, -1), live]
    : [...points, live];
}

function parsePoints(json) {
  try {
    const raw = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) =>
        Array.isArray(item)
          ? { date: String(item[0]), close: Number(item[1]) }
          : { date: String(item?.date ?? ""), close: Number(item?.close) }
      )
      .filter((point) =>
        point.date && Number.isFinite(point.close) && point.close > 0
      );
  } catch {
    return [];
  }
}

function errorMessage(text) {
  try {
    const parsed = JSON.parse(text);
    return typeof parsed?.error === "string" ? parsed.error : null;
  } catch {
    return text || null;
  }
}
