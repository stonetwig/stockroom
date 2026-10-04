import { t, translateServerError } from "./i18n.js";

const REQUEST_TIMEOUT_MS = 12_000;

export function normalizeSymbol(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export async function fetchQuotes(symbols) {
  const cleanSymbols = [
    ...new Set(symbols.map(normalizeSymbol).filter(Boolean)),
  ];
  if (cleanSymbols.length === 0) return { quotes: [], errors: [] };

  return await getJson(
    `/api/quotes?symbols=${encodeURIComponent(cleanSymbols.join(","))}`,
  );
}

export async function searchSymbols(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const payload = await getJson(
    `/api/search?q=${encodeURIComponent(cleanQuery)}`,
  );
  return payload.results ?? [];
}

async function getJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        translateServerError(
          parseJson(text),
          t("errors.requestFailed", { status: String(response.status) }),
        ),
      );
    }
    return JSON.parse(text);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(t("errors.timeout"));
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
