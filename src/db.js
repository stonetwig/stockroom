const DB_NAME = "stockroom-local-device";
const DB_VERSION = 1;
const STORE_NAMES = ["lots", "watchlist", "quotes", "histories", "settings"];

let dbPromise;

export async function loadLocalData() {
  const [lots, watchlist, quotes, histories, settingsRows] = await Promise.all([
    getAll("lots"),
    getAll("watchlist"),
    getAll("quotes"),
    getAll("histories"),
    getAll("settings"),
  ]);

  return {
    lots: lots.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)),
    watchlist: watchlist.sort((a, b) => a.symbol.localeCompare(b.symbol)),
    quotes: Object.fromEntries(quotes.map((quote) => [quote.symbol, quote])),
    histories: Object.fromEntries(
      histories.map((history) => [history.symbol, history]),
    ),
    settings: Object.fromEntries(
      settingsRows.map((row) => [row.key, row.value]),
    ),
  };
}

export async function saveLot(lot) {
  await put("lots", lot);
}

export async function removeLot(id) {
  await deleteRecord("lots", id);
}

export async function saveWatchSymbol(record) {
  await put("watchlist", record);
}

export async function removeWatchSymbol(symbol) {
  await deleteRecord("watchlist", symbol);
}

export async function saveQuote(quote) {
  await put("quotes", quote);
}

export async function saveHistory(history) {
  await put("histories", history);
}

export async function saveSetting(key, value) {
  await put("settings", { key, value });
}

export async function replaceAllData(data) {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);

    for (const name of STORE_NAMES) tx.objectStore(name).clear();

    for (const lot of asArray(data.lots)) tx.objectStore("lots").put(lot);
    for (const item of asArray(data.watchlist)) {
      tx.objectStore("watchlist").put(item);
    }
    for (const quote of objectValues(data.quotes)) {
      tx.objectStore("quotes").put(quote);
    }
    for (const history of objectValues(data.histories)) {
      tx.objectStore("histories").put(history);
    }
    for (const [key, value] of Object.entries(data.settings ?? {})) {
      tx.objectStore("settings").put({ key, value });
    }
  });
}

export async function clearAllLocalData() {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    for (const name of STORE_NAMES) tx.objectStore(name).clear();
  });
}

async function getAll(storeName) {
  const db = await openDatabase();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

async function put(storeName, value) {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    tx.objectStore(storeName).put(value);
  });
}

async function deleteRecord(storeName, key) {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    tx.objectStore(storeName).delete(key);
  });
}

function openDatabase() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("lots")) {
          const store = db.createObjectStore("lots", { keyPath: "id" });
          store.createIndex("symbol", "symbol", { unique: false });
          store.createIndex("purchasedAt", "purchasedAt", { unique: false });
        }

        if (!db.objectStoreNames.contains("watchlist")) {
          db.createObjectStore("watchlist", { keyPath: "symbol" });
        }

        if (!db.objectStoreNames.contains("quotes")) {
          db.createObjectStore("quotes", { keyPath: "symbol" });
        }

        if (!db.objectStoreNames.contains("histories")) {
          db.createObjectStore("histories", { keyPath: "symbol" });
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      };
    });
  }
  return dbPromise;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function objectValues(value) {
  if (Array.isArray(value)) return value;
  return Object.values(value ?? {});
}
