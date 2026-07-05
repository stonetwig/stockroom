export const DISPLAY_CURRENCY = "SEK";

export function buildPositions(
  lots,
  watchlist,
  quotes,
  histories,
  fxRates = {},
) {
  const symbols = new Set(watchlist.map((item) => item.symbol));
  for (const lot of lots) symbols.add(lot.symbol);

  return [...symbols].map((symbol) => {
    const symbolLots = lots
      .filter((lot) => lot.symbol === symbol)
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
    const quote = quotes[symbol];
    const rate = currencyRateToSek(quote?.currency, fxRates);
    const price = convertToSek(
      Number.isFinite(quote?.price) ? quote.price : 0,
      quote?.currency,
      fxRates,
    );
    const shares = sum(symbolLots.map((lot) => lot.quantity));
    const cost = sum(
      symbolLots.map((lot) => lot.quantity * lot.price + (lot.fees ?? 0)),
    );
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

    return {
      symbol,
      name: quote?.name ?? symbol,
      quote,
      lots: symbolLots,
      history: convertHistoryToSek(histories[symbol], quote?.currency, fxRates),
      sourceCurrency: quote?.currency ?? DISPLAY_CURRENCY,
      conversionRate: rate,
      shares,
      cost,
      averageCost: shares > 0 ? cost / shares : 0,
      price,
      marketValue,
      gain,
      gainPercent,
      dayChange,
      dayChangePercent,
      isHolding: shares > 0,
    };
  }).sort((a, b) => {
    if (b.marketValue !== a.marketValue) return b.marketValue - a.marketValue;
    return a.symbol.localeCompare(b.symbol);
  });
}

export function summarizePortfolio(positions) {
  const holdings = positions.filter((position) => position.isHolding);
  const totalValue = sum(holdings.map((position) => position.marketValue));
  const totalCost = sum(holdings.map((position) => position.cost));
  const totalGain = totalValue - totalCost;
  const dayChange = sum(holdings.map((position) => position.dayChange));
  const best = holdings.toSorted((a, b) => b.gainPercent - a.gainPercent)[0];
  const worst = holdings.toSorted((a, b) => a.gainPercent - b.gainPercent)[0];

  return {
    holdingsCount: holdings.length,
    trackedCount: positions.length,
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent: totalCost > 0 ? totalGain / totalCost * 100 : 0,
    dayChange,
    dayChangePercent: totalValue - dayChange > 0
      ? dayChange / (totalValue - dayChange) * 100
      : 0,
    cashBasis: totalCost,
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

export function convertToSek(value, currency, fxRates = {}) {
  const amount = Number.isFinite(value) ? value : 0;
  return amount * currencyRateToSek(currency, fxRates);
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

export function formatPercent(value) {
  const number = Number.isFinite(value) ? value : 0;
  return `${
    new Intl.NumberFormat("sv-SE", {
      signDisplay: "always",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number)
  }%`;
}

export function toneClass(value) {
  if (value > 0.0001) return "positive";
  if (value < -0.0001) return "negative";
  return "neutral";
}

export function sparklinePath(points, width = 180, height = 56) {
  const values = points
    .map((point) => point.close)
    .filter((value) => Number.isFinite(value));

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

function normalizeCurrency(currency) {
  return String(currency ?? "").trim().toUpperCase();
}
