import {
  Component,
  createRouter,
  html,
  keyed,
  RouterLink,
  RouterOutlet,
} from "@rendly/bedrockjs";
import { reactive } from "@rendly/bedrockjs";
import {
  clearAllLocalData,
  loadLocalData,
  removeLot,
  removeWatchSymbol,
  replaceAllData,
  saveHistory,
  saveLot,
  saveQuote,
  saveSetting,
  saveWatchSymbol,
} from "./db.js";
import {
  fetchHistory,
  fetchQuotes,
  normalizeSymbol,
  searchSymbols,
} from "./market.js";
import {
  buildPositions,
  convertToSek,
  DISPLAY_CURRENCY,
  formatCurrency,
  formatNumber,
  formatPercent,
  sparklinePath,
  summarizePortfolio,
  toneClass,
} from "./math.js";

const state = reactive({
  ready: false,
  lots: [],
  watchlist: [],
  quotes: {},
  fxRates: {},
  histories: {},
  settings: {
    refreshMinutes: 5,
    lastRefresh: "",
  },
  refreshing: false,
  error: "",
  notice: "",
  searchResults: [],
  searchLoading: false,
});

RouterLink.register();
RouterOutlet.register();

class AppRoot extends Component {
  static tag = "app-root";

  refresh = () => {
    void refreshTrackedSymbols({ forceHistory: false });
  };

  render() {
    return html`
      <div class="app-shell">
        <header class="topbar">
          <div class="brand-block">
            <div class="brand-mark">SR</div>
            <div>
              <p class="brand-title">Stockroom</p>
              <p class="brand-subtitle">portfölj på enheten</p>
            </div>
          </div>

          <nav class="nav-tabs">
            <router-link to="/">Översikt</router-link>
            <router-link to="/lots">Köp</router-link>
            <router-link to="/research">Sök</router-link>
            <router-link to="/settings">Inställningar</router-link>
          </nav>

          <button
            class="refresh-button"
            on-click="${this.refresh}"
            disabled="${state.refreshing}"
          >
            ${state.refreshing ? "Uppdaterar" : "Uppdatera"}
          </button>
        </header>

        ${state.error
          ? html`
            <div class="status-banner error">
              <span>${state.error}</span>
              <button on-click="${() => state.error = ""}">Stäng</button>
            </div>
          `
          : ""} ${state.notice
          ? html`
            <div class="status-banner notice">
              <span>${state.notice}</span>
              <button on-click="${() => state.notice = ""}">Stäng</button>
            </div>
          `
          : ""}

        <main class="workspace">
          ${state.ready
            ? html`
              <router-outlet></router-outlet>
            `
            : html`
              <section class="loading-panel">Laddar lokal portfölj...</section>
            `}
        </main>
      </div>
    `;
  }
}

class DashboardPage extends Component {
  static tag = "dashboard-page";

  render() {
    const positions = getPositions();
    const summary = summarizePortfolio(positions);
    const holdings = positions.filter((position) => position.isHolding);

    return html`
      <section class="dashboard-grid">
        <div class="summary-band">
          <article class="metric primary-metric">
            <span class="metric-label">Portföljvärde</span>
            <strong>${formatCurrency(summary.totalValue)}</strong>
            <span class="${`metric-delta ${toneClass(summary.totalGain)}`}">
              ${formatCurrency(summary.totalGain)} ${formatPercent(
                summary.totalGainPercent,
              )}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Dagens rörelse</span>
            <strong class="${toneClass(summary.dayChange)}">
              ${formatCurrency(summary.dayChange)}
            </strong>
            <span class="${`metric-delta ${toneClass(summary.dayChange)}`}">
              ${formatPercent(summary.dayChangePercent)}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">Anskaffningsvärde</span>
            <strong>${formatCurrency(summary.totalCost)}</strong>
            <span class="metric-delta neutral">${summary
              .holdingsCount} innehav</span>
          </article>
          <article class="metric">
            <span class="metric-label">Bevakade</span>
            <strong>${summary.trackedCount}</strong>
            <span class="metric-delta neutral">${lastRefreshText()}</span>
          </article>
        </div>

        <section class="panel holdings-panel">
          <div class="panel-heading">
            <div>
              <h2>Innehav</h2>
              <p>${holdings.length
                ? "Öppna positioner sorterade efter marknadsvärde."
                : "Inga öppna köp ännu."}</p>
            </div>
          </div>
          ${holdings.length
            ? html`
              <position-table .positions="${holdings}"></position-table>
            `
            : emptyState(
              "Lägg till ditt första köp för att börja följa resultatet.",
            )}
        </section>

        <section class="panel add-panel">
          <div class="panel-heading">
            <div>
              <h1>Lägg till köp</h1>
              <p>
                Registrera aktiesymbol, datum, antal och anskaffningspris i SEK.
              </p>
            </div>
          </div>
          <add-lot-form></add-lot-form>
        </section>

        <section class="panel allocation-panel">
          <div class="panel-heading">
            <div>
              <h2>Fördelning</h2>
              <p>Aktuell vikt baserad på marknadsvärde.</p>
            </div>
          </div>
          ${holdings.length
            ? allocationList(holdings, summary.totalValue)
            : emptyState("Fördelningen visas efter minst ett sparat köp.")}
        </section>

        <section class="panel movers-panel">
          <div class="panel-heading">
            <div>
              <h2>Utveckling</h2>
              <p>Bästa och svagaste orealiserade avkastning.</p>
            </div>
          </div>
          ${summary.best
            ? html`
              <div class="mover-grid">
                ${moverCard("Bäst", summary.best)} ${moverCard(
                  "Svagast",
                  summary.worst,
                )}
              </div>
            `
            : emptyState("Utveckling visas när kurserna har laddats.")}
        </section>
      </section>
    `;
  }
}

class AddLotForm extends Component {
  static tag = "add-lot-form";
  static properties = {
    symbol: { type: String, default: "" },
    quantity: { type: String, default: "" },
    price: { type: String, default: "" },
    purchasedAt: { type: String, default: today },
    fees: { type: String, default: "0" },
    note: { type: String, default: "" },
    message: { type: String, default: "" },
    suggestions: { type: Array, default: () => [] },
    lookupLoading: { type: Boolean, default: false },
    suggestionOpen: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
  };

  searchTimer = null;
  lookupToken = 0;

  submit = async (event) => {
    event.preventDefault();
    const symbol = normalizeSymbol(this.symbol);
    const quantity = Number(this.quantity);
    const price = Number(this.price);
    const fees = Number(this.fees || 0);

    if (!symbol || !Number.isFinite(quantity) || quantity <= 0) {
      this.message = "Ange en aktiesymbol och ett positivt antal aktier.";
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      this.message = "Ange köppriset per aktie.";
      return;
    }

    this.busy = true;
    try {
      await addLot({
        symbol,
        quantity,
        price,
        purchasedAt: this.purchasedAt || today(),
        fees: Number.isFinite(fees) ? fees : 0,
        note: this.note.trim(),
      });
      this.message = `Sparade ${formatNumber(quantity, 4)} aktier i ${symbol}.`;
      this.symbol = "";
      this.quantity = "";
      this.price = "";
      this.fees = "0";
      this.note = "";
      this.purchasedAt = today();
      this.suggestions = [];
      this.suggestionOpen = false;
    } catch (error) {
      this.message = error.message;
    } finally {
      this.busy = false;
    }
  };

  handleSymbolInput = (event) => {
    this.symbol = event.target.value.toUpperCase();
    this.queueTickerSearch(this.symbol);
  };

  queueTickerSearch(value) {
    clearTimeout(this.searchTimer);
    const query = normalizeSymbol(value);

    if (!query) {
      this.suggestions = [];
      this.suggestionOpen = false;
      this.lookupLoading = false;
      return;
    }

    this.searchTimer = setTimeout(() => {
      void this.runTickerSearch(query);
    }, 180);
  }

  async runTickerSearch(query) {
    const token = ++this.lookupToken;
    this.lookupLoading = true;
    this.suggestionOpen = true;

    try {
      const results = await searchSymbols(query);
      if (token !== this.lookupToken) return;
      this.suggestions = results
        .filter((item) => item.symbol)
        .slice(0, 7);
    } catch (error) {
      if (token !== this.lookupToken) return;
      this.suggestions = [];
      this.message = error.message;
    } finally {
      if (token === this.lookupToken) this.lookupLoading = false;
    }
  }

  chooseTicker = async (result) => {
    const symbol = normalizeSymbol(result.symbol);
    if (!symbol) return;

    clearTimeout(this.searchTimer);
    this.lookupToken += 1;
    this.symbol = symbol;
    this.suggestions = [];
    this.suggestionOpen = false;
    this.lookupLoading = false;
    this.busy = true;

    try {
      const quote = await refreshOneSymbol(symbol);
      const priceSek = await quotePriceSek(quote);
      this.price = priceSek.toFixed(2);
      this.message = `Valde ${symbol} till ${formatCurrency(priceSek)}.`;
    } catch (error) {
      this.message = error.message;
    } finally {
      this.busy = false;
    }
  };

  closeSuggestions = () => {
    setTimeout(() => {
      this.suggestionOpen = false;
    }, 120);
  };

  fillPrice = async () => {
    const symbol = normalizeSymbol(this.symbol);
    if (!symbol) {
      this.message = "Ange en aktiesymbol först.";
      return;
    }

    this.busy = true;
    try {
      const quote = await refreshOneSymbol(symbol);
      const priceSek = await quotePriceSek(quote);
      this.price = priceSek.toFixed(2);
      this.message = `Använder senaste kursen för ${symbol}: ${
        formatCurrency(priceSek)
      }.`;
    } catch (error) {
      this.message = error.message;
    } finally {
      this.busy = false;
    }
  };

  render() {
    return html`
      <form class="lot-form" on-submit="${this.submit}">
        <label class="ticker-field">
          <span>Aktiesymbol</span>
          <input
            autocomplete="off"
            inputmode="latin"
            role="combobox"
            aria-expanded="${this.suggestionOpen}"
            placeholder="AAPL"
            .value="${this.symbol}"
            on-input="${this.handleSymbolInput}"
            on-focus="${() =>
              this.symbol && this.queueTickerSearch(this.symbol)}"
            on-blur="${this.closeSuggestions}"
          />
          ${this.suggestionOpen &&
              (this.lookupLoading || this.suggestions.length)
            ? html`
              <div class="ticker-menu">
                ${this.lookupLoading
                  ? html`
                    <div class="ticker-menu-status">Söker...</div>
                  `
                  : this.suggestions.map((result) =>
                    keyed(
                      result.symbol,
                      html`
                        <button
                          type="button"
                          class="ticker-option"
                          on-mousedown="${(event) => event.preventDefault()}"
                          on-click="${() => this.chooseTicker(result)}"
                        >
                          <strong>${result.symbol}</strong>
                          <span>${result.name}</span>
                          <small>${[result.exchange, result.type].filter(
                            Boolean,
                          )
                            .join(" / ")}</small>
                        </button>
                      `,
                    )
                  )}
              </div>
            `
            : ""}
        </label>

        <label>
          <span>Antal</span>
          <input
            type="number"
            min="0"
            step="0.000001"
            placeholder="12"
            .value="${this.quantity}"
            on-input="${(event) => this.quantity = event.target.value}"
          />
        </label>

        <label>
          <span>Pris (SEK)</span>
          <div class="input-action">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="1 850.25"
              .value="${this.price}"
              on-input="${(event) => this.price = event.target.value}"
            />
            <button type="button" on-click="${this.fillPrice}" disabled="${this
              .busy}">
              Hämta
            </button>
          </div>
        </label>

        <label>
          <span>Datum</span>
          <input
            type="date"
            .value="${this.purchasedAt}"
            on-input="${(event) => this.purchasedAt = event.target.value}"
          />
        </label>

        <label>
          <span>Avgifter (SEK)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            .value="${this.fees}"
            on-input="${(event) => this.fees = event.target.value}"
          />
        </label>

        <label class="wide-field">
          <span>Anteckning</span>
          <input
            placeholder="Mäklare, tes, konto"
            .value="${this.note}"
            on-input="${(event) => this.note = event.target.value}"
          />
        </label>

        <div class="form-actions">
          <button class="primary-button" type="submit" disabled="${this.busy}">
            ${this.busy ? "Sparar" : "Spara köp"}
          </button>
          ${this.message
            ? html`
              <p>${this.message}</p>
            `
            : ""}
        </div>
      </form>
    `;
  }
}

class PositionTable extends Component {
  static tag = "position-table";
  static properties = {
    positions: { type: Array, default: () => [] },
  };

  render() {
    return html`
      <div class="position-list">
        ${this.positions.map((position) =>
          keyed(position.symbol, positionRow(position))
        )}
      </div>
    `;
  }
}

class LotsPage extends Component {
  static tag = "lots-page";

  render() {
    const lots = [...state.lots].sort((a, b) =>
      b.purchasedAt.localeCompare(a.purchasedAt)
    );
    const quotes = state.quotes;

    return html`
      <section class="page-stack">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>Köp</h1>
              <p>
                Priser och avgifter sparas som SEK i IndexedDB. Redigera genom att ta
                bort och lägga till igen.
              </p>
            </div>
          </div>
          ${lots.length
            ? html`
              <div class="lot-list">
                ${lots.map((lot) =>
                  keyed(lot.id, lotRow(lot, quotes[lot.symbol]))
                )}
              </div>
            `
            : emptyState("Inga köp har sparats.")}
        </section>
      </section>
    `;
  }
}

class ResearchPage extends Component {
  static tag = "research-page";
  static properties = {
    query: { type: String, default: "" },
    message: { type: String, default: "" },
  };

  search = async (event) => {
    event.preventDefault();
    const query = this.query.trim();
    if (!query) return;

    state.searchLoading = true;
    this.message = "";
    try {
      state.searchResults = await searchSymbols(query);
      if (state.searchResults.length === 0) {
        this.message = "Inga matchande tickers hittades.";
      }
    } catch (error) {
      this.message = error.message;
    } finally {
      state.searchLoading = false;
    }
  };

  track = async (symbol) => {
    await trackSymbol(symbol);
    this.message = `${symbol} bevakas nu lokalt.`;
  };

  render() {
    const positions = getPositions();
    return html`
      <section class="research-grid">
        <section class="panel search-panel">
          <div class="panel-heading">
            <div>
              <h1>Sök</h1>
              <p>
                Sök Yahoo Finance-symboler och lägg till dem i din lokala
                bevakningslista.
              </p>
            </div>
          </div>
          <form class="search-form" on-submit="${this.search}">
            <input
              autocomplete="off"
              placeholder="Sök bolag eller aktiesymbol"
              .value="${this.query}"
              on-input="${(event) => this.query = event.target.value}"
            />
            <button class="primary-button" disabled="${state.searchLoading}">
              ${state.searchLoading ? "Söker" : "Sök"}
            </button>
          </form>
          ${this.message
            ? html`
              <p class="inline-message">${this.message}</p>
            `
            : ""}
          <div class="search-results">
            ${state.searchResults.map((result) =>
              keyed(
                result.symbol,
                html`
                  <article class="search-result">
                    <div>
                      <strong>${result.symbol}</strong>
                      <span>${result.name}</span>
                      <small>${[result.exchange, result.type, result.sector]
                        .filter(Boolean).join(" / ")}</small>
                    </div>
                    <button on-click="${() =>
                      this.track(result.symbol)}">Bevaka</button>
                  </article>
                `,
              )
            )}
          </div>
        </section>

        <section class="panel watch-panel">
          <div class="panel-heading">
            <div>
              <h2>Bevakade symboler</h2>
              <p>Bevakningslista och innehav med lokalt cachade kursbilder.</p>
            </div>
          </div>
          ${positions.length
            ? html`
              <div class="watch-grid">
                ${positions.map((position) =>
                  keyed(position.symbol, watchCard(position))
                )}
              </div>
            `
            : emptyState("Sök och bevaka en symbol, eller spara ett köp.")}
        </section>
      </section>
    `;
  }
}

class SettingsPage extends Component {
  static tag = "settings-page";
  static properties = {
    message: { type: String, default: "" },
    busy: { type: Boolean, default: false },
  };

  exportData = () => {
    const payload = {
      app: "Stockroom",
      version: 1,
      exportedAt: new Date().toISOString(),
      lots: state.lots,
      watchlist: state.watchlist,
      quotes: state.quotes,
      histories: state.histories,
      settings: state.settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `stockroom-${today()}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  importData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    this.busy = true;
    try {
      const data = JSON.parse(await file.text());
      validateImport(data);
      await replaceAllData(data);
      await hydrateState();
      this.message = "Importerade lokal portföljdata.";
    } catch (error) {
      this.message = error.message;
    } finally {
      this.busy = false;
      event.target.value = "";
    }
  };

  clearData = async () => {
    if (
      !confirm("Ta bort all lokal Stockroom-data från den här webbläsaren?")
    ) {
      return;
    }
    await clearAllLocalData();
    await hydrateState();
    this.message = "Lokal data rensad.";
  };

  persistStorage = async () => {
    if (!navigator.storage?.persist) {
      this.message = "Beständig webbläsarlagring är inte tillgänglig här.";
      return;
    }
    const granted = await navigator.storage.persist();
    this.message = granted
      ? "Webbläsaren beviljade beständig lagring."
      : "Webbläsaren beviljade inte beständig lagring.";
  };

  render() {
    return html`
      <section class="settings-grid">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>Lokal data</h1>
              <p>Portföljposter stannar i den här webbläsarens IndexedDB.</p>
            </div>
          </div>
          <div class="settings-actions">
            <button class="primary-button" on-click="${this
              .exportData}">
              Exportera JSON
            </button>
            <label class="file-button">
              Importera JSON
              <input type="file" accept="application/json" on-change="${this
                .importData}" />
            </label>
            <button on-click="${this.persistStorage}">Beständig lagring</button>
            <button class="danger-button" on-click="${this.clearData}">
              Rensa lokal data
            </button>
          </div>
          ${this.message
            ? html`
              <p class="inline-message">${this.message}</p>
            `
            : ""}
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <h2>Lagring</h2>
              <p>Antalen nedan är lokala poster, inte serverposter.</p>
            </div>
          </div>
          <div class="storage-stats">
            <span><strong>${state.lots.length}</strong> köp</span>
            <span><strong>${state.watchlist
              .length}</strong> bevakade symboler</span>
            <span><strong>${Object.keys(state.quotes)
              .length}</strong> kursbilder</span>
            <span><strong>${Object.keys(state.histories)
              .length}</strong> historikposter</span>
          </div>
        </section>
      </section>
    `;
  }
}

AppRoot.register();
DashboardPage.register();
AddLotForm.register();
PositionTable.register();
LotsPage.register();
ResearchPage.register();
SettingsPage.register();

createRouter({
  routes: [
    { path: "/", component: "dashboard-page" },
    { path: "/lots", component: "lots-page" },
    { path: "/research", component: "research-page" },
    { path: "/settings", component: "settings-page" },
  ],
});

void initialize();

async function initialize() {
  await hydrateState();
  await refreshTrackedSymbols({ forceHistory: false, quiet: true });
}

async function hydrateState() {
  const data = await loadLocalData();
  state.lots = data.lots;
  state.watchlist = data.watchlist;
  state.quotes = data.quotes;
  state.fxRates = fxRatesFromQuotes(data.quotes);
  state.histories = data.histories;
  state.settings = {
    refreshMinutes: 5,
    lastRefresh: "",
    ...data.settings,
  };
  state.ready = true;
}

function getPositions() {
  return buildPositions(
    state.lots,
    state.watchlist,
    state.quotes,
    state.histories,
    state.fxRates,
  );
}

async function addLot(input) {
  const symbol = normalizeSymbol(input.symbol);
  const lot = {
    id: crypto.randomUUID(),
    symbol,
    quantity: Number(input.quantity),
    price: Number(input.price),
    purchasedAt: input.purchasedAt,
    fees: Number(input.fees ?? 0),
    note: input.note ?? "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveLot(lot);
  state.lots = [lot, ...state.lots].sort((a, b) =>
    b.purchasedAt.localeCompare(a.purchasedAt)
  );
  await trackSymbol(symbol, { quiet: true });
}

async function deleteLot(id) {
  await removeLot(id);
  state.lots = state.lots.filter((lot) => lot.id !== id);
}

async function trackSymbol(symbol, options = {}) {
  const cleanSymbol = normalizeSymbol(symbol);
  if (!cleanSymbol) throw new Error("Aktiesymbol saknas");

  if (!state.watchlist.some((item) => item.symbol === cleanSymbol)) {
    const record = {
      symbol: cleanSymbol,
      addedAt: new Date().toISOString(),
    };
    await saveWatchSymbol(record);
    state.watchlist = [...state.watchlist, record]
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  await refreshOneSymbol(cleanSymbol);
  if (!options.quiet) {
    state.notice = `${cleanSymbol} bevakas på den här enheten.`;
  }
}

async function untrackSymbol(symbol) {
  const cleanSymbol = normalizeSymbol(symbol);
  await removeWatchSymbol(cleanSymbol);
  state.watchlist = state.watchlist.filter((item) =>
    item.symbol !== cleanSymbol
  );
}

async function refreshOneSymbol(symbol) {
  const payload = await fetchQuotes([symbol]);
  const quote = payload.quotes?.[0];
  if (!quote) {
    throw new Error(
      payload.errors?.[0]?.message ?? `Ingen kurs hittades för ${symbol}`,
    );
  }

  await storeQuote(quote);
  await ensureFxRatesForQuotes([quote], { required: true });
  await refreshHistoryIfNeeded(quote.symbol, true);
  return quote;
}

async function refreshTrackedSymbols(options = {}) {
  const symbols = getTrackedSymbols();
  if (symbols.length === 0) return;
  if (state.refreshing) return;

  state.refreshing = true;
  if (!options.quiet) state.error = "";
  try {
    const payload = await fetchQuotes(symbols);
    const quotes = payload.quotes ?? [];
    for (const quote of quotes) await storeQuote(quote);
    await ensureFxRatesForQuotes(quotes, { required: false });

    const refreshedAt = new Date().toISOString();
    state.settings = { ...state.settings, lastRefresh: refreshedAt };
    await saveSetting("lastRefresh", refreshedAt);

    for (const symbol of symbols.slice(0, 24)) {
      await refreshHistoryIfNeeded(symbol, options.forceHistory).catch(
        () => {},
      );
    }

    if (payload.errors?.length && !options.quiet) {
      state.error = payload.errors
        .map((item) => `${item.symbol}: ${item.message}`)
        .join(" / ");
    }
  } catch (error) {
    if (!options.quiet) state.error = error.message;
  } finally {
    state.refreshing = false;
  }
}

async function storeQuote(quote) {
  const record = {
    ...quote,
    symbol: normalizeSymbol(quote.symbol),
    updatedAt: new Date().toISOString(),
  };
  await saveQuote(record);
  state.quotes = { ...state.quotes, [record.symbol]: record };
  rememberFxRate(record);
}

async function quotePriceSek(quote) {
  await ensureFxRatesForQuotes([quote], { required: true });
  return convertToSek(quote.price, quote.currency, state.fxRates);
}

async function ensureFxRatesForQuotes(quotes, options = {}) {
  const currencies = [
    ...new Set(
      quotes
        .map((quote) => normalizeCurrency(quote.currency))
        .filter((currency) => currency && currency !== DISPLAY_CURRENCY),
    ),
  ];
  const missingCurrencies = currencies.filter((currency) =>
    !Number.isFinite(state.fxRates[currency])
  );

  if (missingCurrencies.length === 0) return;

  const fxSymbols = missingCurrencies.map(fxSymbolForCurrency);
  const payload = await fetchQuotes(fxSymbols);
  for (const quote of payload.quotes ?? []) await storeQuote(quote);

  const stillMissing = missingCurrencies.filter((currency) =>
    !Number.isFinite(state.fxRates[currency])
  );
  if (options.required && stillMissing.length) {
    throw new Error(
      `Kunde inte konvertera ${
        stillMissing.join(", ")
      } till ${DISPLAY_CURRENCY}.`,
    );
  }
}

function rememberFxRate(quote) {
  const sourceCurrency = sourceCurrencyFromFxSymbol(quote.symbol);
  if (!sourceCurrency || !Number.isFinite(quote.price)) return;
  state.fxRates = {
    ...state.fxRates,
    [sourceCurrency]: quote.price,
  };
}

function fxRatesFromQuotes(quotes) {
  const rates = {};
  for (const quote of Object.values(quotes ?? {})) {
    const sourceCurrency = sourceCurrencyFromFxSymbol(quote.symbol);
    if (sourceCurrency && Number.isFinite(quote.price)) {
      rates[sourceCurrency] = quote.price;
    }
  }
  return rates;
}

function fxSymbolForCurrency(currency) {
  return `${normalizeCurrency(currency)}${DISPLAY_CURRENCY}=X`;
}

function sourceCurrencyFromFxSymbol(symbol) {
  const match = normalizeSymbol(symbol).match(/^([A-Z]{3})SEK=X$/);
  return match?.[1] ?? "";
}

function normalizeCurrency(currency) {
  return String(currency ?? "").trim().toUpperCase();
}

async function refreshHistoryIfNeeded(symbol, force = false) {
  const existing = state.histories[symbol];
  const ageMs = existing?.updatedAt
    ? Date.now() - new Date(existing.updatedAt).getTime()
    : Infinity;

  if (!force && ageMs < 6 * 60 * 60 * 1000) return;

  const history = await fetchHistory(symbol, "6mo");
  await saveHistory(history);
  state.histories = { ...state.histories, [history.symbol]: history };
}

function getTrackedSymbols() {
  return [
    ...new Set([
      ...state.watchlist.map((item) => item.symbol),
      ...state.lots.map((lot) => lot.symbol),
    ]),
  ].filter(Boolean);
}

function lastRefreshText() {
  const value = state.settings.lastRefresh;
  if (!value) return "ej uppdaterad";
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function positionRow(position) {
  const path = sparklinePath(position.history?.points ?? [], 180, 54);
  return html`
    <article class="position-row">
      <div class="identity-cell">
        <strong>${position.symbol}</strong>
        <span>${position.name}</span>
      </div>
      <svg
        class="sparkline"
        viewBox="0 0 180 54"
        role="img"
        aria-label="${position.symbol} pristrend"
      >
        <path class="sparkline-grid" d="M0 27 L180 27"></path>
        <path class="${`sparkline-path ${
          toneClass(position.gain)
        }`}" d="${path}"></path>
      </svg>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${formatNumber(position.shares, 4)}</strong>
      </div>
      <div>
        <span class="cell-label">Pris</span>
        <strong>${formatCurrency(position.price)}</strong>
      </div>
      <div>
        <span class="cell-label">Värde</span>
        <strong>${formatCurrency(position.marketValue)}</strong>
      </div>
      <div>
        <span class="cell-label">Resultat</span>
        <strong class="${toneClass(position.gain)}">
          ${formatCurrency(position.gain)}
        </strong>
        <small class="${toneClass(position.gain)}">${formatPercent(
          position.gainPercent,
        )}</small>
      </div>
    </article>
  `;
}

function lotRow(lot, quote) {
  const currentPrice = quote
    ? convertToSek(quote.price, quote.currency, state.fxRates)
    : lot.price;
  const currentValue = lot.quantity * currentPrice;
  const cost = lot.quantity * lot.price + (lot.fees ?? 0);
  const gain = currentValue - cost;

  return html`
    <article class="lot-row">
      <div>
        <strong>${lot.symbol}</strong>
        <span>${lot.note || "Ingen anteckning"}</span>
      </div>
      <div>
        <span class="cell-label">Datum</span>
        <strong>${lot.purchasedAt}</strong>
      </div>
      <div>
        <span class="cell-label">Antal</span>
        <strong>${formatNumber(lot.quantity, 4)}</strong>
      </div>
      <div>
        <span class="cell-label">Anskaffning</span>
        <strong>${formatCurrency(cost)}</strong>
      </div>
      <div>
        <span class="cell-label">Resultat</span>
        <strong class="${toneClass(gain)}">${formatCurrency(
          gain,
        )}</strong>
      </div>
      <button class="danger-button compact" on-click="${() =>
        deleteLot(lot.id)}">Ta bort</button>
    </article>
  `;
}

function watchCard(position) {
  const quote = position.quote;
  const path = sparklinePath(position.history?.points ?? [], 240, 72);

  return html`
    <article class="watch-card">
      <div class="watch-card-head">
        <div>
          <strong>${position.symbol}</strong>
          <span>${position.name}</span>
        </div>
        ${position.isHolding
          ? html`
            <span class="pill">Innehav</span>
          `
          : html`
            <button on-click="${() =>
              untrackSymbol(position.symbol)}">Sluta bevaka</button>
          `}
      </div>
      <svg
        class="watch-chart"
        viewBox="0 0 240 72"
        role="img"
        aria-label="${position.symbol} diagram"
      >
        <path class="sparkline-grid" d="M0 36 L240 36"></path>
        <path class="${`sparkline-path ${
          toneClass(quote?.change ?? 0)
        }`}" d="${path}"></path>
      </svg>
      <div class="watch-stats">
        <span>
          <small>Senast</small>
          <strong>${formatCurrency(position.price)}</strong>
        </span>
        <span>
          <small>Rörelse</small>
          <strong class="${toneClass(quote?.change ?? 0)}">
            ${formatPercent(quote?.changePercent ?? 0)}
          </strong>
        </span>
        <span>
          <small>Uppdaterad</small>
          <strong>${quote?.marketTime
            ? shortDate(quote.marketTime)
            : "Väntar"}</strong>
        </span>
      </div>
    </article>
  `;
}

function allocationList(holdings, totalValue) {
  return html`
    <div class="allocation-list">
      ${holdings.map((position) => {
        const weight = totalValue > 0
          ? position.marketValue / totalValue * 100
          : 0;
        return keyed(
          position.symbol,
          html`
            <div class="allocation-row">
              <div>
                <strong>${position.symbol}</strong>
                <span>${formatCurrency(position.marketValue)}</span>
              </div>
              <div class="allocation-track">
                <span style="${`width: ${
                  Math.max(2, weight).toFixed(2)
                }%`}"></span>
              </div>
              <b>${formatNumber(weight, 1)}%</b>
            </div>
          `,
        );
      })}
    </div>
  `;
}

function moverCard(label, position) {
  return html`
    <article class="mover-card">
      <span>${label}</span>
      <strong>${position.symbol}</strong>
      <p class="${toneClass(position.gain)}">
        ${formatCurrency(position.gain)} ${formatPercent(position.gainPercent)}
      </p>
    </article>
  `;
}

function emptyState(text) {
  return html`
    <div class="empty-state">${text}</div>
  `;
}

function shortDate(value) {
  return new Intl.DateTimeFormat("sv-SE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function validateImport(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Importfilen är inte giltig JSON.");
  }
  if (!Array.isArray(data.lots)) {
    throw new Error("Importfilen saknar köp.");
  }
  if (!Array.isArray(data.watchlist)) {
    throw new Error("Importfilen saknar bevakningslista.");
  }
}
