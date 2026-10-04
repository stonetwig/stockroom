/**
 * Every translation must cover exactly the keys of the Swedish source
 * catalog, keep its {placeholders} and give every plural form its language
 * needs. Run with `deno task test`.
 */
import { DEFAULT_LANGUAGE, LANGUAGES } from "./languages.js";

const LOCALES_DIR = new URL("../public/locales/", import.meta.url);
const PLACEHOLDER = /\{(\w+)\}/g;

const source = await readCatalog(DEFAULT_LANGUAGE);

Deno.test("there is one catalog per language", async () => {
  const files = [];
  for await (const entry of Deno.readDir(LOCALES_DIR)) files.push(entry.name);
  const expected = LANGUAGES.map((language) => `${language.code}.json`);
  assertEqual(files.sort(), expected.sort());
});

for (const language of LANGUAGES) {
  Deno.test(`${language.code} matches the ${DEFAULT_LANGUAGE} catalog`, async () => {
    const catalog = await readCatalog(language.code);
    const categories = new Intl.PluralRules(language.locale).resolvedOptions()
      .pluralCategories;
    const problems = [];

    for (const key of Object.keys(source)) {
      if (!Object.hasOwn(catalog, key)) problems.push(`missing "${key}"`);
    }

    for (const [key, value] of Object.entries(catalog)) {
      if (!Object.hasOwn(source, key)) {
        problems.push(`unknown key "${key}"`);
        continue;
      }
      const expected = placeholders(source[key]);
      let forms;
      if (typeof source[key] === "string") {
        if (typeof value !== "string") {
          problems.push(`"${key}" must be a string`);
          continue;
        }
        forms = { text: value };
      } else {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          problems.push(`"${key}" must be an object of plural forms`);
          continue;
        }
        for (const category of categories) {
          if (!Object.hasOwn(value, category)) {
            problems.push(`"${key}" lacks the plural form "${category}"`);
          }
        }
        for (const category of Object.keys(value)) {
          if (!categories.includes(category)) {
            problems.push(`"${key}" has the unused plural form "${category}"`);
          }
        }
        forms = value;
      }

      for (const [form, text] of Object.entries(forms)) {
        const label = form === "text" ? `"${key}"` : `"${key}" (${form})`;
        if (typeof text !== "string" || text.trim() === "") {
          problems.push(`${label} is empty`);
          continue;
        }
        const used = new Set([...text.matchAll(PLACEHOLDER)].map((m) => m[1]));
        for (const name of used) {
          if (!expected.has(name)) {
            problems.push(`${label} uses unknown {${name}}`);
          }
        }
        for (const name of expected) {
          if (!used.has(name)) problems.push(`${label} lacks {${name}}`);
        }
      }
    }

    if (problems.length) throw new Error(problems.join("\n"));
  });
}

async function readCatalog(code) {
  const url = new URL(`${code}.json`, LOCALES_DIR);
  return JSON.parse(await Deno.readTextFile(url));
}

function placeholders(message) {
  const texts = typeof message === "string"
    ? [message]
    : Object.values(message);
  return new Set(
    texts.flatMap((text) => [...text.matchAll(PLACEHOLDER)].map((m) => m[1])),
  );
}

function assertEqual(actual, expected) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}\n     got ${a}`);
}
