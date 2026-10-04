# Stockroom

A Deno + BedrockJS stock portfolio tracker. The backend fetches market data from
Yahoo Finance chart/search endpoints and caches price histories in **Deno KV**,
streaming them to every browser through the BedrockJS sync layer. Purchases,
sales, watchlist, quote snapshots and settings are stored locally in the browser
with IndexedDB. The interface is available in all 24 official EU languages.

## Features

- **Buy and sell** – register purchases and full or partial sales. The sell
  dialog shows what is available to sell on the chosen date, offers 25/50/75 %
  and "all" shortcuts plus a slider, and previews proceeds, cost basis and the
  realized result before you save.
- **Average-cost accounting (genomsnittsmetoden)** – every sale is measured
  against the average acquisition cost at the time of the sale, the same method
  Swedish tax rules use. Realized and unrealized results are shown separately
  and combined.
- **Multiple currencies** – trades are recorded in their own currency (SEK, EUR,
  USD, NOK, DKK, GBP, CHF, CAD, JPY) together with the SEK exchange rate on the
  trade date, fetched automatically from Yahoo Finance history and editable.
  Accounting is always kept in SEK; the whole portfolio can be viewed in SEK,
  EUR or USD with the toggle in the top bar.
- **Holdings page** – filter your holdings, pick one and see a large price chart
  (1M–5Y) with every buy and sell plotted on it, your average cost line, hover
  details, and a per-trade "price since the trade" list to judge timing.
- **Transactions page** – one chronological ledger of buys and sells with type
  and symbol filters, invested/sold/realized totals, and delete.
- **24 languages** – Swedish by default, or the browser's preferred language
  when it is one of the official EU languages. The globe button in the top bar
  switches language at any time and the choice is remembered. Numbers, dates and
  currencies follow the chosen language. See [Languages](#languages).
- **Server-cached, synced price history** – the server keeps one compact five
  year daily series per symbol in Deno KV (refreshed at most every six hours)
  and publishes it through `/sync/history/*` (BedrockJS sync: SSE stream +
  IndexedDB on the client). Charts, sparklines and historical price/FX lookups
  all read the synced model, and the live quote is laid over today's bar.

All amounts are formatted with `Intl.NumberFormat` in the UI language. Foreign
quotes are converted in the browser from cached Yahoo Finance FX pairs such as
`USDSEK=X`.

## Languages

The UI is translated into the 24 official EU languages (listed in
`src/languages.js`, in EU protocol order). The starting language is chosen as
follows:

1. A language picked with the globe button (saved in `localStorage` under
   `stockroom.language`).
2. Otherwise the first of the browser's preferred languages
   (`navigator.languages`) that is an EU language – `de-AT` gives German,
   `nb-NO, en-GB` gives English.
3. Otherwise Swedish.

Translations live in `public/locales/<code>.json` as flat key → text maps with
`{placeholder}` interpolation and CLDR plural forms (`one`, `few`, `many`, …
picked with `Intl.PluralRules`). Swedish (`sv.json`) is the source catalog: it
is bundled into `public/app.js`, and any key missing from another catalog falls
back to it. Other catalogs are fetched once, when first needed; on the first
visit the app waits up to 2.5 s for that file before rendering in Swedish and
switching when it arrives.

Number and date formatting uses the browser's own regional variant when it
prefers the chosen language (`en-US`, `de-AT` …), otherwise the language's
default locale. Irish and Maltese fall back to `en-IE`/`en-MT` formatting where
the browser has no locale data for them (Chromium).

API errors carry a stable `code` next to the (Swedish) `error`/`message` text,
for example `{"error": "…", "code": "noMarketData", "symbol": "XYZ"}`; the
browser shows the matching `server.<code>` translation.

To add or change a string, edit `sv.json` and every other catalog, then run
`deno task test`: it checks that all catalogs have the same keys and
placeholders as `sv.json` and every plural form their language needs.

## Data model

Stored in IndexedDB (`stockroom-local-device`, schema v2):

| Store       | Key      | Notes                                                                      |
| ----------- | -------- | -------------------------------------------------------------------------- |
| `lots`      | `id`     | Buys: `symbol, quantity, price, currency, fxRate, fees, purchasedAt, note` |
| `sales`     | `id`     | Sells: `symbol, quantity, price, currency, fxRate, fees, soldAt, note`     |
| `watchlist` | `symbol` |                                                                            |
| `quotes`    | `symbol` | Latest quote per symbol, minor units (GBp) normalised                      |
| `histories` | `symbol` | Legacy (pre-sync) store, no longer written; see below                      |
| `settings`  | `key`    | `lastRefresh`, `displayCurrency`                                           |

`price` and `fees` are in the trade `currency`; `fxRate` is SEK per one unit of
that currency on the trade date (1 for SEK). Records from before multi-currency
support have no `currency`/`fxRate` and are treated as SEK.

### Price history (server, Deno KV)

Histories are no longer stored by the app in IndexedDB. The server owns a
BedrockJS synced model `history` (one row per symbol, id = symbol) in Deno KV:

| Field                                        | Notes                                                               |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `symbol`, `name`, `currency`                 | From Yahoo's chart meta                                             |
| `points`                                     | JSON `[[date, close], ...]`, daily, up to five years, nulls dropped |
| `from`, `to`, `count`, `updatedAt`, `source` | Range and provenance                                                |

`GET /api/history?symbol=X` returns the cached row and records _demand_ for the
symbol (a KV key with a 30 day TTL). Upstream (Yahoo) is only contacted for
symbols that are not cached yet, or when `&refresh=1` is passed and the row is
older than 15 minutes – never more often than **once per 15 minutes per
symbol**, no matter who asks. New symbols are limited to 20 per 15 minutes in
total, and `/api/*` is rate limited per client IP.

A **cron job** (`Deno.cron`, default `30 22 * * 1-5` UTC – weekdays after the US
close; override with `STOCKROOM_REFRESH_CRON`) refreshes every symbol that has
been requested by some client in the last 30 days and **deletes** the rest from
KV, so the cache only holds instruments that are actually in use. Intraday the
browser lays the live quote over the last bar, so charts stay current between
refreshes.

The browser subscribes with `@rendly/bedrockjs/sync` (`src/sync.js`), which
persists rows in the `stockroom-sync` IndexedDB database. **Clients can only
read**: the server routes just `GET /sync/history/stream` and `/snapshot`; the
write route (`POST …/ops`) is refused from the network and only used in-process.

The sync server code under `server/sync/` is vendored from BedrockJS 0.1.4 (see
`server/sync/README.md` for why). A small wrapper compacts the KV change log so
only the latest version of each row is kept, and pruned rows are stored as slim
tombstones.

## Security notes

- Static files are resolved from percent-decoded path segments; `..`, hidden
  files and unknown extensions are refused, so encoded traversal cannot leave
  `public/`. The `serve` task runs with `--allow-read=public` and a scoped
  `--allow-env`.
- Every response carries `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` and COOP/CORP headers; HTML gets a
  Content-Security-Policy that allows scripts only from the app itself and the
  analytics host (`rendly.stream`). There is no wildcard CORS.
- Upstream requests time out after 10 s, error messages never echo upstream
  bodies, and the in-memory quote/search cache is bounded.
- Import files are validated record by record; malformed entries are skipped.

## Run locally

```sh
deno task serve
```

Open `http://localhost:8000`. Deno KV and `Deno.cron` are enabled through
`"unstable": ["kv", "cron"]` in `deno.json`; locally KV stores data in Deno's
cache directory (set `STOCKROOM_KV_PATH=/path/to/file.db` to use a specific
SQLite file – then also grant `--allow-read`/`--allow-write` for that path).

## Useful tasks

```sh
deno task build
deno task check
deno task test
deno task fmt
```

## Deploy on Deno Deploy

Build `public/app.js`, then deploy the project directory with `server/main.js`
as the dynamic entrypoint. The app needs no secrets; `Deno.openKv()` uses the
hosted Deno KV on Deploy automatically. Note that the sync server broadcasts SSE
changes per isolate — clients still catch up from their cursor on reconnect and
from the `/api/history` response, so multi-isolate deployments stay consistent.

```sh
deno task build
deno deploy create . --source local --runtime-mode dynamic --entrypoint server/main.js --build-command "deno task build" --app <app-name> --org <org-name>
deno deploy . --prod --app <app-name> --org <org-name>
```
