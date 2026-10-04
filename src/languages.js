/**
 * The 24 official EU languages in EU protocol order (alphabetical by each
 * language's own name). `locale` drives number/date formatting and plural
 * rules; `fallbackLocale` formats numbers and dates where browsers ship no
 * data for the language itself (Irish and Maltese in Chromium).
 */
export const LANGUAGES = [
  { code: "bg", name: "Български", locale: "bg-BG" },
  { code: "es", name: "Español", locale: "es-ES" },
  { code: "cs", name: "Čeština", locale: "cs-CZ" },
  { code: "da", name: "Dansk", locale: "da-DK" },
  { code: "de", name: "Deutsch", locale: "de-DE" },
  { code: "et", name: "Eesti", locale: "et-EE" },
  { code: "el", name: "Ελληνικά", locale: "el-GR" },
  { code: "en", name: "English", locale: "en-IE" },
  { code: "fr", name: "Français", locale: "fr-FR" },
  { code: "ga", name: "Gaeilge", locale: "ga-IE", fallbackLocale: "en-IE" },
  { code: "hr", name: "Hrvatski", locale: "hr-HR" },
  { code: "it", name: "Italiano", locale: "it-IT" },
  { code: "lv", name: "Latviešu", locale: "lv-LV" },
  { code: "lt", name: "Lietuvių", locale: "lt-LT" },
  { code: "hu", name: "Magyar", locale: "hu-HU" },
  { code: "mt", name: "Malti", locale: "mt-MT", fallbackLocale: "en-MT" },
  { code: "nl", name: "Nederlands", locale: "nl-NL" },
  { code: "pl", name: "Polski", locale: "pl-PL" },
  { code: "pt", name: "Português", locale: "pt-PT" },
  { code: "ro", name: "Română", locale: "ro-RO" },
  { code: "sk", name: "Slovenčina", locale: "sk-SK" },
  { code: "sl", name: "Slovenščina", locale: "sl-SI" },
  { code: "fi", name: "Suomi", locale: "fi-FI" },
  { code: "sv", name: "Svenska", locale: "sv-SE" },
];

/** Used when neither a saved choice nor the browser names a known language. */
export const DEFAULT_LANGUAGE = "sv";
