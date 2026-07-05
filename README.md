# Stockroom

A Deno + BedrockJS stock portfolio tracker. The backend only fetches market data
from Yahoo Finance chart/search endpoints. Portfolio lots, watchlist, quote
snapshots, histories, and settings are stored locally in the browser with
IndexedDB.

All portfolio values are displayed and stored as SEK. Foreign quotes are
converted in the browser from cached Yahoo Finance FX quote pairs such as
`USDSEK=X`, then formatted with `Intl.NumberFormat`.

## Run locally

```sh
deno task serve
```

Open `http://localhost:8000`.

## Useful tasks

```sh
deno task build
deno task check
deno task fmt
```

## Deploy on Deno Deploy

Build `public/app.js`, then deploy the project directory with `server/main.js`
as the dynamic entrypoint. The app does not require a database or secrets.

```sh
deno task build
deno deploy create . --source local --runtime-mode dynamic --entrypoint server/main.js --build-command "deno task build" --app <app-name> --org <org-name>
deno deploy . --prod --app <app-name> --org <org-name>
```
