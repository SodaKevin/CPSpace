import { openDB } from "idb";

const DB_NAME = "cpspace-diary-cache";
const STORE_NAME = "window-data";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveWindowToCache(key, data) {
  const db = await getDB();
  await db.put(STORE_NAME, data, key);
}

export async function loadWindowFromCache(key) {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}
