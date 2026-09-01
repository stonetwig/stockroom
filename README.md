# Stockroom

A Deno + BedrockJS stock portfolio tracker. The backend fetches market data from
Yahoo Finance chart/search endpoints and caches price histories in **Deno KV**,
streaming them to every browser through the BedrockJS sync layer. Purchases,
sales, watchlist, quote snapshots and settings are stored locally in the browser
with IndexedDB.

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
- **Server-cached, synced price history** – the server keeps one compact five
  year daily series per symbol in Deno KV (refreshed at most every six hours)
  and publishes it through `/sync/history/*` (BedrockJS sync: SSE stream +
  IndexedDB on the client). Charts, sparklines and historical price/FX lookups
  all read the synced model, and the live quote is laid over today's bar.

All amounts are formatted with `Intl.NumberFormat`. Foreign quotes are converted
in the browser from cached Yahoo Finance FX pairs such as `USDSEK=X`.

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

`GET /api/history?symbol=X` makes sure the row exists and is fresh (Yahoo is
asked when it is older than six hours or `&refresh=1` is passed), writes it
through the sync server so all connected clients get it over SSE, and returns
`{ row, cursor }`. The browser subscribes with `@rendly/bedrockjs/sync`
(`src/sync.js`), which persists rows in the `stockroom-sync` IndexedDB database.

The sync server code under `server/sync/` is vendored from BedrockJS 0.1.4 (see
`server/sync/README.md` for why). A small wrapper compacts the KV change log so
only the latest version of each row is kept.

## Run locally

```sh
deno task serve
```

Open `http://localhost:8000`. Deno KV is enabled through `"unstable": ["kv"]` in
`deno.json`; locally it stores data in Deno's cache directory (set
`STOCKROOM_KV_PATH=/path/to/file.db` to use a specific SQLite file).

## Useful tasks

```sh
deno task build
deno task check
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
