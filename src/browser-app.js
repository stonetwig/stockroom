import {
  Component,
  createRouter,
  html,
  keyed,
  navigate,
  reactive,
  RouterLink,
  RouterOutlet,
} from "@rendly/bedrockjs";
import {
  clearAllLocalData,
  loadLocalData,
  removeLot,
  removeSale,
  removeWatchSymbol,
  replaceAllData,
  saveLot,
  saveQuote,
  saveSale,
  saveSetting,
  saveWatchSymbol,
} from "./db.js";
import {
  currentLanguage,
  initLanguage,
  languageName,
  languageReady,
  setLanguage,
  t,
  translateServerError,
} from "./i18n.js";
import { LANGUAGES } from "./languages.js";
import { fetchQuotes, normalizeSymbol, searchSymbols } from "./market.js";
import {
  ensureHistory,
  History,
  historySeries,
  pointsInRange,
  withLiveQuote,
} from "./sync.js";
import {
  availableToSell,
  BASE_CURRENCY,
  buildLedger,
  buildPositions,
  convertFromSek,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatShares,
  formatSignedCurrency,
  getFormatLocale,
  minorUnit,
  normalizeCurrency,
  previewSale,
  QUANTITY_EPSILON,
  roundQuantity,
  sparklinePath,
  summarizePortfolio,
  toneClass,
  TRADE_CURRENCIES,
  tradeAmount,
  tradeCurrency,
  tradeFxRate,
  tradeUnitCost,
  VIEW_CURRENCIES,
} from "./math.js";

const state = reactive({
  ready: false,
  lots: [],
  sales: [],
  watchlist: [],
  quotes: {},
  fxRates: {},
  settings: {
    refreshMinutes: 5,
    lastRefresh: "",
    displayCurrency: BASE_CURRENCY,
  },
  refreshing: false,
  error: "",
  notice: "",
  searchResults: [],
  searchLoading: false,
  // { symbol } while the sell dialog is open, otherwise null.
  sellRequest: null,
  // Per symbol: { status: "loading" | "ready" | "error", error, at }. The
  // series themselves live in the server-synced `History` model.
  historyStatus: {},
});

// Before anything renders: pick the UI language and start loading it.
void initLanguage();

RouterLink.register();
RouterOutlet.register();

class AppRoot extends Component {
  static tag = "app-root";

  refresh = () => {
    void refreshTrackedSymbols({ forceHistory: false });
  };

  render() {
    // Wait (briefly) for a downloaded language instead of flashing Swedish.
    if (!languageReady()) {
      return html`
        <div class="app-shell"></div>
      `;
    }

    const current = displayCurrency();
    return html`
      <div class="app-shell">
        <aside class="promo-strip">
          <span>${t("app.promoLead")}</span>
          <a
            href="https://sambokoll.se"
            target="_blank"
            rel="noopener"
          >${t("app.promoLink")} →</a>
        </aside>

        <header class="topbar">
          <router-link class="brand-link" to="/" title="${t("app.home")}">
            <span class="brand-block">
              <img
                class="brand-logo"
                src="/logo-96.png"
                width="42"
                height="42"
                alt="Stockroom"
              />
              <span class="brand-text">
                <span class="brand-title">Stockroom</span>
                <span class="brand-subtitle">${t("app.subtitle")}</span>
              </span>
            </span>
          </router-link>

          <nav class="nav-tabs">
            <router-link to="/">${t("nav.overview")}</router-link>
            <router-link to="/holdings">${t("nav.holdings")}</router-link>
            <router-link to="/transactions">${t(
              "nav.transactions",
            )}</router-link>
            <router-link to="/research">${t("nav.search")}</router-link>
            <router-link to="/settings">${t("nav.settings")}</router-link>
          </nav>

          <div class="topbar-actions">
            <div
              class="segmented"
              role="group"
              aria-label="${t("currency.display")}"
            >
              ${VIEW_CURRENCIES.map((currency) =>
                keyed(
                  currency,
                  html`
                    <button
                      type="button"
                      class="${`segment ${
                        current === currency ? "active" : ""
                      }`}"
                      aria-pressed="${current === currency}"
                      title="${t("currency.showIn", { currency })}"
                      on-click="${() => setDisplayCurrency(currency)}"
                    >
                      ${currency}
                    </button>
                  `,
                )
              )}
            </div>
            <button
              class="refresh-button"
              on-click="${this.refresh}"
              disabled="${state.refreshing}"
            >
              ${state.refreshing ? t("refresh.busy") : t("refresh.idle")}
            </button>
            <language-picker></language-picker>
          </div>
        </header>

        ${state.error
          ? html`
            <div class="status-banner error">
              <span>${state.error}</span>
              <button on-click="${() => state.error = ""}">${t(
                "common.close",
              )}</button>
            </div>
          `
          : ""} ${state.notice
          ? html`
            <div class="status-banner notice">
              <span>${state.notice}</span>
              <button on-click="${() => state.notice = ""}">${t(
                "common.close",
              )}</button>
            </div>
          `
          : ""}

        <main class="workspace">
          ${state.ready
            ? html`
              <router-outlet></router-outlet>
            `
            : html`
              <section class="loading-panel">${t("app.loading")}</section>
            `}
        </main>

        ${state.sellRequest
          ? html`
            <sell-dialog></sell-dialog>
          `
          : ""}
      </div>
    `;
  }
}

/**
 * Globe button in the top bar listing the EU languages by their own names.
 * Works as a menu button: arrow keys move between the options and Escape
 * closes the menu and returns focus to the button.
 */
class LanguagePicker extends Component {
  static tag = "language-picker";
  static properties = {
    open: { type: Boolean, default: false },
  };

  #focusMenu = false;

  disconnectedCallback() {
    this.stopListening();
    super.disconnectedCallback();
  }

  toggle = () => {
    if (this.open) this.close();
    else this.show();
  };

  show() {
    this.open = true;
    this.#focusMenu = true;
    document.addEventListener("pointerdown", this.handleOutside, true);
  }

  close(restoreFocus = false) {
    this.open = false;
    this.stopListening();
    if (restoreFocus) this.querySelector(".language-button")?.focus();
  }

  stopListening() {
    document.removeEventListener("pointerdown", this.handleOutside, true);
  }

  handleOutside = (event) => {
    if (!this.contains(event.target)) this.close();
  };

  handleButtonKeydown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!this.open) this.show();
    }
  };

  handleMenuKeydown = (event) => {
    const options = [...this.querySelectorAll(".language-option")];
    const index = options.indexOf(document.activeElement);
    const last = options.length - 1;
    const next = {
      ArrowDown: index >= last ? 0 : index + 1,
      ArrowUp: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];

    if (next !== undefined) {
      event.preventDefault();
      options[next].focus();
    } else if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      this.close(true);
    }
  };

  choose = async (code) => {
    this.close(true);
    try {
      await setLanguage(code);
    } catch {
      state.error = t("language.loadFailed", { language: languageName(code) });
    }
  };

  updated() {
    if (!this.open || !this.#focusMenu) return;
    this.#focusMenu = false;
    const option = this.querySelector(".language-option.active") ??
      this.querySelector(".language-option");
    option?.focus();
  }

  render() {
    const current = currentLanguage();
    const label = `${t("language.label")}: ${languageName(current)}`;
    return html`
      <button
        type="button"
        class="language-button"
        aria-haspopup="menu"
        aria-expanded="${String(this.open)}"
        aria-label="${label}"
        title="${label}"
        on-click="${this.toggle}"
        on-keydown="${this.handleButtonKeydown}"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path
            d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z"
          ></path>
        </svg>
        <span>${current.toUpperCase()}</span>
      </button>
      ${this.open
        ? html`
          <div
            class="language-menu"
            role="menu"
            aria-label="${t("language.menu")}"
            on-keydown="${this.handleMenuKeydown}"
          >
            ${LANGUAGES.map((language) =>
              keyed(
                language.code,
                html`
                  <button
                    type="button"
                    role="menuitemradio"
                    class="${`language-option ${
                      language.code === current ? "active" : ""
                    }`}"
                    aria-checked="${String(language.code === current)}"
                    lang="${language.code}"
                    on-click="${() => this.choose(language.code)}"
                  >
                    <span>${language.name}</span>
                    <small>${language.code.toUpperCase()}</small>
                  </button>
                `,
              )
            )}
          </div>
        `
        : ""}
    `;
  }
}

class DashboardPage extends Component {
  static tag = "dashboard-page";

  render() {
    const positions = getPositions();
    const summary = summarizePortfolio(positions);
    const holdings = positions.filter((position) => position.isHolding);
    const realizedPositions = positions
      .filter((position) => position.sellCount > 0)
      .sort((a, b) => b.realized - a.realized);

    return html`
      <section class="dashboard-grid">
        <div class="summary-band">
          <article class="metric primary-metric">
            <span class="metric-label">${t("dashboard.portfolioValue")}</span>
            <strong>${money(summary.totalValue)}</strong>
            <span class="${`metric-delta ${toneClass(summary.totalGain)}`}">
              ${t("dashboard.unrealizedDelta", {
                amount: moneySigned(summary.totalGain),
                percent: formatPercent(summary.totalGainPercent),
              })}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">${t("dashboard.dayChange")}</span>
            <strong class="${toneClass(summary.dayChange)}">
              ${moneySigned(summary.dayChange)}
            </strong>
            <span class="${`metric-delta ${toneClass(summary.dayChange)}`}">
              ${formatPercent(summary.dayChangePercent)}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">${t("label.realized")}</span>
            <strong class="${toneClass(summary.realized)}">
              ${moneySigned(summary.realized)}
            </strong>
            <span class="${`metric-delta ${
              summary.salesCount ? toneClass(summary.realized) : "neutral"
            }`}">
              ${summary.salesCount
                ? `${formatPercent(summary.realizedPercent)} · ${
                  t("count.sales", { count: summary.salesCount })
                }`
                : t("dashboard.noSalesYet")}
            </span>
          </article>
          <article class="metric">
            <span class="metric-label">${t("dashboard.costBasis")}</span>
            <strong>${money(summary.totalCost)}</strong>
            <span class="metric-delta neutral">${t("count.holdings", {
              count: summary.holdingsCount,
            })}</span>
          </article>
          <article class="metric">
            <span class="metric-label">${t("dashboard.totalReturn")}</span>
            <strong class="${toneClass(summary.totalReturn)}">
              ${moneySigned(summary.totalReturn)}
            </strong>
            <span class="metric-delta neutral">${t(
              "dashboard.totalReturnNote",
              { updated: lastRefreshText() },
            )}</span>
          </article>
        </div>

        <section class="panel holdings-panel">
          <div class="panel-heading">
            <div>
              <h2>${t("dashboard.holdingsTitle")}</h2>
              <p>${holdings.length
                ? t("dashboard.holdingsIntro")
                : t("dashboard.noHoldings")}</p>
            </div>
            ${holdings.length
              ? html`
                <button
                  type="button"
                  class="sell-button"
                  on-click="${() => openSellDialog()}"
                >
                  ${t("action.sellHolding")}
                </button>
              `
              : ""}
          </div>
          ${holdings.length
            ? html`
              <position-table .positions="${holdings}"></position-table>
            `
            : emptyState(t("dashboard.holdingsEmpty"))}
        </section>

        <section class="panel add-panel">
          <div class="panel-heading">
            <div>
              <h1>${t("dashboard.addTitle")}</h1>
              <p>${t("dashboard.addIntro")}</p>
            </div>
          </div>
          <add-lot-form></add-lot-form>
        </section>

        <section class="panel allocation-panel">
          <div class="panel-heading">
            <div>
              <h2>${t("dashboard.allocationTitle")}</h2>
              <p>${t("dashboard.allocationIntro")}</p>
            </div>
          </div>
          ${holdings.length
            ? allocationList(holdings, summary.totalValue)
            : emptyState(t("dashboard.allocationEmpty"))}
        </section>

        <section class="panel movers-panel">
          <div class="panel-heading">
            <div>
              <h2>${t("dashboard.moversTitle")}</h2>
              <p>${t("dashboard.moversIntro")}</p>
            </div>
          </div>
          ${summary.best
            ? html`
              <div class="mover-grid">
                ${moverCard(t("dashboard.best"), summary.best)} ${moverCard(
                  t("dashboard.worst"),
                  summary.worst,
                )}
              </div>
            `
            : emptyState(t("dashboard.moversEmpty"))}
        </section>

        <section class="panel realized-panel">
          <div class="panel-heading">
            <div>
              <h2>${t("dashboard.realizedTitle")}</h2>
              <p>${t("dashboard.realizedIntro")}</p>
            </div>
            ${realizedPositions.length
              ? html`
                <router-link class="panel-link" to="/transactions">${t(
                  "dashboard.allTransactions",
                )}</router-link>
              `
              : ""}
          </div>
          ${realizedPositions.length
            ? realizedList(realizedPositions)
            : emptyState(t("dashboard.realizedEmpty"))}
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
    currency: { type: String, default: BASE_CURRENCY },
    fxRate: { type: String, default: "1" },
    fxRateDirty: { type: Boolean, default: false },
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
    const currency = normalizeCurrency(this.currency) || BASE_CURRENCY;
    const fxRate = currency === BASE_CURRENCY ? 1 : Number(this.fxRate);

    if (!symbol || !Number.isFinite(quantity) || quantity <= 0) {
      this.message = t("lot.invalidInput");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      this.message = t("lot.invalidPrice", { currency });
      return;
    }
    if (!Number.isFinite(fxRate) || fxRate <= 0) {
      this.message = t("form.invalidFxRate", { base: BASE_CURRENCY, currency });
      return;
    }

    this.busy = true;
    try {
      await addLot({
        symbol,
        quantity,
        price,
        currency,
        fxRate,
        purchasedAt: this.purchasedAt || today(),
        fees: Number.isFinite(fees) && fees > 0 ? fees : 0,
        note: this.note.trim(),
      });
      const saved = {
        shares: formatShares(quantity),
        symbol,
        price: formatCurrency(price, currency),
      };
      this.message = currency === BASE_CURRENCY
        ? t("lot.saved", saved)
        : t("lot.savedConverted", {
          ...saved,
          converted: money(price * fxRate),
        });
      this.symbol = "";
      this.quantity = "";
      this.price = "";
      this.currency = BASE_CURRENCY;
      this.fxRate = "1";
      this.fxRateDirty = false;
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
    if (!this.symbolInputFocused()) return;
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
    await this.fillPrice();
  };

  closeSuggestions = () => {
    // Cancel a pending search so it cannot reopen the menu after blur.
    clearTimeout(this.searchTimer);
    this.lookupToken += 1;
    this.lookupLoading = false;
    setTimeout(() => {
      this.suggestionOpen = false;
    }, 120);
  };

  symbolInputFocused() {
    const input = this.querySelector("input[role='combobox']");
    return Boolean(input) && document.activeElement === input;
  }

  fillPrice = async () => {
    const symbol = normalizeSymbol(this.symbol);
    if (!symbol) {
      this.message = t("form.symbolFirst");
      return;
    }

    this.busy = true;
    try {
      const lookup = await lookupTradePrice(
        symbol,
        this.purchasedAt || today(),
      );
      this.currency = lookup.currency;
      this.price = priceInputValue(lookup.price);
      this.fxRate = rateInputValue(lookup.fxRate);
      this.fxRateDirty = false;
      this.message = describeLookup(symbol, lookup);
    } catch (error) {
      this.message = error.message;
    } finally {
      this.busy = false;
    }
  };

  changeCurrency = (event) => {
    this.currency = normalizeCurrency(event.target.value) || BASE_CURRENCY;
    this.fxRateDirty = false;
    void this.refreshFxRate();
  };

  changeDate = (event) => {
    this.purchasedAt = event.target.value;
    if (!this.fxRateDirty) void this.refreshFxRate();
  };

  async refreshFxRate() {
    if (this.currency === BASE_CURRENCY) {
      this.fxRate = "1";
      return;
    }
    try {
      const fx = await fxRateOn(this.currency, this.purchasedAt || today());
      if (this.fxRateDirty) return;
      this.fxRate = rateInputValue(fx.rate);
    } catch (error) {
      this.message = error.message;
    }
  }

  render() {
    const currency = normalizeCurrency(this.currency) || BASE_CURRENCY;
    const foreign = currency !== BASE_CURRENCY;
    const price = Number(this.price);
    const quantity = Number(this.quantity);
    const fxRate = foreign ? Number(this.fxRate) : 1;
    const fees = Number(this.fees || 0);
    const totalSek = Number.isFinite(price) && Number.isFinite(quantity) &&
        Number.isFinite(fxRate) && price > 0 && quantity > 0 && fxRate > 0
      ? (price * quantity + (Number.isFinite(fees) ? fees : 0)) * fxRate
      : null;

    return html`
      <form class="lot-form" novalidate on-submit="${this.submit}">
        <label class="ticker-field">
          <span>${t("form.symbol")}</span>
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
                    <div class="ticker-menu-status">${t(
                      "form.searching",
                    )}</div>
                  `
                  : html`
                    <div class="ticker-options">
                      ${this.suggestions.map((result) =>
                        keyed(
                          result.symbol,
                          html`
                            <button
                              type="button"
                              class="ticker-option"
                              on-mousedown="${(event) =>
                                event.preventDefault()}"
                              on-click="${() => this.chooseTicker(result)}"
                            >
                              <strong>${result.symbol}</strong>
                              <span>${result.name}</span>
                              <small>${[result.exchange, result.type]
                                .filter(Boolean)
                                .join(" / ")}</small>
                            </button>
                          `,
                        )
                      )}
                    </div>
                  `}
              </div>
            `
            : ""}
        </label>

        <label>
          <span>${t("label.quantity")}</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="12"
            .value="${this.quantity}"
            on-input="${(event) => this.quantity = event.target.value}"
          />
        </label>

        <label>
          <span>${t("form.pricePerShare")}</span>
          <div class="input-action">
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              .value="${this.price}"
              on-input="${(event) => this.price = event.target.value}"
            />
            ${currencySelect(currency, this.changeCurrency)}
            <button type="button" on-click="${this.fillPrice}" disabled="${this
              .busy}">
              ${t("form.fetch")}
            </button>
          </div>
        </label>

        <label>
          <span>${t("label.date")}</span>
          <input
            type="date"
            max="${today()}"
            .value="${this.purchasedAt}"
            on-change="${this.changeDate}"
          />
        </label>

        <label>
          <span>${t("form.fees", { currency })}</span>
          <input
            type="number"
            min="0"
            step="any"
            .value="${this.fees}"
            on-input="${(event) => this.fees = event.target.value}"
          />
        </label>

        ${foreign
          ? html`
            <label>
              <span>${t("form.fxRate", {
                base: BASE_CURRENCY,
                currency,
              })}</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="10.50"
                .value="${this.fxRate}"
                on-input="${(event) => {
                  this.fxRate = event.target.value;
                  this.fxRateDirty = true;
                }}"
              />
            </label>
          `
          : ""}

        <label class="${foreign ? "" : "wide-field"}">
          <span>${t("label.note")}</span>
          <input
            placeholder="${t("lot.notePlaceholder")}"
            .value="${this.note}"
            on-input="${(event) => this.note = event.target.value}"
          />
        </label>

        <div class="form-actions">
          <button class="primary-button" type="submit" disabled="${this.busy}">
            ${this.busy ? t("lot.busy") : t("lot.submit")}
          </button>
          <p>
            ${this.message ||
              (totalSek !== null
                ? `${t("lot.total", { amount: money(totalSek) })}${
                  foreign
                    ? ` · ${
                      formatCurrency(
                        price * quantity + (Number.isFinite(fees) ? fees : 0),
                        currency,
                      )
                    } × ${formatNumber(fxRate, 4)}`
                    : ""
                }`
                : "")}
          </p>
        </div>
      </form>
    `;
  }
}

/**
 * Modal for registering a full or partial sale. Opened by setting
 * `state.sellRequest`; the element mounts, shows the native <dialog>, and
 * unmounts again when the request is cleared.
 */
class SellDialog extends Component {
  static tag = "sell-dialog";
  static properties = {
    symbol: { type: String, default: "" },
    quantity: { type: String, default: "" },
    price: { type: String, default: "" },
    currency: { type: String, default: BASE_CURRENCY },
    fxRate: { type: String, default: "1" },
    fxRateDirty: { type: Boolean, default: false },
    soldAt: { type: String, default: today },
    fees: { type: String, default: "0" },
    note: { type: String, default: "" },
    message: { type: String, default: "" },
    busy: { type: Boolean, default: false },
  };

  #closing = false;
  #focused = false;

  connectedCallback() {
    const holdings = getPositions().filter((position) => position.isHolding);
    const requested = normalizeSymbol(state.sellRequest?.symbol ?? "");
    const initial = holdings.some((position) => position.symbol === requested)
      ? requested
      : holdings[0]?.symbol ?? "";
    if (initial) this.selectSymbol(initial);
    super.connectedCallback();
  }

  selectSymbol(symbol) {
    this.symbol = normalizeSymbol(symbol);
    this.quantity = "";
    this.message = "";
    this.fxRateDirty = false;

    const position = this.position();
    const quote = position?.quote;
    const currency = normalizeCurrency(quote?.currency) || BASE_CURRENCY;
    this.currency = currency;
    this.price = quote && Number.isFinite(quote.price) && quote.price > 0
      ? priceInputValue(quote.price)
      : "";

    if (currency === BASE_CURRENCY) {
      this.fxRate = "1";
    } else if (Number.isFinite(state.fxRates[currency])) {
      this.fxRate = rateInputValue(state.fxRates[currency]);
    } else {
      this.fxRate = "";
    }

    if (!this.price || !this.fxRate) void this.fetchPrice();
  }

  position() {
    if (!this.symbol) return null;
    return getPositions().find((position) => position.symbol === this.symbol) ??
      null;
  }

  available(position = this.position()) {
    if (!position) return 0;
    return availableToSell(
      position.lots,
      position.sales,
      this.soldAt || today(),
    );
  }

  fractionQuantity(fraction, available = this.available()) {
    if (available <= 0) return 0;
    if (fraction >= 1) return available;
    const raw = available * fraction;
    return roundQuantity(Number.isInteger(available) ? Math.floor(raw) : raw);
  }

  setFraction = (fraction) => {
    const quantity = this.fractionQuantity(fraction);
    this.quantity = quantity > 0 ? String(quantity) : "";
    this.message = "";
  };

  fetchPrice = async () => {
    if (!this.symbol) return;
    this.busy = true;
    try {
      const lookup = await lookupTradePrice(
        this.symbol,
        this.soldAt || today(),
      );
      this.currency = lookup.currency;
      this.price = priceInputValue(lookup.price);
      this.fxRate = rateInputValue(lookup.fxRate);
      this.fxRateDirty = false;
      this.message = describeLookup(this.symbol, lookup);
    } catch (error) {
      this.message = error.message;
    } finally {
      this.busy = false;
    }
  };

  changeCurrency = (event) => {
    this.currency = normalizeCurrency(event.target.value) || BASE_CURRENCY;
    this.fxRateDirty = false;
    void this.refreshFxRate();
  };

  changeDate = (event) => {
    this.soldAt = event.target.value;
    this.message = "";
    if (!this.fxRateDirty) void this.refreshFxRate();
  };

  async refreshFxRate() {
    if (this.currency === BASE_CURRENCY) {
      this.fxRate = "1";
      return;
    }
    try {
      const fx = await fxRateOn(this.currency, this.soldAt || today());
      if (this.fxRateDirty) return;
      this.fxRate = rateInputValue(fx.rate);
    } catch (error) {
      this.message = error.message;
    }
  }

  submit = async (event) => {
    event.preventDefault();
    const position = this.position();
    const quantity = roundQuantity(Number(this.quantity));
    const price = Number(this.price);
    const fees = Number(this.fees || 0);
    const soldAt = this.soldAt || today();
    const currency = normalizeCurrency(this.currency) || BASE_CURRENCY;
    const fxRate = currency === BASE_CURRENCY ? 1 : Number(this.fxRate);

    if (!position) {
      this.message = t("sell.chooseHolding");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.message = t("sell.invalidQuantity");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(soldAt)) {
      this.message = t("sell.invalidDate");
      return;
    }
    const available = this.available(position);
    if (quantity > available + QUANTITY_EPSILON) {
      this.message = available > 0
        ? t("sell.onlyAvailable", {
          count: available,
          symbol: position.symbol,
          date: formatDate(soldAt),
        })
        : t("sell.noneAvailable", {
          symbol: position.symbol,
          date: formatDate(soldAt),
        });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      this.message = t("sell.invalidPrice", { currency });
      return;
    }
    if (!Number.isFinite(fxRate) || fxRate <= 0) {
      this.message = t("form.invalidFxRate", { base: BASE_CURRENCY, currency });
      return;
    }
    if (!Number.isFinite(fees) || fees < 0) {
      this.message = t("sell.negativeFees");
      return;
    }

    this.busy = true;
    try {
      const { result } = await addSale({
        symbol: position.symbol,
        quantity,
        price,
        currency,
        fxRate,
        fees,
        soldAt,
        note: this.note.trim(),
      });
      state.notice = t("sell.notice", {
        shares: formatShares(quantity),
        symbol: position.symbol,
        amount: money(result.netProceeds),
        gain: moneySigned(result.gain),
        percent: formatPercent(result.gainPercent),
      });
      this.close();
    } catch (error) {
      this.message = error.message;
      this.busy = false;
    }
  };

  close = () => {
    this.#closing = true;
    const dialog = this.querySelector("dialog");
    if (dialog?.open) dialog.close();
    closeSellDialog();
  };

  handleClose = () => {
    this.#closing = true;
    closeSellDialog();
  };

  handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) this.close();
  };

  updated() {
    const dialog = this.querySelector("dialog");
    if (dialog && !dialog.open && !this.#closing && this.isConnected) {
      dialog.showModal();
    }
    syncSelect(this, "select.sell-symbol", this.symbol);

    if (!this.#focused) {
      const input = this.querySelector("input[name='quantity']");
      if (input) {
        input.focus();
        this.#focused = true;
      }
    }
  }

  render() {
    const positions = getPositions();
    const holdings = positions.filter((position) => position.isHolding);
    const position = positions.find((item) => item.symbol === this.symbol) ??
      null;

    return html`
      <dialog
        class="sell-dialog"
        aria-labelledby="sell-dialog-title"
        on-close="${this.handleClose}"
        on-click="${this.handleBackdropClick}"
      >
        ${position ? this.renderForm(position, holdings) : this.renderEmpty()}
      </dialog>
    `;
  }

  renderEmpty() {
    return html`
      <div class="sell-form">
        <div class="sell-head">
          <div>
            <h2 id="sell-dialog-title">${t("action.sellHolding")}</h2>
            <p>${t("sell.noHoldings")}</p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="${t("common.close")}"
            on-click="${this.close}"
          >
            ×
          </button>
        </div>
        ${emptyState(t("sell.emptyHint"))}
      </div>
    `;
  }

  renderForm(position, holdings) {
    const soldAt = this.soldAt || today();
    const available = this.available(position);
    const quantity = Number(this.quantity);
    const price = Number(this.price);
    const fees = Number(this.fees || 0);
    const currency = normalizeCurrency(this.currency) || BASE_CURRENCY;
    const foreign = currency !== BASE_CURRENCY;
    const fxRate = foreign ? Number(this.fxRate) : 1;
    const quantityOk = Number.isFinite(quantity) && quantity > 0 &&
      quantity <= available + QUANTITY_EPSILON;
    const priceOk = Number.isFinite(price) && price > 0;
    const fxOk = Number.isFinite(fxRate) && fxRate > 0;
    const preview = quantityOk && priceOk && fxOk
      ? previewSale(position.lots, position.sales, {
        quantity: roundQuantity(quantity),
        price,
        currency,
        fxRate,
        fees: Number.isFinite(fees) && fees > 0 ? fees : 0,
        soldAt,
      })
      : null;
    const oversold = Number.isFinite(quantity) && quantity > 0 &&
      quantity > available + QUANTITY_EPSILON;
    const sliderStep = Number.isInteger(available) ? 1 : 0.0001;
    const isToday = soldAt === today();
    const quote = position.quote;
    const dayTone = toneClass(quote?.changePercent ?? 0);
    const quoteCurrency = normalizeCurrency(quote?.currency) || BASE_CURRENCY;
    const showNative = quote && quoteCurrency !== displayCurrency();

    return html`
      <form class="sell-form" novalidate on-submit="${this.submit}">
        <div class="sell-head">
          <div>
            <h2 id="sell-dialog-title">${t("sell.title", {
              symbol: position.symbol,
            })}</h2>
            <p>
              ${position.name} · ${t("sell.intro", { base: BASE_CURRENCY })}
            </p>
          </div>
          <button
            type="button"
            class="icon-button"
            aria-label="${t("common.close")}"
            on-click="${this.close}"
          >
            ×
          </button>
        </div>

        ${holdings.length > 1
          ? html`
            <label class="sell-symbol-field">
              <span>${t("label.holding")}</span>
              <select
                class="sell-symbol"
                on-change="${(event) => this.selectSymbol(event.target.value)}"
              >
                ${holdings.map((item) =>
                  keyed(
                    item.symbol,
                    html`
                      <option value="${item.symbol}">${`${item.symbol} · ${
                        sharesText(item.shares)
                      } · ${money(item.marketValue)}`}</option>
                    `,
                  )
                )}
              </select>
            </label>
          `
          : ""}

        <div class="sell-facts">
          <div class="fact">
            <small>${t("label.holding")}</small>
            <strong>${sharesText(position.shares)}</strong>
            <span>${money(position.marketValue)}</span>
          </div>
          <div class="fact">
            <small>${t("label.averageCost")}</small>
            <strong>${money(position.averageCost)}</strong>
            <span>${t("label.inclFeesIn", { base: BASE_CURRENCY })}</span>
          </div>
          <div class="fact">
            <small>${t("label.priceNow")}</small>
            <strong>${money(position.price)}</strong>
            <span class="${dayTone}">${showNative
              ? `${formatCurrency(quote.price, quoteCurrency)} · ${
                formatPercent(quote?.changePercent ?? 0)
              }`
              : todayChange(quote?.changePercent ?? 0)}</span>
          </div>
          <div class="fact">
            <small>${t("label.unrealized")}</small>
            <strong class="${toneClass(position.gain)}">${moneySigned(
              position.gain,
            )}</strong>
            <span class="${toneClass(position.gain)}">${formatPercent(
              position.gainPercent,
            )}</span>
          </div>
        </div>

        <div class="sell-grid">
          <div class="quantity-field">
            <div class="field-heading">
              <span>${t("sell.quantity")}</span>
              <span class="${oversold ? "negative" : "muted"}">
                ${available > 0
                  ? isToday
                    ? t("sell.available", { shares: sharesText(available) })
                    : t("sell.availableOn", {
                      shares: sharesText(available),
                      date: formatDate(soldAt),
                    })
                  : isToday
                  ? t("sell.nothingAvailable")
                  : t("sell.nothingAvailableOn", { date: formatDate(soldAt) })}
              </span>
            </div>
            <div class="quantity-controls">
              <input
                name="quantity"
                type="number"
                inputmode="decimal"
                min="0"
                step="any"
                placeholder="0"
                .value="${this.quantity}"
                on-input="${(event) => {
                  this.quantity = event.target.value;
                  this.message = "";
                }}"
              />
              <div
                class="chip-row"
                role="group"
                aria-label="${t("sell.quickPicks")}"
              >
                ${[0.25, 0.5, 0.75, 1].map((fraction) => {
                  const value = this.fractionQuantity(fraction, available);
                  const active = value > 0 &&
                    Math.abs(value - quantity) < QUANTITY_EPSILON;
                  return keyed(
                    fraction,
                    html`
                      <button
                        type="button"
                        class="${`chip ${active ? "active" : ""}`}"
                        disabled="${available <= 0}"
                        on-click="${() => this.setFraction(fraction)}"
                      >
                        ${fraction >= 1
                          ? t("sell.all")
                          : percentLabel(fraction)}
                      </button>
                    `,
                  );
                })}
              </div>
            </div>
            <input
              class="quantity-slider"
              type="range"
              aria-label="${t("sell.quantity")}"
              min="0"
              max="${available}"
              step="${sliderStep}"
              disabled="${available <= 0}"
              .value="${Number.isFinite(quantity) && quantity > 0
                ? String(Math.min(quantity, available))
                : "0"}"
              on-input="${(event) => {
                this.quantity = event.target.value;
                this.message = "";
              }}"
            />
          </div>

          <label>
            <span>${t("form.pricePerShare")}</span>
            <div class="input-action">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                .value="${this.price}"
                on-input="${(event) => this.price = event.target.value}"
              />
              ${currencySelect(currency, this.changeCurrency)}
              <button
                type="button"
                on-click="${this.fetchPrice}"
                disabled="${this.busy}"
              >
                ${t("form.fetch")}
              </button>
            </div>
          </label>

          <label>
            <span>${t("label.date")}</span>
            <input
              type="date"
              max="${today()}"
              .value="${this.soldAt}"
              on-change="${this.changeDate}"
            />
          </label>

          <label>
            <span>${t("form.fees", { currency })}</span>
            <input
              type="number"
              min="0"
              step="any"
              .value="${this.fees}"
              on-input="${(event) => this.fees = event.target.value}"
            />
          </label>

          ${foreign
            ? html`
              <label>
                <span>${t("form.fxRate", {
                  base: BASE_CURRENCY,
                  currency,
                })}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="10.50"
                  .value="${this.fxRate}"
                  on-input="${(event) => {
                    this.fxRate = event.target.value;
                    this.fxRateDirty = true;
                  }}"
                />
              </label>
            `
            : ""}

          <label class="${foreign ? "wide-field" : ""}">
            <span>${t("label.note")}</span>
            <input
              placeholder="${t("sell.notePlaceholder")}"
              .value="${this.note}"
              on-input="${(event) => this.note = event.target.value}"
            />
          </label>
        </div>

        <div class="${`sell-preview ${
          preview ? toneClass(preview.gain) : "idle"
        }`}">
          <div>
            <small>${t("sell.netProceeds")}</small>
            <strong>${preview ? money(preview.netProceeds) : "–"}</strong>
            <span>${preview
              ? foreign
                ? `${
                  formatCurrency(
                    roundQuantity(quantity) * price -
                      (Number.isFinite(fees) ? fees : 0),
                    currency,
                  )
                } × ${formatNumber(fxRate, 4)}`
                : fees > 0
                ? t("sell.afterFees", { amount: money(fees) })
                : t("sell.proceedsFormula")
              : t("sell.proceedsFormula")}</span>
          </div>
          <div>
            <small>${t("sell.costBasis")}</small>
            <strong>${preview ? money(preview.costBasis) : "–"}</strong>
            <span>${preview
              ? t("sell.costFormula", {
                shares: formatShares(roundQuantity(quantity)),
                price: money(preview.averageCost),
              })
              : t("sell.averageMethod")}</span>
          </div>
          <div>
            <small>${t("sell.realizedResult")}</small>
            <strong class="${preview ? toneClass(preview.gain) : ""}">${preview
              ? moneySigned(preview.gain)
              : "–"}</strong>
            <span class="${preview ? toneClass(preview.gain) : ""}">${preview
              ? formatPercent(preview.gainPercent)
              : t("sell.enterQuantityPrice")}</span>
          </div>
          <div>
            <small>${t("sell.remaining")}</small>
            <strong>${sharesText(
              preview ? preview.remainingShares : position.shares,
            )}</strong>
            <span>${preview
              ? preview.remainingShares > QUANTITY_EPSILON
                ? money(preview.remainingShares * position.price)
                : t("sell.positionCloses")
              : t("sell.unchanged")}</span>
          </div>
        </div>

        <div class="sell-actions">
          <p class="${`inline-message ${oversold ? "negative" : ""}`}">
            ${this.message ||
              (oversold
                ? t("sell.maxQuantity", { shares: sharesText(available) })
                : "")}
          </p>
          <div class="button-row">
            <button type="button" on-click="${this.close}">${t(
              "common.cancel",
            )}</button>
            <button
              type="submit"
              class="sell-button"
              disabled="${this.busy || !quantityOk || !priceOk || !fxOk}"
            >
              ${this.busy
                ? t("sell.saving")
                : quantityOk
                ? t("sell.submitCount", { count: roundQuantity(quantity) })
                : t("action.sell")}
            </button>
          </div>
        </div>
      </form>
    `;
  }
}

// Labels are the `range.<value>` translations.
const CHART_RANGES = ["1mo", "3mo", "6mo", "1y", "2y", "5y"];

const CHART = {
  width: 760,
  height: 320,
  left: 62,
  right: 18,
  top: 18,
  bottom: 30,
};

/**
 * Holdings page: filterable list on the left, a large price chart with every
 * buy and sell plotted on it to the right, plus a per-trade timing list.
 */
class HoldingsPage extends Component {
  static tag = "holdings-page";
  static properties = {
    filter: { type: String, default: "" },
    scope: { type: String, default: "holdings" },
    range: { type: String, default: "6mo" },
    hoverIndex: { type: Number, default: -1 },
  };

  #symbol = "";
  #model = null;

  select = (symbol) => {
    this.hoverIndex = -1;
    navigate(`/holdings/${encodeURIComponent(symbol)}`);
  };

  setRange = (range) => {
    this.range = range;
    this.hoverIndex = -1;
  };

  handleChartMove = (event) => {
    const model = this.#model;
    if (!model) return;
    const svg = event.currentTarget.ownerSVGElement ?? event.currentTarget;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    if (!box.width) return;
    const viewX = (event.clientX - box.left) / box.width * CHART.width;
    const plotWidth = CHART.width - CHART.left - CHART.right;
    const ratio = Math.min(
      1,
      Math.max(0, (viewX - CHART.left) / plotWidth),
    );
    this.hoverIndex = Math.round(ratio * (model.points.length - 1));
  };

  handleChartLeave = () => {
    this.hoverIndex = -1;
  };

  updated() {
    if (this.#symbol) void ensureChart(this.#symbol, this.range);
  }

  selectedSymbol(positions) {
    const requested = normalizeSymbol(this.routeData?.params?.symbol ?? "");
    if (requested && positions.some((item) => item.symbol === requested)) {
      return requested;
    }
    return positions.find((item) => item.isHolding)?.symbol ??
      positions.find((item) => item.hasTrades)?.symbol ??
      positions[0]?.symbol ?? "";
  }

  render() {
    const positions = getPositions();
    const holdings = positions.filter((item) => item.isHolding);
    const closed = positions.filter((item) => item.isClosed);
    const scoped = this.scope === "holdings"
      ? holdings
      : this.scope === "closed"
      ? closed
      : positions;
    const needle = this.filter.trim().toUpperCase();
    const listed = scoped.filter((item) =>
      !needle || item.symbol.includes(needle) ||
      String(item.name ?? "").toUpperCase().includes(needle)
    );
    const symbol = this.selectedSymbol(positions);
    this.#symbol = symbol;
    const position = positions.find((item) => item.symbol === symbol) ?? null;

    return html`
      <section class="holdings-grid">
        <aside class="panel holdings-list-panel">
          <div class="panel-heading">
            <div>
              <h1>${t("holdings.title")}</h1>
              <p>${t("holdings.intro")}</p>
            </div>
          </div>
          <input
            class="filter-input"
            type="search"
            placeholder="${t("holdings.filter")}"
            .value="${this.filter}"
            on-input="${(event) => this.filter = event.target.value}"
          />
          <div
            class="chip-row scope-chips"
            role="group"
            aria-label="${t("holdings.scope")}"
          >
            ${scopeChip(
              this,
              "holdings",
              `${t("holdings.scopeOpen")} · ${holdings.length}`,
            )}
            ${scopeChip(
              this,
              "closed",
              `${t("holdings.scopeClosed")} · ${closed.length}`,
            )}
            ${scopeChip(
              this,
              "all",
              `${t("filter.all")} · ${positions.length}`,
            )}
          </div>
          ${listed.length
            ? html`
              <div class="holding-list">
                ${listed.map((item) =>
                  keyed(item.symbol, holdingListItem(item, symbol, this.select))
                )}
              </div>
            `
            : emptyState(
              positions.length ? t("holdings.noMatch") : t("holdings.empty"),
            )}
        </aside>

        <section class="panel holding-detail">
          ${position
            ? this.renderDetail(position)
            : emptyState(t("holdings.choose"))}
        </section>
      </section>
    `;
  }

  renderDetail(position) {
    const quote = position.quote;
    const chartCurrency = normalizeCurrency(quote?.currency) || BASE_CURRENCY;
    const showNative = chartCurrency !== displayCurrency();
    const chart = chartFor(position.symbol, this.range);
    const model = chartModel(position, chart.history, this.range);
    this.#model = model;
    const hover = model && this.hoverIndex >= 0 &&
        this.hoverIndex < model.points.length
      ? this.hoverIndex
      : -1;
    const trades = tradeTimeline(position, chartCurrency);
    const nativeAverage = model?.nativeAverage ??
      nativeAverageCost(position, chartCurrency);

    return html`
      <div class="detail-head">
        <div>
          <h2>${position.symbol}</h2>
          <p>
            ${[
              position.name,
              quote?.exchange,
              t("holdings.listedIn", { currency: chartCurrency }),
            ].filter(Boolean).join(" · ")}
          </p>
        </div>
        ${position.isHolding
          ? html`
            <button
              type="button"
              class="sell-button"
              on-click="${() => openSellDialog(position.symbol)}"
            >
              ${t("sell.title", { symbol: position.symbol })}
            </button>
          `
          : position.isClosed
          ? html`
            <span class="pill closed">${t("holdings.closedPosition")}</span>
          `
          : html`
            <span class="pill closed">${t("holdings.watched")}</span>
          `}
      </div>

      <div class="detail-stats">
        <div class="fact">
          <small>${t("label.price")}</small>
          <strong>${money(position.price)}</strong>
          <span class="${toneClass(
            quote?.changePercent ?? 0,
          )}">${showNative && quote
            ? `${formatCurrency(quote.price, chartCurrency)} · ${
              formatPercent(quote?.changePercent ?? 0)
            }`
            : todayChange(quote?.changePercent ?? 0)}</span>
        </div>
        <div class="fact">
          <small>${t("label.holding")}</small>
          <strong>${sharesText(position.shares)}</strong>
          <span>${money(position.marketValue)}</span>
        </div>
        <div class="fact">
          <small>${t("label.averageCost")}</small>
          <strong>${position.isHolding
            ? money(position.averageCost)
            : "–"}</strong>
          <span>${position.isHolding && showNative && nativeAverage
            ? `${formatCurrency(nativeAverage, chartCurrency)} · ${
              t("common.inclFees")
            }`
            : t("common.inclFees")}</span>
        </div>
        <div class="fact">
          <small>${t("label.unrealized")}</small>
          <strong class="${toneClass(position.gain)}">${moneySigned(
            position.gain,
          )}</strong>
          <span class="${toneClass(position.gain)}">${position.isHolding
            ? formatPercent(position.gainPercent)
            : t("holdings.noOpenPosition")}</span>
        </div>
        <div class="fact">
          <small>${t("label.realized")}</small>
          <strong class="${toneClass(position.realized)}">${moneySigned(
            position.realized,
          )}</strong>
          <span class="${position.sellCount
            ? toneClass(position.realized)
            : "muted"}">${position
              .sellCount
            ? `${formatPercent(position.realizedPercent)} · ${
              t("count.sales", { count: position.sellCount })
            }`
            : t("common.noSales")}</span>
        </div>
      </div>

      <div class="chart-toolbar">
        <div class="chip-row" role="group" aria-label="${t("holdings.range")}">
          ${CHART_RANGES.map((range) =>
            keyed(
              range,
              html`
                <button
                  type="button"
                  class="${`chip ${this.range === range ? "active" : ""}`}"
                  on-click="${() => this.setRange(range)}"
                >
                  ${t(`range.${range}`)}
                </button>
              `,
            )
          )}
        </div>
        <div class="chart-legend">
          <span><i class="legend-buy"></i> ${t("trade.buy")}</span>
          <span><i class="legend-sell"></i> ${t("trade.sell")}</span>
          ${position.isHolding
            ? html`
              <span><i class="legend-avg"></i> ${t("label.averageCost")}</span>
            `
            : ""}
          <span><i class="legend-line"></i> ${t("chart.legendClose", {
            currency: chartCurrency,
          })}</span>
        </div>
      </div>

      ${model
        ? priceChart(
          model,
          hover,
          position,
          this.handleChartMove,
          this.handleChartLeave,
        )
        : chart.status === "error"
        ? emptyState(t("chart.loadFailed", { error: chart.error }))
        : emptyState(
          chart.status === "loading" ? t("chart.loading") : t("chart.noData"),
        )}

      ${model
        ? html`
          <p class="chart-caption">
            <span class="${model.tone}">${formatPercent(
              model.changePercent,
            )}</span>
            ${[
              t("chart.duringPeriod"),
              t("chart.high", {
                price: formatCurrency(model.high, model.currency),
              }),
              t("chart.low", {
                price: formatCurrency(model.low, model.currency),
              }),
              model.outside ? t("chart.outside", { count: model.outside }) : "",
              chart.status === "loading" ? t("chart.updating") : "",
            ].filter(Boolean).join(" · ")}
          </p>
        `
        : ""}

      <div class="detail-section-heading">
        <h3>${t("holdings.tradesTitle", { symbol: position.symbol })}</h3>
        <p>${t("holdings.tradesIntro")}</p>
      </div>
      ${trades.length
        ? html`
          <div class="timing-list">
            ${trades.map((trade) => keyed(trade.id, timingRow(trade, model)))}
          </div>
        `
        : emptyState(t("holdings.noTrades"))}
    `;
  }
}

function scopeChip(page, value, label) {
  return html`
    <button
      type="button"
      class="${`chip ${page.scope === value ? "active" : ""}`}"
      on-click="${() => page.scope = value}"
    >
      ${label}
    </button>
  `;
}

function holdingListItem(position, selected, onSelect) {
  const quote = position.quote;
  return html`
    <button
      type="button"
      class="${`holding-item ${position.symbol === selected ? "active" : ""}`}"
      aria-pressed="${position.symbol === selected}"
      on-click="${() => onSelect(position.symbol)}"
    >
      <strong>${position.symbol}</strong>
      <b>${position.isHolding
        ? money(position.marketValue)
        : money(position.price)}</b>
      <span>${position.name}</span>
      <small class="${position.isHolding
        ? toneClass(position.gain)
        : toneClass(quote?.changePercent ?? 0)}">${position.isHolding
        ? `${sharesText(position.shares)} · ${
          formatPercent(position.gainPercent)
        }`
        : position.isClosed
        ? t("holdings.closedResult", { amount: moneySigned(position.realized) })
        : todayChange(quote?.changePercent ?? 0)}</small>
    </button>
  `;
}

function chartFor(symbol, range) {
  const status = state.historyStatus[symbol];
  const history = recentHistory(symbol, range);
  return {
    status: status?.status ?? (history ? "ready" : "loading"),
    error: status?.error ?? "",
    history,
  };
}

function ensureChart(symbol, _range) {
  return loadHistory(symbol);
}

/** Every trade for a symbol with its price expressed in the chart currency. */
function tradeTimeline(position, chartCurrency) {
  const quote = position.quote;
  const currentNative = quote && Number.isFinite(quote.price)
    ? quote.price
    : null;

  const toNative = (record) => {
    const currency = tradeCurrency(record);
    if (currency === chartCurrency) {
      return { price: Number(record.price) || 0, exact: true };
    }
    const converted = convertFromSek(
      tradeUnitCost(record),
      chartCurrency,
      state.fxRates,
    );
    return {
      price: Number.isFinite(converted) ? converted : null,
      exact: false,
    };
  };

  const entries = [
    ...position.lots.map((lot) => ({
      id: lot.id,
      type: "buy",
      date: lot.purchasedAt ?? "",
      createdAt: lot.createdAt ?? "",
      record: lot,
      result: null,
    })),
    ...position.sales.map((sale) => ({
      id: sale.id,
      type: "sell",
      date: sale.soldAt ?? "",
      createdAt: sale.createdAt ?? "",
      record: sale,
      result: position.ledger.saleResults.get(sale.id) ?? null,
    })),
  ];

  return entries
    .map((entry) => {
      const native = toNative(entry.record);
      const since = currentNative && native.price > 0
        ? (currentNative - native.price) / native.price * 100
        : null;
      return { ...entry, native, since, chartCurrency };
    })
    .sort((a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    );
}

/**
 * Average cost expressed in the chart (quote) currency – exact when every
 * trade was made in that currency, otherwise converted at today's rate.
 */
function nativeAverageCost(position, chartCurrency) {
  if (!position.isHolding) return null;
  let approximate = false;

  const convert = (record) => {
    const currency = tradeCurrency(record);
    if (currency === chartCurrency) {
      return {
        ...record,
        price: Number(record.price) || 0,
        fees: Number(record.fees) || 0,
        currency: chartCurrency,
        fxRate: 1,
      };
    }
    approximate = true;
    const rate = tradeFxRate(record);
    const price = convertFromSek(
      (Number(record.price) || 0) * rate,
      chartCurrency,
      state.fxRates,
    );
    const fees = convertFromSek(
      (Number(record.fees) || 0) * rate,
      chartCurrency,
      state.fxRates,
    );
    if (price === null || fees === null) return null;
    return { ...record, price, fees, currency: chartCurrency, fxRate: 1 };
  };

  const lots = position.lots.map(convert);
  const sales = position.sales.map(convert);
  if (lots.includes(null) || sales.includes(null)) return null;

  const ledger = buildLedger(lots, sales);
  if (!(ledger.shares > 0)) return null;
  return ledger.averageCost;
}

function chartModel(position, history, range) {
  // Skip data gaps: cached histories may still contain bars Yahoo delivered
  // as null, and a price is never zero or negative.
  const points = (history?.points ?? []).filter((point) =>
    Number.isFinite(point.close) && point.close > 0 && point.date
  );
  if (points.length < 2) return null;

  const quote = position.quote;
  const currency = normalizeCurrency(quote?.currency) || BASE_CURRENCY;
  const divisor = minorUnit(quote?.rawCurrency ?? quote?.currency).divisor;
  const closes = points.map((point) => point.close / divisor);
  const firstDate = points[0].date;

  const timeline = tradeTimeline(position, currency);
  const markers = [];
  let outside = 0;
  for (const trade of timeline) {
    if (!trade.date || trade.date < firstDate) {
      outside += 1;
      continue;
    }
    let index = points.findIndex((point) => point.date >= trade.date);
    if (index === -1) index = points.length - 1;
    const value = trade.native.price > 0 ? trade.native.price : closes[index];
    markers.push({ ...trade, index, value, close: closes[index] });
  }
  markers.sort((a, b) => a.index - b.index);

  const nativeAverage = nativeAverageCost(position, currency);
  const values = [
    ...closes,
    ...markers.map((marker) => marker.value),
    ...(nativeAverage ? [nativeAverage] : []),
  ];
  let min = Math.min(...values);
  let max = Math.max(...values);
  const pad = (max - min || Math.abs(max) * 0.05 || 1) * 0.08;
  min -= pad;
  max += pad;

  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const x = (index) => CHART.left + index / (points.length - 1) * plotWidth;
  const y = (value) =>
    CHART.top + (1 - (value - min) / (max - min)) * plotHeight;
  const baseline = CHART.top + plotHeight;

  // Markers on the same day at (almost) the same price would sit on top of
  // each other – spread them a few pixels sideways so both stay visible.
  const groups = new Map();
  for (const marker of markers) {
    const key = `${marker.index}:${Math.round(y(marker.value) / 10)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(marker);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.forEach((marker, position) => {
      marker.dx = (position - (group.length - 1) / 2) * 11;
    });
  }

  const linePath = closes
    .map((value, index) =>
      `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(value).toFixed(1)}`
    )
    .join(" ");
  const areaPath = `${linePath} L${x(closes.length - 1).toFixed(1)} ${
    baseline.toFixed(1)
  } L${x(0).toFixed(1)} ${baseline.toFixed(1)} Z`;

  const first = closes[0];
  const last = closes.at(-1);
  const change = last - first;

  return {
    points,
    closes,
    currency,
    markers,
    outside,
    nativeAverage,
    min,
    max,
    x,
    y,
    baseline,
    plotWidth,
    plotHeight,
    linePath,
    areaPath,
    yTicks: niceTicks(min, max, 6).map((value) => ({ value, y: y(value) })),
    xTicks: spreadIndices(points.length, 6).map((index) => ({
      index,
      x: x(index),
      label: axisDate(points[index].date, range),
    })),
    first,
    last,
    change,
    changePercent: first ? change / first * 100 : 0,
    tone: toneClass(change),
    high: Math.max(...closes),
    low: Math.min(...closes),
  };
}

function priceChart(model, hover, position, onMove, onLeave) {
  const hovered = hover >= 0
    ? {
      index: hover,
      x: model.x(hover),
      y: model.y(model.closes[hover]),
      date: model.points[hover].date,
      close: model.closes[hover],
      trades: model.markers
        .filter((marker) => marker.index === hover)
        .map((marker) => ({
          ...marker,
          text: tradeAtText(
            marker.type,
            marker.record.quantity,
            formatCurrency(marker.native.price ?? marker.close, model.currency),
          ),
        })),
    }
    : null;
  const tooltipLeft = hovered && hovered.x > CHART.width / 2;
  // Wide enough for the longest trade line: roughly 0.6em per character at
  // the chart's font size, which is larger on phones (see styles.css).
  const fontSize = matchMedia("(max-width: 640px)").matches ? 15 : 11;
  const tooltipWidth = Math.max(
    176,
    ...(hovered?.trades ?? []).map((trade) =>
      Math.ceil(trade.text.length * fontSize * 0.6) + 20
    ),
  );
  const tooltipHeight = 44 + (hovered?.trades.length ?? 0) * 16;
  const tooltipX = hovered
    ? tooltipLeft ? hovered.x - tooltipWidth - 12 : hovered.x + 12
    : 0;
  const tooltipY = hovered
    ? Math.max(
      CHART.top,
      Math.min(hovered.y - 20, model.baseline - tooltipHeight),
    )
    : 0;

  // Note: every nested template below starts with an inner <svg>. BedrockJS
  // parses each template as HTML, so bare <g>/<line>/<text> roots would be
  // created as HTML elements and never render inside the chart.
  return html`
    <svg
      class="${`price-chart ${model.tone}`}"
      viewBox="${`0 0 ${CHART.width} ${CHART.height}`}"
      role="img"
      aria-label="${t("chart.label", { symbol: position.symbol })}"
      on-pointermove="${onMove}"
      on-pointerdown="${onMove}"
      on-pointerleave="${onLeave}"
    >
      <defs>
        <linearGradient id="price-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.22"></stop>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0"></stop>
        </linearGradient>
      </defs>

      <g class="chart-grid">
        ${model.yTicks.map((tick) =>
          keyed(
            tick.value,
            html`
              <svg overflow="visible">
                <line
                  x1="${CHART.left}"
                  x2="${CHART.width - CHART.right}"
                  y1="${tick.y.toFixed(1)}"
                  y2="${tick.y.toFixed(1)}"
                ></line>
                <text
                  x="${CHART.left - 8}"
                  y="${(tick.y + 3.5).toFixed(1)}"
                  text-anchor="end"
                >
                  ${axisPrice(tick.value)}
                </text>
              </svg>
            `,
          )
        )}
      </g>

      <g class="chart-axis">
        ${model.xTicks.map((tick) =>
          keyed(
            tick.index,
            html`
              <svg overflow="visible">
                <text
                  x="${tick.x.toFixed(1)}"
                  y="${CHART.height - 9}"
                  text-anchor="middle"
                >
                  ${tick.label}
                </text>
              </svg>
            `,
          )
        )}
      </g>

      <path
        class="chart-area"
        d="${model.areaPath}"
        fill="url(#price-chart-fill)"
      ></path>
      <path class="chart-line" d="${model.linePath}"></path>

      ${model.nativeAverage
        ? html`
          <svg overflow="visible" class="chart-average">
            <line
              x1="${CHART.left}"
              x2="${CHART.width - CHART.right}"
              y1="${model.y(model.nativeAverage).toFixed(1)}"
              y2="${model.y(model.nativeAverage).toFixed(1)}"
            ></line>
            <text
              x="${CHART.width - CHART.right}"
              y="${(model.y(model.nativeAverage) - 6).toFixed(1)}"
              text-anchor="end"
            >
              ${t("common.avg", {
                price: formatCurrency(model.nativeAverage, model.currency),
              })}
            </text>
          </svg>
        `
        : ""}

      <g class="chart-markers">
        ${model.markers.map((marker) =>
          keyed(marker.id, chartMarker(marker, model))
        )}
      </g>

      ${hovered
        ? html`
          <svg overflow="visible" class="chart-hover">
            <line
              x1="${hovered.x.toFixed(1)}"
              x2="${hovered.x.toFixed(1)}"
              y1="${CHART.top}"
              y2="${model.baseline}"
            ></line>
            <circle
              cx="${hovered.x.toFixed(1)}"
              cy="${hovered.y.toFixed(1)}"
              r="4.5"
            ></circle>
            <g transform="${`translate(${tooltipX.toFixed(1)} ${
              tooltipY.toFixed(1)
            })`}">
              <rect width="${tooltipWidth}" height="${tooltipHeight}" rx="6"></rect>
              <text class="tooltip-date" x="10" y="17">${formatDate(
                hovered.date,
              )}</text>
              <text class="tooltip-price" x="10" y="35">
                ${formatCurrency(hovered.close, model.currency)}
              </text>
              ${hovered.trades.map((trade, index) =>
                keyed(
                  trade.id,
                  html`
                    <svg overflow="visible">
                      <text
                        class="${`tooltip-trade ${trade.type}`}"
                        x="10"
                        y="${51 + index * 16}"
                      >
                        ${trade.text}
                      </text>
                    </svg>
                  `,
                )
              )}
            </g>
          </svg>
        `
        : ""}
    </svg>
  `;
}

function chartMarker(marker, model) {
  const cx = model.x(marker.index) + (marker.dx ?? 0);
  const cy = model.y(marker.value);
  const label = `${
    tradeAtText(
      marker.type,
      marker.record.quantity,
      formatCurrency(marker.value, model.currency),
    )
  }${marker.native.exact ? "" : ` ${t("chart.converted")}`} · ${
    formatDate(marker.date)
  }`;

  return marker.type === "buy"
    ? html`
      <svg overflow="visible" class="marker buy">
        <title>${label}</title>
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6"></circle>
      </svg>
    `
    : html`
      <svg overflow="visible" class="marker sell">
        <title>${label}</title>
        <path d="${`M${cx.toFixed(1)} ${(cy - 7).toFixed(1)} L${
          (cx + 7).toFixed(1)
        } ${cy.toFixed(1)} L${cx.toFixed(1)} ${(cy + 7).toFixed(1)} L${
          (cx - 7).toFixed(1)
        } ${cy.toFixed(1)} Z`}"></path>
      </svg>
    `;
}

function timingRow(trade, model) {
  const isBuy = trade.type === "buy";
  const record = trade.record;
  const currency = tradeCurrency(record);
  const since = trade.since;
  const unchanged = since !== null && Math.abs(since) < 0.005;
  const timingTone = since === null || unchanged
    ? "neutral"
    : toneClass(isBuy ? since : -since);
  const verdict = since === null
    ? t("common.waitingForPrice")
    : unchanged
    ? t("timing.unchanged")
    : isBuy
    ? since >= 0 ? t("timing.risenSinceBuy") : t("timing.fallenSinceBuy")
    : since <= 0
    ? t("timing.goodSell")
    : t("timing.risenSinceSell");
  const inChart = model
    ? model.markers.some((marker) => marker.id === trade.id)
    : false;

  return html`
    <article class="${`timing-row ${trade.type}`}">
      <span class="${`badge ${trade.type}`}">${tradeLabel(trade.type)}</span>
      <div>
        <strong>${formatDate(trade.date)}</strong>
        <span>${t("trade.sharesAt", {
          shares: sharesText(record.quantity),
          price: formatCurrency(Number(record.price) || 0, currency),
        })}${model && !inChart ? ` · ${t("timing.outsideChart")}` : ""}</span>
      </div>
      <div>
        <span class="cell-label">${isBuy
          ? t("label.cost")
          : t("label.proceeds")}</span>
        <strong>${money(tradeAmount(record, trade.type))}</strong>
      </div>
      <div>
        <span class="cell-label">${t("timing.priceSince")}</span>
        <strong class="${timingTone}">${since === null
          ? "–"
          : formatPercent(since)}</strong>
        <small class="muted">${verdict}</small>
      </div>
      <div>
        <span class="cell-label">${isBuy
          ? t("label.note")
          : t("label.realized")}</span>
        ${isBuy
          ? html`
            <strong class="muted">${record.note || "–"}</strong>
          `
          : html`
            <strong class="${toneClass(trade.result?.gain ?? 0)}">${moneySigned(
              trade.result?.gain ?? 0,
            )}</strong>
            <small class="${toneClass(
              trade.result?.gain ?? 0,
            )}">${formatPercent(
              trade.result?.gainPercent ?? 0,
            )}</small>
          `}
      </div>
    </article>
  `;
}

function niceTicks(min, max, maxTicks = 6) {
  const span = max - min || 1;
  const magnitude = 10 ** Math.floor(Math.log10(span / maxTicks));
  const candidates = [1, 2, 2.5, 5, 10, 20, 25, 50].map((factor) =>
    factor * magnitude
  );

  for (const step of candidates) {
    const ticks = ticksForStep(min, max, step);
    if (ticks.length <= maxTicks) return ticks;
  }
  return ticksForStep(min, max, candidates.at(-1));
}

function ticksForStep(min, max, step) {
  const ticks = [];
  for (
    let value = Math.ceil(min / step) * step;
    value <= max + step * 1e-6;
    value += step
  ) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
}

function spreadIndices(length, count) {
  if (length <= count) return Array.from({ length }, (_, index) => index);
  const indices = new Set();
  for (let step = 0; step < count; step += 1) {
    indices.add(Math.round(step * (length - 1) / (count - 1)));
  }
  return [...indices];
}

function axisDate(value, range) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const short = range === "1mo" || range === "3mo" || range === "6mo";
  return new Intl.DateTimeFormat(
    getFormatLocale(),
    short
      ? { day: "numeric", month: "short" }
      : { month: "short", year: "2-digit" },
  ).format(date);
}

function axisPrice(value) {
  return new Intl.NumberFormat(getFormatLocale(), {
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
  }).format(value);
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

class TransactionsPage extends Component {
  static tag = "transactions-page";
  static properties = {
    typeFilter: { type: String, default: "all" },
    symbolFilter: { type: String, default: "" },
  };

  updated() {
    syncSelect(this, "select.symbol-filter", this.effectiveSymbolFilter());
  }

  effectiveSymbolFilter() {
    const symbols = new Set(getTrackedSymbolsWithTrades());
    return symbols.has(this.symbolFilter) ? this.symbolFilter : "";
  }

  render() {
    const positions = getPositions();
    const bySymbol = new Map(
      positions.map((position) => [position.symbol, position]),
    );
    const entries = buildTransactionEntries(bySymbol);
    const symbols = [...new Set(entries.map((entry) => entry.symbol))].sort();
    const symbolFilter = symbols.includes(this.symbolFilter)
      ? this.symbolFilter
      : "";
    const inScope = entries.filter((entry) =>
      !symbolFilter || entry.symbol === symbolFilter
    );
    const visible = inScope.filter((entry) =>
      this.typeFilter === "all" || entry.type === this.typeFilter
    );
    const buys = inScope.filter((entry) => entry.type === "buy");
    const sells = inScope.filter((entry) => entry.type === "sell");
    const invested = buys.reduce(
      (total, entry) => total + tradeAmount(entry.record, "buy"),
      0,
    );
    const proceeds = sells.reduce(
      (total, entry) => total + (entry.result?.netProceeds ?? 0),
      0,
    );
    const realized = sells.reduce(
      (total, entry) => total + (entry.result?.gain ?? 0),
      0,
    );
    const realizedCost = sells.reduce(
      (total, entry) => total + (entry.result?.costBasis ?? 0),
      0,
    );
    const hasHoldings = positions.some((position) => position.isHolding);

    return html`
      <section class="page-stack">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>${t("transactions.title")}</h1>
              <p>${t("transactions.intro", { base: BASE_CURRENCY })}</p>
            </div>
            ${hasHoldings
              ? html`
                <button
                  type="button"
                  class="sell-button"
                  on-click="${() => openSellDialog(symbolFilter)}"
                >
                  ${t("action.sellHolding")}
                </button>
              `
              : ""}
          </div>

          ${entries.length
            ? html`
              <div class="tx-summary">
                <div class="fact">
                  <small>${t("transactions.invested")}</small>
                  <strong>${money(invested)}</strong>
                  <span>${t("count.buys", { count: buys.length })}</span>
                </div>
                <div class="fact">
                  <small>${t("transactions.soldFor")}</small>
                  <strong>${money(proceeds)}</strong>
                  <span>${t("count.sales", { count: sells.length })}</span>
                </div>
                <div class="fact">
                  <small>${t("label.realized")}</small>
                  <strong class="${toneClass(realized)}">${moneySigned(
                    realized,
                  )}</strong>
                  <span class="${sells.length ? toneClass(realized) : "muted"}">
                    ${sells.length
                      ? formatPercent(
                        realizedCost > 0 ? realized / realizedCost * 100 : 0,
                      )
                      : t("common.noSales")}
                  </span>
                </div>
              </div>

              <div class="filter-bar">
                <div
                  class="chip-row"
                  role="group"
                  aria-label="${t("transactions.type")}"
                >
                  ${filterChip(
                    this,
                    "all",
                    `${t("filter.all")} · ${inScope.length}`,
                  )}
                  ${filterChip(
                    this,
                    "buy",
                    `${t("trade.buy")} · ${buys.length}`,
                  )}
                  ${filterChip(
                    this,
                    "sell",
                    `${t("trade.sell")} · ${sells.length}`,
                  )}
                </div>
                <select
                  class="symbol-filter"
                  aria-label="${t("transactions.symbolFilter")}"
                  on-change="${(event) =>
                    this.symbolFilter = event.target.value}"
                >
                  <option value="">${t("transactions.allSymbols")}</option>
                  ${symbols.map((symbol) =>
                    keyed(
                      symbol,
                      html`
                        <option value="${symbol}">${symbol}</option>
                      `,
                    )
                  )}
                </select>
              </div>
            `
            : ""}

          ${visible.length
            ? html`
              <div class="transaction-list">
                ${visible.map((entry) =>
                  keyed(entry.id, transactionRow(entry))
                )}
              </div>
            `
            : emptyState(
              entries.length
                ? t("transactions.noMatch")
                : t("transactions.empty"),
            )}
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
        this.message = t("research.noResults");
      }
    } catch (error) {
      this.message = error.message;
    } finally {
      state.searchLoading = false;
    }
  };

  track = async (symbol) => {
    await trackSymbol(symbol);
    this.message = t("research.watching", { symbol });
  };

  render() {
    const positions = getPositions();
    return html`
      <section class="research-grid">
        <section class="panel search-panel">
          <div class="panel-heading">
            <div>
              <h1>${t("research.title")}</h1>
              <p>${t("research.intro")}</p>
            </div>
          </div>
          <form class="search-form" on-submit="${this.search}">
            <input
              autocomplete="off"
              placeholder="${t("research.placeholder")}"
              .value="${this.query}"
              on-input="${(event) => this.query = event.target.value}"
            />
            <button class="primary-button" disabled="${state.searchLoading}">
              ${state.searchLoading
                ? t("research.searching")
                : t("research.search")}
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
                    <button on-click="${() => this.track(result.symbol)}">${t(
                      "research.watch",
                    )}</button>
                  </article>
                `,
              )
            )}
          </div>
        </section>

        <section class="panel watch-panel">
          <div class="panel-heading">
            <div>
              <h2>${t("research.watchedTitle")}</h2>
              <p>${t("research.watchedIntro")}</p>
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
            : emptyState(t("research.watchedEmpty"))}
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
      version: 2,
      exportedAt: new Date().toISOString(),
      lots: state.lots,
      sales: state.sales,
      watchlist: state.watchlist,
      quotes: state.quotes,
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
      let data;
      try {
        data = JSON.parse(await file.text());
      } catch {
        throw new Error(t("import.invalid"));
      }
      const clean = validateImport(data);
      await replaceAllData(clean);
      await hydrateState();
      const counts = {
        buys: t("count.buys", { count: clean.lots.length }),
        sales: t("count.sales", { count: clean.sales.length }),
      };
      this.message = clean.skipped
        ? t("settings.importedSkipped", {
          ...counts,
          skipped: t("count.skipped", { count: clean.skipped }),
        })
        : t("settings.imported", counts);
    } catch (error) {
      this.message = error.message;
    } finally {
      this.busy = false;
      event.target.value = "";
    }
  };

  clearData = async () => {
    if (!confirm(t("settings.confirmClear"))) return;
    await clearAllLocalData();
    await hydrateState();
    this.message = t("settings.cleared");
  };

  persistStorage = async () => {
    if (!navigator.storage?.persist) {
      this.message = t("settings.persistUnavailable");
      return;
    }
    const granted = await navigator.storage.persist();
    this.message = granted
      ? t("settings.persistGranted")
      : t("settings.persistDenied");
  };

  render() {
    const current = displayCurrency();
    const knownRates = Object.entries(state.fxRates)
      .filter(([, rate]) => Number.isFinite(rate))
      .sort(([a], [b]) => a.localeCompare(b));

    return html`
      <section class="settings-grid">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h1>${t("settings.localTitle")}</h1>
              <p>${t("settings.localIntro")}</p>
            </div>
          </div>
          <div class="settings-actions">
            <button class="primary-button" on-click="${this
              .exportData}">
              ${t("settings.export")}
            </button>
            <label class="file-button">
              ${t("settings.import")}
              <input type="file" accept="application/json" on-change="${this
                .importData}" />
            </label>
            <button on-click="${this.persistStorage}">${t(
              "settings.persist",
            )}</button>
            <button class="danger-button" on-click="${this.clearData}">
              ${t("settings.clear")}
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
              <h2>${t("settings.storageTitle")}</h2>
              <p>${t("settings.storageIntro")}</p>
            </div>
          </div>
          <div class="storage-stats">
            ${[
              ["stats.buys", state.lots.length],
              ["stats.sales", state.sales.length],
              ["stats.watched", state.watchlist.length],
              ["stats.quotes", Object.keys(state.quotes).length],
              ["stats.histories", History.all().length],
            ].map(([key, count]) =>
              keyed(
                key,
                html`
                  <span><strong>${count}</strong> ${t(key, { count })}</span>
                `,
              )
            )}
          </div>
        </section>

        <section class="panel currency-panel">
          <div class="panel-heading">
            <div>
              <h2>${t("settings.currencyTitle")}</h2>
              <p>${t("settings.currencyIntro", { base: BASE_CURRENCY })}</p>
            </div>
          </div>
          <div class="settings-actions">
            <span class="muted">${t("currency.display")}</span>
            <div
              class="segmented"
              role="group"
              aria-label="${t("currency.display")}"
            >
              ${VIEW_CURRENCIES.map((currency) =>
                keyed(
                  currency,
                  html`
                    <button
                      type="button"
                      class="${`segment ${
                        current === currency ? "active" : ""
                      }`}"
                      aria-pressed="${current === currency}"
                      on-click="${() => setDisplayCurrency(currency)}"
                    >
                      ${currency}
                    </button>
                  `,
                )
              )}
            </div>
          </div>
          ${knownRates.length
            ? html`
              <div class="storage-stats rates-list">
                ${knownRates.map(([currency, rate]) =>
                  keyed(
                    currency,
                    html`
                      <span>
                        <span>1 ${currency}</span>
                        <strong>${formatCurrency(rate, BASE_CURRENCY)}</strong>
                      </span>
                    `,
                  )
                )}
              </div>
            `
            : html`
              <p class="inline-message">${t("settings.ratesHint")}</p>
            `}
        </section>
      </section>
    `;
  }
}

AppRoot.register();
LanguagePicker.register();
DashboardPage.register();
AddLotForm.register();
SellDialog.register();
PositionTable.register();
HoldingsPage.register();
TransactionsPage.register();
ResearchPage.register();
SettingsPage.register();

createRouter({
  routes: [
    { path: "/", component: "dashboard-page" },
    { path: "/holdings", component: "holdings-page" },
    { path: "/holdings/:symbol", component: "holdings-page" },
    { path: "/transactions", component: "transactions-page" },
    // Old bookmark from before sales existed.
    { path: "/lots", component: "transactions-page" },
    { path: "/research", component: "research-page" },
    { path: "/settings", component: "settings-page" },
  ],
});

void initialize();

async function initialize() {
  await hydrateState();
  await refreshTrackedSymbols({ forceHistory: false, quiet: true });
  await ensureFxRates(neededFxCurrencies(), { required: false }).catch(
    () => {},
  );
}

async function hydrateState() {
  const data = await loadLocalData();
  state.lots = data.lots;
  state.sales = data.sales ?? [];
  state.watchlist = data.watchlist;
  state.quotes = data.quotes;
  state.fxRates = fxRatesFromQuotes(data.quotes);
  state.settings = {
    refreshMinutes: 5,
    lastRefresh: "",
    displayCurrency: BASE_CURRENCY,
    ...data.settings,
  };
  state.ready = true;
}

function getPositions() {
  return buildPositions(
    state.lots,
    state.watchlist,
    state.quotes,
    historiesForPositions(),
    state.fxRates,
    state.sales,
  );
}

/* ---------- price history (server cached, synced) ---------- */

const historyLoads = new Map();

/**
 * Make sure the server has `symbol` cached and track the request state for
 * the UI. The data itself arrives through the synced `History` model.
 */
function loadHistory(symbol, options = {}) {
  const key = normalizeSymbol(symbol);
  if (!key) return Promise.resolve();

  const pending = historyLoads.get(key);
  if (pending) return pending;

  const current = state.historyStatus[key];
  const now = Date.now();
  if (!options.force && current) {
    if (current.status === "ready" && now - current.at < 5 * 60_000) {
      return Promise.resolve();
    }
    if (current.status === "error" && now - current.at < 60_000) {
      return Promise.resolve();
    }
  }

  setHistoryStatus(key, { status: "loading", error: "", at: now });
  const task = (async () => {
    try {
      const result = await ensureHistory(key, {
        maxAgeMs: options.force ? 0 : undefined,
      });
      setHistoryStatus(key, {
        status: "ready",
        error: result?.stale ? result.error ?? "" : "",
        at: Date.now(),
      });
    } catch (error) {
      setHistoryStatus(key, {
        status: "error",
        error: error.message,
        at: Date.now(),
      });
    } finally {
      historyLoads.delete(key);
    }
  })();
  historyLoads.set(key, task);
  return task;
}

function setHistoryStatus(symbol, value) {
  state.historyStatus = { ...state.historyStatus, [symbol]: value };
}

/**
 * The synced series for `symbol` cut to `range`, in the instrument's raw
 * units, with the live quote laid over today's bar. Null until cached.
 */
function recentHistory(symbol, range) {
  const series = historySeries(symbol);
  if (!series) return null;
  const quote = state.quotes[symbol];
  const scale = minorUnit(quote?.rawCurrency ?? quote?.currency).divisor;
  return {
    symbol,
    updatedAt: series.updatedAt,
    points: withLiveQuote(pointsInRange(series.points, range), quote, scale),
  };
}

function historiesForPositions() {
  const histories = {};
  for (const symbol of getTrackedSymbols()) {
    const history = recentHistory(symbol, "6mo");
    if (history) histories[symbol] = history;
  }
  return histories;
}

/* ---------- money display ---------- */

function displayCurrency() {
  const value = normalizeCurrency(state.settings.displayCurrency);
  return VIEW_CURRENCIES.includes(value) ? value : BASE_CURRENCY;
}

/** Format a SEK amount in the chosen view currency (falls back to SEK). */
function money(sekValue) {
  const currency = displayCurrency();
  const converted = convertFromSek(sekValue, currency, state.fxRates);
  return converted === null
    ? formatCurrency(sekValue, BASE_CURRENCY)
    : formatCurrency(converted, currency);
}

function moneySigned(sekValue) {
  const currency = displayCurrency();
  const converted = convertFromSek(sekValue, currency, state.fxRates);
  return converted === null
    ? formatSignedCurrency(sekValue, BASE_CURRENCY)
    : formatSignedCurrency(converted, currency);
}

async function setDisplayCurrency(currency) {
  const value = normalizeCurrency(currency);
  if (!VIEW_CURRENCIES.includes(value)) return;
  state.settings = { ...state.settings, displayCurrency: value };
  await saveSetting("displayCurrency", value);
  try {
    await ensureFxRates([value], { required: true });
  } catch (error) {
    state.error = error.message;
  }
}

/* ---------- trades ---------- */

async function addLot(input) {
  const symbol = normalizeSymbol(input.symbol);
  const currency = normalizeCurrency(input.currency) || BASE_CURRENCY;
  const now = new Date().toISOString();
  const lot = {
    id: crypto.randomUUID(),
    symbol,
    quantity: roundQuantity(input.quantity),
    price: Number(input.price),
    currency,
    fxRate: currency === BASE_CURRENCY ? 1 : Number(input.fxRate),
    purchasedAt: input.purchasedAt,
    fees: Number(input.fees ?? 0) || 0,
    note: input.note ?? "",
    createdAt: now,
    updatedAt: now,
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

async function addSale(input) {
  const symbol = normalizeSymbol(input.symbol);
  if (!symbol) throw new Error(t("errors.symbolMissing"));
  const currency = normalizeCurrency(input.currency) || BASE_CURRENCY;

  const now = new Date().toISOString();
  const sale = {
    id: crypto.randomUUID(),
    symbol,
    quantity: roundQuantity(input.quantity),
    price: Number(input.price),
    currency,
    fxRate: currency === BASE_CURRENCY ? 1 : Number(input.fxRate),
    soldAt: input.soldAt,
    fees: Number(input.fees ?? 0) || 0,
    note: input.note ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await saveSale(sale);
  state.sales = [sale, ...state.sales].sort((a, b) =>
    b.soldAt.localeCompare(a.soldAt)
  );

  const position = getPositions().find((item) => item.symbol === symbol);
  const result = position?.ledger.saleResults.get(sale.id) ?? {
    netProceeds: tradeAmount(sale, "sell"),
    costBasis: 0,
    gain: 0,
    gainPercent: 0,
  };
  return { sale, result };
}

async function deleteSale(id) {
  await removeSale(id);
  state.sales = state.sales.filter((sale) => sale.id !== id);
}

async function confirmDeleteLot(lot) {
  const ok = confirm(
    t("confirm.deleteBuy", {
      shares: formatShares(lot.quantity),
      symbol: lot.symbol,
      date: formatDate(lot.purchasedAt),
    }),
  );
  if (!ok) return;
  await deleteLot(lot.id);
}

async function confirmDeleteSale(sale) {
  const ok = confirm(
    t("confirm.deleteSale", {
      shares: formatShares(sale.quantity),
      symbol: sale.symbol,
      date: formatDate(sale.soldAt),
    }),
  );
  if (!ok) return;
  await deleteSale(sale.id);
}

function openSellDialog(symbol = "") {
  state.sellRequest = {
    symbol: normalizeSymbol(symbol),
    openedAt: Date.now(),
  };
}

function closeSellDialog() {
  if (state.sellRequest) state.sellRequest = null;
}

/* ---------- price & FX lookups ---------- */

/**
 * Best price for a trade on `date`: the closing price that day (or the last
 * trading day before it) in the instrument's own currency, plus the SEK rate
 * for that currency on the same date. Falls back to the latest quote/rate.
 */
async function lookupTradePrice(symbol, date) {
  const quote = await refreshOneSymbol(symbol);
  const currency = normalizeCurrency(quote.currency) || BASE_CURRENCY;
  const divisor = minorUnit(quote.rawCurrency ?? quote.currency).divisor;
  const close = await closeOn(quote.symbol, date).catch(() => null);
  const fx = await fxRateOn(currency, date);

  return {
    symbol: quote.symbol,
    currency,
    price: close ? close.close / divisor : quote.price,
    priceDate: close?.date ?? null,
    fxRate: fx.rate,
    fxDate: fx.date,
  };
}

async function fxRateOn(currency, date) {
  const normalized = normalizeCurrency(currency);
  if (!normalized || normalized === BASE_CURRENCY) {
    return { rate: 1, date: null };
  }

  const close = await closeOn(fxSymbolForCurrency(normalized), date).catch(
    () => null,
  );
  if (close) return { rate: close.close, date: close.date };

  await ensureFxRates([normalized], { required: true });
  return { rate: state.fxRates[normalized], date: null };
}

/** Closing price on `date` or the nearest trading day before it. */
async function closeOn(symbol, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date >= today()) return null;

  await loadHistory(symbol);
  const series = historySeries(symbol);
  if (!series) return null;

  const point = series.points.filter((item) => item.date <= date).at(-1);
  return point ? { close: point.close, date: point.date } : null;
}

function describeLookup(symbol, lookup) {
  const price = formatCurrency(lookup.price, lookup.currency);
  const quote = lookup.priceDate
    ? t("lookup.close", { date: formatDate(lookup.priceDate), symbol, price })
    : t("lookup.latest", { symbol, price });
  const fx = lookup.currency === BASE_CURRENCY
    ? ""
    : ` · ${
      formatNumber(lookup.fxRate, 4)
    } ${BASE_CURRENCY}/${lookup.currency}${
      lookup.fxDate ? "" : ` ${t("lookup.currentRate")}`
    }`;
  return `${quote}${fx}.`;
}

function priceInputValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(Number(number.toFixed(number < 10 ? 4 : 2)));
}

function rateInputValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";
  return String(Number(number.toFixed(4)));
}

/* ---------- watchlist & quotes ---------- */

async function trackSymbol(symbol, options = {}) {
  const cleanSymbol = normalizeSymbol(symbol);
  if (!cleanSymbol) throw new Error(t("errors.symbolMissing"));

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
    state.notice = t("watch.added", { symbol: cleanSymbol });
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
      translateServerError(
        payload.errors?.[0],
        t("errors.noQuote", { symbol }),
      ),
    );
  }

  const record = await storeQuote(quote);
  await ensureFxRatesForQuotes([record], { required: true });
  await refreshHistoryIfNeeded(record.symbol, true);
  await markRefreshed();
  return record;
}

async function refreshTrackedSymbols(options = {}) {
  const symbols = getTrackedSymbols();
  const fxSymbols = neededFxCurrencies().map(fxSymbolForCurrency);
  if (symbols.length === 0 && fxSymbols.length === 0) return;
  if (state.refreshing) return;

  state.refreshing = true;
  if (!options.quiet) state.error = "";
  try {
    const payload = await fetchQuotes([...symbols, ...fxSymbols]);
    const quotes = [];
    for (const quote of payload.quotes ?? []) {
      quotes.push(await storeQuote(quote));
    }
    await ensureFxRatesForQuotes(quotes, { required: false });

    await markRefreshed();

    for (const symbol of symbols.slice(0, 24)) {
      await refreshHistoryIfNeeded(symbol, options.forceHistory).catch(
        () => {},
      );
    }

    if (payload.errors?.length && !options.quiet) {
      state.error = payload.errors
        .map((item) => `${item.symbol}: ${translateServerError(item)}`)
        .join(" / ");
    }
  } catch (error) {
    if (!options.quiet) state.error = error.message;
  } finally {
    state.refreshing = false;
  }
}

async function markRefreshed() {
  const refreshedAt = new Date().toISOString();
  state.settings = { ...state.settings, lastRefresh: refreshedAt };
  await saveSetting("lastRefresh", refreshedAt);
}

/**
 * Persist a quote. Markets quoted in minor units (LSE pence etc.) are
 * normalised to the major currency so FX conversion is correct.
 */
async function storeQuote(quote) {
  const unit = minorUnit(quote.rawCurrency ?? quote.currency);
  const scale = (value) =>
    Number.isFinite(value) ? value / unit.divisor : value;
  const record = {
    ...quote,
    symbol: normalizeSymbol(quote.symbol),
    rawCurrency: quote.rawCurrency ?? quote.currency,
    currency: unit.currency,
    price: scale(quote.price),
    previousClose: scale(quote.previousClose),
    change: scale(quote.change),
    dayHigh: scale(quote.dayHigh),
    dayLow: scale(quote.dayLow),
    fiftyTwoWeekHigh: scale(quote.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: scale(quote.fiftyTwoWeekLow),
    updatedAt: new Date().toISOString(),
  };
  await saveQuote(record);
  state.quotes = { ...state.quotes, [record.symbol]: record };
  rememberFxRate(record);
  return record;
}

async function ensureFxRatesForQuotes(quotes, options = {}) {
  await ensureFxRates(quotes.map((quote) => quote.currency), options);
}

async function ensureFxRates(currencies, options = {}) {
  const wanted = [
    ...new Set(
      currencies
        .map(normalizeCurrency)
        .filter((currency) => currency && currency !== BASE_CURRENCY),
    ),
  ];
  const missing = wanted.filter((currency) =>
    !Number.isFinite(state.fxRates[currency])
  );
  if (missing.length === 0) return;

  const payload = await fetchQuotes(missing.map(fxSymbolForCurrency));
  for (const quote of payload.quotes ?? []) await storeQuote(quote);

  const stillMissing = missing.filter((currency) =>
    !Number.isFinite(state.fxRates[currency])
  );
  if (options.required && stillMissing.length) {
    throw new Error(
      t("errors.fxRate", {
        currencies: stillMissing.join(", "),
        base: BASE_CURRENCY,
      }),
    );
  }
}

/** Every currency we need a live SEK rate for: view, trades and quotes. */
function neededFxCurrencies() {
  const wanted = new Set();
  const add = (currency) => {
    const normalized = normalizeCurrency(currency);
    if (normalized && normalized !== BASE_CURRENCY) wanted.add(normalized);
  };

  add(displayCurrency());
  for (const lot of state.lots) add(lot.currency);
  for (const sale of state.sales) add(sale.currency);
  for (const symbol of getTrackedSymbols()) add(state.quotes[symbol]?.currency);
  return [...wanted];
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
  return `${normalizeCurrency(currency)}${BASE_CURRENCY}=X`;
}

function sourceCurrencyFromFxSymbol(symbol) {
  const match = normalizeSymbol(symbol).match(/^([A-Z]{3})SEK=X$/);
  return match?.[1] ?? "";
}

function refreshHistoryIfNeeded(symbol, force = false) {
  // The server decides when Yahoo is asked again; this only makes sure the
  // symbol is cached there and streamed to us.
  return loadHistory(symbol, { force });
}

function getTrackedSymbols() {
  return [
    ...new Set([
      ...state.watchlist.map((item) => item.symbol),
      ...getTrackedSymbolsWithTrades(),
    ]),
  ].filter(Boolean);
}

function getTrackedSymbolsWithTrades() {
  return [
    ...new Set([
      ...state.lots.map((lot) => lot.symbol),
      ...state.sales.map((sale) => sale.symbol),
    ]),
  ].filter(Boolean);
}

function buildTransactionEntries(bySymbol) {
  const entries = [
    ...state.lots.map((lot) => ({
      id: lot.id,
      type: "buy",
      symbol: lot.symbol,
      date: lot.purchasedAt ?? "",
      createdAt: lot.createdAt ?? "",
      record: lot,
      position: bySymbol.get(lot.symbol) ?? null,
      result: null,
    })),
    ...state.sales.map((sale) => {
      const position = bySymbol.get(sale.symbol) ?? null;
      return {
        id: sale.id,
        type: "sell",
        symbol: sale.symbol,
        date: sale.soldAt ?? "",
        createdAt: sale.createdAt ?? "",
        record: sale,
        position,
        result: position?.ledger.saleResults.get(sale.id) ?? null,
      };
    }),
  ];

  return entries.sort((a, b) =>
    b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );
}

/* ---------- small helpers ---------- */

function lastRefreshText() {
  const value = state.settings.lastRefresh;
  if (!value) return t("refresh.never");
  return new Intl.DateTimeFormat(getFormatLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** "12 st" / "12 shares": a share count with its unit. */
function sharesText(quantity) {
  return t("units.shares", { count: quantity });
}

function todayChange(percent) {
  return t("common.today", { percent: formatPercent(percent) });
}

function tradeLabel(type) {
  return type === "buy" ? t("trade.buy") : t("trade.sell");
}

/** "Köp 12 st à 100 kr" for chart markers and tooltips. */
function tradeAtText(type, quantity, price) {
  return t(type === "buy" ? "chart.buyAt" : "chart.sellAt", {
    shares: sharesText(quantity),
    price,
  });
}

function percentLabel(fraction) {
  return new Intl.NumberFormat(getFormatLocale(), { style: "percent" })
    .format(fraction);
}

function syncSelect(root, selector, value) {
  const select = root.querySelector(selector);
  if (select && select.value !== value) select.value = value;
}

function currencySelect(current, onChange) {
  const options = TRADE_CURRENCIES.includes(current)
    ? TRADE_CURRENCIES
    : [current, ...TRADE_CURRENCIES];
  return html`
    <select
      class="currency-select"
      aria-label="${t("currency.label")}"
      .value="${current}"
      on-change="${onChange}"
    >
      ${options.map((currency) =>
        keyed(
          currency,
          html`
            <option value="${currency}" selected="${currency ===
              current}">${currency}</option>
          `,
        )
      )}
    </select>
  `;
}

/* ---------- templates ---------- */

function positionRow(position) {
  const path = sparklinePath(position.history?.points ?? [], 180, 54);
  const quote = position.quote;
  const quoteCurrency = normalizeCurrency(quote?.currency) || BASE_CURRENCY;
  const showNative = quote && quoteCurrency !== displayCurrency();

  return html`
    <article class="position-row">
      <router-link
        class="identity-cell row-link"
        to="${`/holdings/${encodeURIComponent(position.symbol)}`}"
      >
        <strong>${position.symbol}</strong>
        <span>${position.name}</span>
      </router-link>
      <svg
        class="sparkline"
        viewBox="0 0 180 54"
        role="img"
        aria-label="${t("position.trend", { symbol: position.symbol })}"
      >
        <path class="sparkline-grid" d="M0 27 L180 27"></path>
        <path class="${`sparkline-path ${
          toneClass(position.gain)
        }`}" d="${path}"></path>
      </svg>
      <div>
        <span class="cell-label">${t("label.quantity")}</span>
        <strong>${formatShares(position.shares)}</strong>
        <small class="muted">${t("common.avg", {
          price: money(position.averageCost),
        })}</small>
      </div>
      <div>
        <span class="cell-label">${t("position.price")}</span>
        <strong>${money(position.price)}</strong>
        <small class="${toneClass(quote?.changePercent ?? 0)}">${showNative
          ? `${formatCurrency(quote.price, quoteCurrency)} · `
          : ""}${todayChange(quote?.changePercent ?? 0)}</small>
      </div>
      <div>
        <span class="cell-label">${t("position.value")}</span>
        <strong>${money(position.marketValue)}</strong>
        ${position.sellCount
          ? html`
            <small class="${toneClass(position.realized)}">${t(
              "position.realizedAmount",
              { amount: moneySigned(position.realized) },
            )}</small>
          `
          : ""}
      </div>
      <div>
        <span class="cell-label">${t("position.result")}</span>
        <strong class="${toneClass(position.gain)}">
          ${moneySigned(position.gain)}
        </strong>
        <small class="${toneClass(position.gain)}">${formatPercent(
          position.gainPercent,
        )}</small>
      </div>
      <button
        type="button"
        class="sell-button compact"
        on-click="${() => openSellDialog(position.symbol)}"
      >
        ${t("action.sell")}
      </button>
    </article>
  `;
}

function transactionRow(entry) {
  const { record, position, result } = entry;
  const isBuy = entry.type === "buy";
  const quantity = Number(record.quantity) || 0;
  const price = Number(record.price) || 0;
  const fees = Number(record.fees) || 0;
  const currency = tradeCurrency(record);
  const fxRate = tradeFxRate(record);
  const foreign = currency !== BASE_CURRENCY;
  const amount = tradeAmount(record, entry.type);
  const quote = position?.quote;
  const quoteCurrency = normalizeCurrency(quote?.currency) || BASE_CURRENCY;
  // Compare in the trade's own currency when the quote matches it, so the
  // number reflects the share price and not FX drift.
  const sinceBuy = !isBuy || price <= 0
    ? null
    : quote && quoteCurrency === currency && quote.price > 0
    ? (quote.price - price) / price * 100
    : position && position.price > 0
    ? (position.price - tradeUnitCost(record)) / tradeUnitCost(record) * 100
    : null;
  const gain = result?.gain ?? 0;

  return html`
    <article class="${`transaction-row ${entry.type}`}">
      <div class="tx-identity">
        <span class="${`badge ${entry.type}`}">${tradeLabel(entry.type)}</span>
        <div>
          <strong>${record.symbol}</strong>
          <span>${record.note || position?.name || record.symbol}</span>
        </div>
      </div>
      <div>
        <span class="cell-label">${t("label.date")}</span>
        <strong>${formatDate(entry.date)}</strong>
      </div>
      <div>
        <span class="cell-label">${t("label.quantity")}</span>
        <strong>${formatShares(quantity)}</strong>
      </div>
      <div>
        <span class="cell-label">${t("label.price")}</span>
        <strong>${formatCurrency(price, currency)}</strong>
        <small class="muted">${[
          foreign
            ? `× ${formatNumber(fxRate, 4)} = ${money(price * fxRate)}`
            : "",
          fees > 0
            ? t("transactions.fee", { amount: formatCurrency(fees, currency) })
            : "",
        ].filter(Boolean).join(" · ")}</small>
      </div>
      <div>
        <span class="cell-label">${isBuy
          ? t("label.cost")
          : t("label.proceeds")}</span>
        <strong>${money(amount)}</strong>
      </div>
      <div>
        <span class="cell-label">${isBuy
          ? t("transactions.priceSinceBuy")
          : t("label.realized")}</span>
        ${isBuy
          ? html`
            <strong class="${toneClass(sinceBuy ?? 0)}">${sinceBuy === null
              ? "–"
              : formatPercent(sinceBuy)}</strong>
            <small class="muted">${sinceBuy === null
              ? t("common.waitingForPrice")
              : t("transactions.now", {
                price: quote && quoteCurrency === currency
                  ? formatCurrency(quote.price, currency)
                  : money(position?.price ?? 0),
              })}</small>
          `
          : html`
            <strong class="${toneClass(gain)}">${moneySigned(gain)}</strong>
            <small class="${toneClass(gain)}">${formatPercent(
              result?.gainPercent ?? 0,
            )} · ${t("common.avg", {
              price: money(result?.averageCost ?? 0),
            })}</small>
          `}
      </div>
      <button
        type="button"
        class="danger-button compact"
        on-click="${() =>
          isBuy ? confirmDeleteLot(record) : confirmDeleteSale(record)}"
      >
        ${t("common.delete")}
      </button>
    </article>
  `;
}

function filterChip(page, value, label) {
  return html`
    <button
      type="button"
      class="${`chip ${page.typeFilter === value ? "active" : ""}`}"
      on-click="${() => page.typeFilter = value}"
    >
      ${label}
    </button>
  `;
}

function watchCard(position) {
  const quote = position.quote;
  const path = sparklinePath(position.history?.points ?? [], 240, 72);
  const quoteCurrency = normalizeCurrency(quote?.currency) || BASE_CURRENCY;
  const showNative = quote && quoteCurrency !== displayCurrency();

  return html`
    <article class="watch-card">
      <div class="watch-card-head">
        <div>
          <strong>${position.symbol}</strong>
          <span>${position.name}</span>
        </div>
        ${position.isHolding
          ? html`
            <div class="card-actions">
              <span class="pill">${sharesText(position.shares)}</span>
              <button
                type="button"
                class="sell-button compact"
                on-click="${() => openSellDialog(position.symbol)}"
              >
                ${t("action.sell")}
              </button>
            </div>
          `
          : position.isClosed
          ? html`
            <span class="pill closed">${t("watch.closed")}</span>
          `
          : html`
            <button on-click="${() => untrackSymbol(position.symbol)}">${t(
              "watch.stop",
            )}</button>
          `}
      </div>
      <svg
        class="watch-chart"
        viewBox="0 0 240 72"
        role="img"
        aria-label="${t("watch.chart", { symbol: position.symbol })}"
      >
        <path class="sparkline-grid" d="M0 36 L240 36"></path>
        <path class="${`sparkline-path ${
          toneClass(quote?.change ?? 0)
        }`}" d="${path}"></path>
      </svg>
      <div class="watch-stats">
        <span>
          <small>${t("watch.last")}</small>
          <strong>${money(position.price)}</strong>
          ${showNative
            ? html`
              <em class="muted">${formatCurrency(
                quote.price,
                quoteCurrency,
              )}</em>
            `
            : ""}
        </span>
        <span>
          <small>${t("watch.change")}</small>
          <strong class="${toneClass(quote?.change ?? 0)}">
            ${formatPercent(quote?.changePercent ?? 0)}
          </strong>
        </span>
        <span>
          <small>${position.sellCount
            ? t("label.realized")
            : t("watch.updated")}</small>
          ${position.sellCount
            ? html`
              <strong class="${toneClass(position.realized)}">${moneySigned(
                position.realized,
              )}</strong>
            `
            : html`
              <strong>${quote?.marketTime
                ? shortDate(quote.marketTime)
                : t("watch.waiting")}</strong>
            `}
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
                <span>${money(position.marketValue)}</span>
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

function realizedList(positions) {
  return html`
    <div class="realized-list">
      ${positions.map((position) =>
        keyed(
          position.symbol,
          html`
            <div class="realized-row">
              <div>
                <strong>${position.symbol}</strong>
                <span>${t("realized.sold", {
                  count: position.soldShares,
                })} · ${position
                    .isClosed
                  ? t("realized.closed")
                  : t("realized.remaining", { count: position.shares })}</span>
              </div>
              <div class="realized-value">
                <strong class="${toneClass(position.realized)}">${moneySigned(
                  position.realized,
                )}</strong>
                <small class="${toneClass(position.realized)}">${formatPercent(
                  position.realizedPercent,
                )}</small>
              </div>
            </div>
          `,
        )
      )}
    </div>
  `;
}

function moverCard(label, position) {
  return html`
    <article class="mover-card">
      <span>${label}</span>
      <strong>${position.symbol}</strong>
      <p class="${toneClass(position.gain)}">
        ${moneySigned(position.gain)} ${formatPercent(position.gainPercent)}
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
  return new Intl.DateTimeFormat(getFormatLocale(), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/**
 * Validate an import file and return only well-formed records. Anything that
 * would break the ledger (missing symbol, non-positive quantity, bad dates,
 * unknown shapes) is dropped instead of being written to IndexedDB.
 */
function validateImport(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(t("import.invalid"));
  }
  if (!Array.isArray(data.lots)) {
    throw new Error(t("import.noBuys"));
  }
  if (data.sales !== undefined && !Array.isArray(data.sales)) {
    throw new Error(t("import.badSales"));
  }
  if (!Array.isArray(data.watchlist)) {
    throw new Error(t("import.noWatchlist"));
  }

  const lots = data.lots.map((lot) => sanitizeTrade(lot, "purchasedAt"));
  const sales = (data.sales ?? []).map((sale) => sanitizeTrade(sale, "soldAt"));
  const watchlist = data.watchlist.map(sanitizeWatchItem);
  const quotes = Object.values(
    data.quotes && typeof data.quotes === "object" ? data.quotes : {},
  ).map(sanitizeQuote);
  const settings = {};
  const rawSettings = data.settings && typeof data.settings === "object"
    ? data.settings
    : {};
  if (
    VIEW_CURRENCIES.includes(normalizeCurrency(rawSettings.displayCurrency))
  ) {
    settings.displayCurrency = normalizeCurrency(rawSettings.displayCurrency);
  }
  if (isIsoDateTime(rawSettings.lastRefresh)) {
    settings.lastRefresh = rawSettings.lastRefresh;
  }

  const kept = (items) => items.filter(Boolean);
  const skipped = [lots, sales, watchlist, quotes]
    .reduce((total, items) => total + items.filter((item) => !item).length, 0);

  return {
    lots: dedupeById(kept(lots)),
    sales: dedupeById(kept(sales)),
    watchlist: kept(watchlist),
    quotes: kept(quotes),
    settings,
    skipped,
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function sanitizeTrade(record, dateField) {
  if (!record || typeof record !== "object") return null;
  const symbol = cleanSymbol(record.symbol);
  const quantity = roundQuantity(Number(record.quantity));
  const price = Number(record.price);
  const date = String(record[dateField] ?? "");
  if (
    !symbol || !(quantity > 0) || !Number.isFinite(price) || price < 0 ||
    !ISO_DATE.test(date) || Number.isNaN(Date.parse(date))
  ) {
    return null;
  }

  const currency = normalizeCurrency(record.currency) || BASE_CURRENCY;
  const fxRate = Number(record.fxRate);
  const fees = Number(record.fees);
  const now = new Date().toISOString();
  return {
    id: typeof record.id === "string" && record.id.length > 0 &&
        record.id.length <= 64
      ? record.id
      : crypto.randomUUID(),
    symbol,
    quantity,
    price,
    currency: currency.slice(0, 8),
    fxRate: currency === BASE_CURRENCY
      ? 1
      : Number.isFinite(fxRate) && fxRate > 0
      ? fxRate
      : 1,
    [dateField]: date,
    fees: Number.isFinite(fees) && fees > 0 ? fees : 0,
    note: typeof record.note === "string" ? record.note.slice(0, 500) : "",
    createdAt: isIsoDateTime(record.createdAt) ? record.createdAt : now,
    updatedAt: isIsoDateTime(record.updatedAt) ? record.updatedAt : now,
  };
}

function sanitizeWatchItem(record) {
  const symbol = cleanSymbol(record?.symbol);
  if (!symbol) return null;
  return {
    symbol,
    addedAt: isIsoDateTime(record.addedAt)
      ? record.addedAt
      : new Date().toISOString(),
  };
}

function sanitizeQuote(record) {
  if (!record || typeof record !== "object") return null;
  const symbol = cleanSymbol(record.symbol);
  const price = Number(record.price);
  if (!symbol || !Number.isFinite(price) || price <= 0) return null;
  const numberOr = (value) => Number.isFinite(value) ? value : undefined;
  return {
    symbol,
    name: typeof record.name === "string" ? record.name.slice(0, 120) : symbol,
    price,
    previousClose: numberOr(record.previousClose),
    change: numberOr(record.change),
    changePercent: numberOr(record.changePercent),
    currency: normalizeCurrency(record.currency).slice(0, 8) || BASE_CURRENCY,
    rawCurrency: typeof record.rawCurrency === "string"
      ? record.rawCurrency.slice(0, 8)
      : undefined,
    exchange: typeof record.exchange === "string"
      ? record.exchange.slice(0, 80)
      : "",
    marketTime: isIsoDateTime(record.marketTime) ? record.marketTime : "",
    updatedAt: isIsoDateTime(record.updatedAt)
      ? record.updatedAt
      : new Date().toISOString(),
  };
}

/** Same rules as the server: uppercase ticker characters only. */
function cleanSymbol(value) {
  const symbol = normalizeSymbol(value);
  return /^[A-Z0-9.^=_-]{1,24}$/.test(symbol) ? symbol : "";
}

function isIsoDateTime(value) {
  return typeof value === "string" && value.length <= 40 &&
    !Number.isNaN(Date.parse(value));
}

function dedupeById(records) {
  const seen = new Set();
  return records.filter((record) => {
    if (seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}
