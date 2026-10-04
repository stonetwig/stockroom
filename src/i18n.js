/**
 * UI translations for the 24 official EU languages.
 *
 * Swedish is the default and ships inside the bundle; every other catalog is
 * fetched from `/locales/<code>.json` the first time it is needed. A language
 * the user picks is remembered in localStorage; otherwise the browser's
 * preferred languages decide, and Swedish is used when none of them match.
 *
 * `t()` reads the reactive current language, so every component that renders
 * text re-renders by itself when the language changes.
 */
import { reactive } from "@rendly/bedrockjs";
import sv from "../public/locales/sv.json" with { type: "json" };
import { DEFAULT_LANGUAGE, LANGUAGES } from "./languages.js";
import { setFormatLocale } from "./math.js";

const STORAGE_KEY = "stockroom.language";
// How long the first render waits for another language's catalog before it
// shows Swedish (and switches as soon as the catalog arrives).
const FIRST_RENDER_WAIT_MS = 2_500;
const FETCH_TIMEOUT_MS = 10_000;
const PLACEHOLDER = /\{(\w+)\}/g;

const BY_CODE = new Map(LANGUAGES.map((language) => [language.code, language]));
const catalogs = new Map([[DEFAULT_LANGUAGE, sv]]);
const loads = new Map();
const i18n = reactive({ language: DEFAULT_LANGUAGE, ready: false });

// The language most recently asked for; a slower load of an earlier choice
// must not override it.
let wanted = DEFAULT_LANGUAGE;
let pluralRules = new Intl.PluralRules(BY_CODE.get(DEFAULT_LANGUAGE).locale);
let numberFormat = new Intl.NumberFormat(BY_CODE.get(DEFAULT_LANGUAGE).locale);

/**
 * Pick the starting language and begin loading it. Call once, before the
 * first render; `languageReady()` turns true when the catalog is in place.
 */
export function initLanguage() {
  const code = savedLanguage() ?? browserLanguage() ?? DEFAULT_LANGUAGE;
  apply(DEFAULT_LANGUAGE);
  if (code === DEFAULT_LANGUAGE) {
    i18n.ready = true;
    return Promise.resolve();
  }

  const wait = setTimeout(() => i18n.ready = true, FIRST_RENDER_WAIT_MS);
  return switchTo(code)
    .catch((error) => {
      console.warn(`Stockroom: kunde inte ladda språket ${code}.`, error);
    })
    .finally(() => {
      clearTimeout(wait);
      i18n.ready = true;
    });
}

/** Switch to `code` and remember the choice. Rejects if it cannot load. */
export function setLanguage(code) {
  if (!BY_CODE.has(code)) {
    return Promise.reject(new Error(`Unknown language: ${code}`));
  }
  return switchTo(code, { remember: true });
}

export function currentLanguage() {
  return i18n.language;
}

/** False only while the first render waits for a downloaded catalog. */
export function languageReady() {
  return i18n.ready;
}

export function languageName(code) {
  return BY_CODE.get(code)?.name ?? code;
}

/**
 * Translate `key`. `{name}` placeholders are filled from `params` (numbers
 * are formatted for the current locale); plural messages pick their form
 * from `params.count`. Keys missing in a catalog fall back to Swedish.
 */
export function t(key, params) {
  const catalog = catalogs.get(i18n.language) ?? sv;
  let message = Object.hasOwn(catalog, key) ? catalog[key] : sv[key];
  if (message === undefined) return key;

  if (typeof message === "object" && message !== null) {
    const count = Number(params?.count);
    message = message[pluralRules.select(Number.isFinite(count) ? count : 0)] ??
      message.other ?? "";
  }
  return params ? interpolate(message, params) : message;
}

/**
 * Text for an error the server reported as `{ code, error | message, symbol }`.
 * Known codes are translated; anything else falls back to the server's own
 * (Swedish) text and then to `fallback`.
 */
export function translateServerError(payload, fallback = "") {
  const key = `server.${payload?.code}`;
  if (typeof payload?.code === "string" && Object.hasOwn(sv, key)) {
    return t(key, { symbol: String(payload.symbol ?? "") });
  }
  const text = payload?.error ?? payload?.message;
  return typeof text === "string" && text ? text : fallback;
}

async function switchTo(code, { remember = false } = {}) {
  wanted = code;
  await loadCatalog(code);
  if (wanted !== code) return;
  if (remember) saveLanguage(code);
  apply(code);
}

function apply(code) {
  const language = BY_CODE.get(code);
  const locale = formatLocale(language);
  setFormatLocale(locale);
  numberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  // Plural forms follow the translation (pt-PT), not the browser's region.
  pluralRules = new Intl.PluralRules(language.locale, {
    maximumFractionDigits: 4,
  });

  i18n.language = code;
  document.documentElement.lang = code;
  document.querySelector('meta[name="description"]')
    ?.setAttribute("content", t("app.metaDescription"));
}

function interpolate(message, params) {
  return message.replace(PLACEHOLDER, (match, name) => {
    if (!Object.hasOwn(params, name)) return match;
    const value = params[name];
    return typeof value === "number"
      ? numberFormat.format(value)
      : String(value ?? "");
  });
}

function loadCatalog(code) {
  if (catalogs.has(code)) return Promise.resolve();
  let load = loads.get(code);
  if (!load) {
    load = fetchCatalog(code)
      .then((messages) => {
        catalogs.set(code, messages);
      })
      .finally(() => loads.delete(code));
    loads.set(code, load);
  }
  return load;
}

async function fetchCatalog(code) {
  const response = await fetch(`/locales/${code}.json`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout?.(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Catalog ${code} answered ${response.status}`);
  }
  const messages = await response.json();
  if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
    throw new Error(`Catalog ${code} is not an object`);
  }
  return messages;
}

/**
 * Locale for numbers and dates: the browser's own regional variant when it
 * asks for this language (de-AT, en-US …), otherwise the language's default,
 * or its fallback where the browser has no formatting data for it.
 */
function formatLocale(language) {
  const regional = preferredLanguages().find((tag) =>
    tag.includes("-") && primarySubtag(tag) === language.code
  );
  const candidates = [regional, language.locale, language.fallbackLocale];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      if (Intl.DateTimeFormat.supportedLocalesOf([candidate]).length) {
        return candidate;
      }
    } catch {
      // Malformed tag from the browser; try the next one.
    }
  }
  return language.locale;
}

function browserLanguage() {
  for (const tag of preferredLanguages()) {
    const code = primarySubtag(tag);
    if (BY_CODE.has(code)) return code;
  }
  return null;
}

function preferredLanguages() {
  const tags = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  return tags.filter((tag) => typeof tag === "string" && tag.length > 0);
}

function primarySubtag(tag) {
  return tag.trim().toLowerCase().split(/[-_]/)[0];
}

function savedLanguage() {
  try {
    const code = localStorage.getItem(STORAGE_KEY);
    return BY_CODE.has(code) ? code : null;
  } catch {
    return null;
  }
}

function saveLanguage(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Storage disabled (private mode etc.): the choice lasts this visit.
  }
}
