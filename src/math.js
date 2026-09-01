/** Accounting (base) currency. Every stored cost basis and result is in SEK. */
export const DISPLAY_CURRENCY = "SEK";
export const BASE_CURRENCY = DISPLAY_CURRENCY;
export const QUANTITY_EPSILON = 1e-6;

/** Currencies offered when registering a trade. */
export const TRADE_CURRENCIES = [
  "SEK",
  "EUR",
  "USD",
  "NOK",
  "DKK",
  "GBP",
  "CHF",
  "CAD",
  "JPY",
];

/** Currencies the whole portfolio can be viewed in. */
export const VIEW_CURRENCIES = ["SEK", "EUR", "USD"];

/** SEK per one unit of the trade currency on the trade date (1 for SEK). */
export function tradeFxRate(record) {
  const rate = Number(record?.fxRate);
  return Number.isFinite(rate) && rate > 0 ? rate : 1;
}

export function tradeCurrency(record) {
  return normalizeCurrency(record?.currency) || BASE_CURRENCY;
}

/** Cost per share in SEK for a buy/sell record. */
export function tradeUnitCost(record) {
  return (Number(record?.price) || 0) * tradeFxRate(record);
}

/** Total SEK amount: buys add fees, sells deduct them. */
export function tradeAmount(record, type) {
  const quantity = Math.max(0, Number(record?.quantity) || 0);
  const price = Math.max(0, Number(record?.price) || 0);
  const fees = Math.max(0, Number(record?.fees) || 0);
  const gross = quantity * price;
  return (type === "buy" ? gross + fees : gross - fees) * tradeFxRate(record);
}

/**
 * Round a share quantity to six decimals so float noise from summing lots
 * (0.1 + 0.2) never leaks into inputs or validation.
 */
export function roundQuantity(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 1e6) / 1e6;
}

/**
 * Walk every buy and sell for one symbol in date order and apply the
 * average-cost method (genomsnittsmetoden): buys raise shares and cost basis,
 * sells remove shares plus a proportional slice of the cost basis. The slice
 * removed is what the realized result of that sale is measured against.
 *
 * Records may be in any currency; each carries the SEK rate on its trade date
 * (`fxRate`), so the ledger is always kept in SEK.
 *
 * Same-day buys are processed before same-day sells so "bought and sold the
 * same day" works; ties after that fall back to creation order.
 */
export function buildLedger(lots, sales) {
  const events = [
    ...lots.map((lot) => ({
      type: "buy",
      date: lot.purchasedAt ?? "",
      order: 0,
      createdAt: lot.createdAt ?? "",
      record: lot,
    })),
    ...sales.map((sale) => ({
      type: "sell",
      date: sale.soldAt ?? "",
      order: 1,
      createdAt: sale.createdAt ?? "",
      record: sale,
    })),
  ].sort(compareEvents);

  let shares = 0;
  let cost = 0;
  let realized = 0;
  let realizedCost = 0;
  let soldShares = 0;
  let proceeds = 0;
  let boughtCost = 0;
  const saleResults = new Map();
  const timeline = [];

  for (const event of events) {
    const record = event.record;
    const quantity = Math.max(0, Number(record.quantity) || 0);
    const fxRate = tradeFxRate(record);
    // Everything below is in SEK: native price × rate on the trade date.
    const price = Math.max(0, Number(record.price) || 0) * fxRate;
    const fees = Math.max(0, Number(record.fees) || 0) * fxRate;

    if (event.type === "buy") {
      shares += quantity;
      cost += quantity * price + fees;
      boughtCost += quantity * price + fees;
    } else {
      const sharesBefore = shares;
      const averageCost = shares > QUANTITY_EPSILON ? cost / shares : 0;
      // If the data is inconsistent (sold more than held) the uncovered part
      // simply has no cost basis instead of producing negative numbers.
      const coveredQuantity = Math.min(quantity, Math.max(0, shares));
      const costBasis = averageCost * coveredQuantity;
      const netProceeds = quantity * price - fees;
      const gain = netProceeds - costBasis;

      shares -= quantity;
      cost = Math.max(0, cost - costBasis);
      realized += gain;
      realizedCost += costBasis;
      soldShares += quantity;
      proceeds += netProceeds;

      saleResults.set(record.id, {
        sharesBefore,
        averageCost,
        costBasis,
        netProceeds,
        gain,
        gainPercent: costBasis > 0 ? gain / costBasis * 100 : 0,
        sharesAfter: Math.max(0, shares),
      });
    }

    if (Math.abs(shares) < QUANTITY_EPSILON) {
      shares = 0;
      cost = 0;
    } else if (shares < 0) {
      cost = 0;
    }

    timeline.push({ event, shares });
  }

  const heldShares = Math.max(0, shares);
  return {
    shares: heldShares,
    cost,
    averageCost: heldShares > 0 ? cost / heldShares : 0,
    realized,
    realizedCost,
    realizedPercent: realizedCost > 0 ? realized / realizedCost * 100 : 0,
    soldShares,
    proceeds,
    boughtCost,
    buyCount: lots.length,
    sellCount: sales.length,
    saleResults,
    timeline,
  };
}

/**
 * How many shares can be sold on `date` without the ledger ever dipping below
 * zero at that date or any later date. Handles backdated sales correctly:
 * a sale dated before a later sale must still leave enough for it.
 */
export function availableToSell(lots, sales, date) {
  const probe = probeSale(date);
  const ledger = buildLedger(lots, [...sales, probe]);

  let reached = false;
  let minShares = Infinity;
  for (const step of ledger.timeline) {
    if (step.event.record === probe) reached = true;
    if (reached) minShares = Math.min(minShares, step.shares);
  }

  if (minShares === Infinity) return 0;
  return roundQuantity(Math.max(0, minShares));
}

/**
 * Preview what a sale would realize, using the very same ledger logic that
 * will be applied once the sale is saved.
 */
export function previewSale(lots, sales, sale) {
  const probe = { ...probeSale(sale.soldAt), ...sale, id: PROBE_ID };
  const ledger = buildLedger(lots, [...sales, probe]);
  const result = ledger.saleResults.get(PROBE_ID);
  return {
    ...result,
    remainingShares: ledger.shares,
    remainingCost: ledger.cost,
  };
}

const PROBE_ID = "__stockroom_probe__";

function probeSale(date) {
  return {
    id: PROBE_ID,
    quantity: 0,
    price: 0,
    fees: 0,
    soldAt: date || "",
    // Sorts after every real same-day sale so the probe represents "the
    // newest sale on this date", exactly where a freshly saved sale lands.
    createdAt: "~~~~",
  };
}

function compareEvents(a, b) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.order !== b.order) return a.order - b.order;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  return 0;
}

export function buildPositions(
  lots,
  watchlist,
  quotes,
  histories,
  fxRates = {},
  sales = [],
) {
  const symbols = new Set(watchlist.map((item) => item.symbol));
  for (const lot of lots) symbols.add(lot.symbol);
  for (const sale of sales) symbols.add(sale.symbol);

  return [...symbols].map((symbol) => {
    const symbolLots = lots
      .filter((lot) => lot.symbol === symbol)
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
    const symbolSales = sales
      .filter((sale) => sale.symbol === symbol)
      .sort((a, b) => b.soldAt.localeCompare(a.soldAt));
    const ledger = buildLedger(symbolLots, symbolSales);

    const quote = quotes[symbol];
    const rate = currencyRateToSek(quote?.currency, fxRates);
    const price = convertToSek(
      Number.isFinite(quote?.price) ? quote.price : 0,
      quote?.currency,
      fxRates,
    );
    const shares = ledger.shares;
    const cost = ledger.cost;
    const marketValue = shares * price;
    const gain = marketValue - cost;
    const gainPercent = cost > 0 ? gain / cost * 100 : 0;
    const previousClose = Number.isFinite(quote?.previousClose)
      ? quote.previousClose * rate
      : price;
    const dayChange = shares * (price - previousClose);
    const dayChangePercent = previousClose > 0
      ? (price - previousClose) / previousClose * 100
      : 0;
    const isHolding = shares > QUANTITY_EPSILON;
    const hasTrades = symbolLots.length > 0 || symbolSales.length > 0;

    return {
      symbol,
      name: quote?.name ?? symbol,
      quote,
      lots: symbolLots,
      sales: symbolSales,
      ledger,
      history: convertHistoryToSek(histories[symbol], quote?.currency, fxRates),
      sourceCurrency: quote?.currency ?? DISPLAY_CURRENCY,
      conversionRate: rate,
      shares,
      cost,
      averageCost: ledger.averageCost,
      price,
      marketValue,
      gain,
      gainPercent,
      dayChange,
      dayChangePercent,
      realized: ledger.realized,
      realizedCost: ledger.realizedCost,
      realizedPercent: ledger.realizedPercent,
      soldShares: ledger.soldShares,
      proceeds: ledger.proceeds,
      sellCount: ledger.sellCount,
      buyCount: ledger.buyCount,
      isHolding,
      hasTrades,
      isClosed: hasTrades && !isHolding,
    };
  }).sort((a, b) => {
    if (b.marketValue !== a.marketValue) return b.marketValue - a.marketValue;
    return a.symbol.localeCompare(b.symbol);
  });
}

export function summarizePortfolio(positions) {
  const holdings = positions.filter((position) => position.isHolding);
  const traded = positions.filter((position) => position.sellCount > 0);
  const totalValue = sum(holdings.map((position) => position.marketValue));
  const totalCost = sum(holdings.map((position) => position.cost));
  const totalGain = totalValue - totalCost;
  const dayChange = sum(holdings.map((position) => position.dayChange));
  const realized = sum(positions.map((position) => position.realized));
  const realizedCost = sum(positions.map((position) => position.realizedCost));
  const proceeds = sum(positions.map((position) => position.proceeds));
  const best = holdings.toSorted((a, b) => b.gainPercent - a.gainPercent)[0];
  const worst = holdings.toSorted((a, b) => a.gainPercent - b.gainPercent)[0];

  return {
    holdingsCount: holdings.length,
    trackedCount: positions.length,
    closedCount: positions.filter((position) => position.isClosed).length,
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent: totalCost > 0 ? totalGain / totalCost * 100 : 0,
    dayChange,
    dayChangePercent: totalValue - dayChange > 0
      ? dayChange / (totalValue - dayChange) * 100
      : 0,
    cashBasis: totalCost,
    realized,
    realizedCost,
    realizedPercent: realizedCost > 0 ? realized / realizedCost * 100 : 0,
    proceeds,
    salesCount: sum(positions.map((position) => position.sellCount)),
    tradedCount: traded.length,
    totalReturn: totalGain + realized,
    best,
    worst,
  };
}

export function formatCurrency(value, currency = DISPLAY_CURRENCY) {
  const amount = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency,
      maximumFractionDigits: Math.abs(amount) >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatSignedCurrency(value, currency = DISPLAY_CURRENCY) {
  const amount = Number.isFinite(value) ? value : 0;
  const text = formatCurrency(Math.abs(amount), currency);
  if (amount > 0.004) return `+${text}`;
  if (amount < -0.004) return `−${text}`;
  return text;
}

export function convertToSek(value, currency, fxRates = {}) {
  const amount = Number.isFinite(value) ? value : 0;
  return amount * currencyRateToSek(currency, fxRates);
}

/**
 * SEK → another currency at the current rate. Returns null when the rate is
 * unknown so callers can fall back to showing SEK instead of a wrong number.
 */
export function convertFromSek(value, currency, fxRates = {}) {
  const amount = Number.isFinite(value) ? value : 0;
  const normalized = normalizeCurrency(currency);
  if (!normalized || normalized === BASE_CURRENCY) return amount;
  const rate = fxRates[normalized];
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return amount / rate;
}

export function currencyRateToSek(currency, fxRates = {}) {
  const normalized = normalizeCurrency(currency);
  if (!normalized || normalized === DISPLAY_CURRENCY) return 1;
  return Number.isFinite(fxRates[normalized]) ? fxRates[normalized] : 1;
}

export function formatNumber(value, digits = 2) {
  const number = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(number);
}

/** Share counts: "12", "12,5" or "0,3333" – never "12,0000". */
export function formatShares(value) {
  const number = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(number);
}

export function formatPercent(value) {
  const number = Number.isFinite(value) ? value : 0;
  return `${
    new Intl.NumberFormat("sv-SE", {
      // No "−0,00%" for changes that round to zero.
      signDisplay: "exceptZero",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number)
  }%`;
}

export function formatDate(value) {
  if (!value) return "–";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function toneClass(value) {
  if (value > 0.0001) return "positive";
  if (value < -0.0001) return "negative";
  return "neutral";
}

export function sparklinePath(points, width = 180, height = 56) {
  // Prices are never zero or negative – such points are data gaps.
  const values = points
    .map((point) => point.close)
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length < 2) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  return values.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function convertHistoryToSek(history, currency, fxRates) {
  if (!history?.points) return history;
  const rate = currencyRateToSek(currency, fxRates);
  if (rate === 1) return history;

  return {
    ...history,
    points: history.points.map((point) => ({
      ...point,
      open: convertNullable(point.open, rate),
      high: convertNullable(point.high, rate),
      low: convertNullable(point.low, rate),
      close: convertNullable(point.close, rate),
    })),
  };
}

function convertNullable(value, rate) {
  return Number.isFinite(value) ? value * rate : value;
}

export function normalizeCurrency(currency) {
  return String(currency ?? "").trim().toUpperCase();
}

/**
 * Yahoo quotes some markets in minor units (LSE in pence "GBp", JSE in cents
 * "ZAc", TASE in agorot "ILA"). Map them to the major currency + divisor.
 */
export function minorUnit(rawCurrency) {
  const raw = String(rawCurrency ?? "").trim();
  const table = {
    GBp: ["GBP", 100],
    GBX: ["GBP", 100],
    ZAc: ["ZAR", 100],
    ILA: ["ILS", 100],
  };
  const hit = table[raw];
  return hit
    ? { currency: hit[0], divisor: hit[1] }
    : { currency: normalizeCurrency(raw), divisor: 1 };
}
