/* eslint-disable no-unused-vars */
const DATE_STORAGE_KEY = "date_key";
const START_TIME_STORAGE_KEY = "start_key";
const END_TIME_STORAGE_KEY = "end_key";
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

async function firstStartTime() {
  const startTimeList = await readValue(START_TIME_STORAGE_KEY);
  if (startTimeList) {
    return startTimeList[0];
  }
  return undefined;
}

async function firstEndTime() {
  const endTimeList = await readValue(END_TIME_STORAGE_KEY);
  if (endTimeList) {
    return endTimeList[0];
  }
  return undefined;
}

async function sumWatchTime() {
  const startTimeList = (await readValue(START_TIME_STORAGE_KEY)) ?? [];
  const endTimeList = (await readValue(END_TIME_STORAGE_KEY)) ?? [];

  if (startTimeList.length !== endTimeList.length) {
    console.error('watch list len mismatch');
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < startTimeList.length; i++) {
    sum += endTimeList[i] - startTimeList[i];
  }
  return sum;
}
