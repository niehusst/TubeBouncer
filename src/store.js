/* eslint-disable no-unused-vars */
const DATE_STORAGE_KEY = "date_key";
const START_TIME_STORAGE_KEY = "start_key";
const END_TIME_STORAGE_KEY = "end_key";
const WATCHED_TIME_MS_STORAGE_KEY = "watch_key";
const MAX_WATCH_TIME_MS = 1000 * 60 * 60; // 1h

async function readValue(key) {
  const savedValue = await browser.storage.local.get(key);
  return savedValue[key];
}

async function writeValue(key, value) {
  await browser.storage.local.set({
    [key]: value,
  });
}

