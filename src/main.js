/* global DATE_STORAGE_KEY, END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY, latestEndTime, sumWatchTime, MAX_WATCH_TIME_MS, readValue, writeValue */
const intervalTime = 5 * 1000; // 5s

function navigateAway() {
  window.location.href = "https://en.wikipedia.org/wiki/Stop_sign#/media/File:Vienna_Convention_road_sign_B2a.svg";
}

function getUrlKey() {
  return new URL(window.location.href).host;
}

function getCurrentDate() {
  const d = new Date();
  return `${d.getMonth()+1}-${d.getDate()}-${d.getFullYear()}`;
}

async function didWatchUrlToday(urlKey) {
  const today = getCurrentDate();
  const savedDate = (await readValue(DATE_STORAGE_KEY())) ?? {};
  return savedDate[urlKey] === today;
}

/**
 * Always appends a new entry to the START/END_TIME_STORAGE_KEY()
 * list.
 */
async function writeNewTimeValue(key, urlKey, value) {
  const timeMap = (await readValue(key)) ?? {};

  if (timeMap[urlKey]) {
    timeMap[urlKey].push(value);
  } else {
    timeMap[urlKey] = [value];
  }

  await writeValue(key, timeMap);
}

/**
 * Updates the latest (last) entry of the START/END_TIME_STORAGE_KEY()
 * in-place with a new value.
 *
 * key: START/END_TIME_STORAGE_KEY()
 * urlKey: urlKey to update value for
 * value: new value to set in key->urlKey->value map
 */
async function updateTimeValue(key, urlKey, value) {
  const timeMap = (await readValue(key)) ?? {};

  if (timeMap[urlKey]) {
    timeMap[urlKey][timeMap[urlKey].length - 1] = value;
  } else {
    timeMap[urlKey] = [value];
  }

  await writeValue(key, timeMap);
}

async function updateStoredData(urlKey) {
  const now = Date.now();

  // reset storage if first time on url today
  if (!(await didWatchUrlToday(urlKey))) {
    const today = getCurrentDate();
    // reset all storage values for urlKey
    const dates = (await readValue(DATE_STORAGE_KEY())) ?? {};
    dates[urlKey] = today;
    await writeValue(DATE_STORAGE_KEY(), dates);

    const startTimes = (await readValue(START_TIME_STORAGE_KEY())) ?? {};
    startTimes[urlKey] = [now];
    await writeValue(START_TIME_STORAGE_KEY(), startTimes);
    
    const endTimes = (await readValue(END_TIME_STORAGE_KEY())) ?? {};
    endTimes[urlKey] = [now];
    await writeValue(END_TIME_STORAGE_KEY(), endTimes);
  }

  // add new time diff pair to lists if we've been off url for a bit
  // aka start a new watch session
  const endTime = (await latestEndTime(urlKey)) ?? now;
  if (now - endTime > 2 * intervalTime) {
    // add new slots to lists
    await writeNewTimeValue(START_TIME_STORAGE_KEY(), urlKey, now);
    await writeNewTimeValue(END_TIME_STORAGE_KEY(), urlKey, now);
  }

  // extend current watch session
  await updateTimeValue(END_TIME_STORAGE_KEY(), urlKey, now);
}

/**
 * Returns `true` if a window with a location matching
 * urlKey has been focused for MAX_WATCH_TIME_MS() or more during
 * this day. Else `false`.
 */
async function spentTooLongOnUrl(urlKey) {
  const tubeWatched = await sumWatchTime(urlKey);
  return tubeWatched >= MAX_WATCH_TIME_MS();
}

/**
 * main logic body. intended to be run on an interval
 */
async function main() {
  const urlKey = getUrlKey();
  await updateStoredData(urlKey);

  // gtfo if on yt and already watched too much
  if (await spentTooLongOnUrl(urlKey)) {
    navigateAway();
  }
}

/* eslint-disable no-unused-vars */
async function printState() {
  const endTimeList = await readValue(END_TIME_STORAGE_KEY());
  const startTimeList = await readValue(START_TIME_STORAGE_KEY());
  const dates = await readValue(DATE_STORAGE_KEY());
  console.log('start: ', startTimeList); 
  console.log('end: ', endTimeList); 
  console.log9'dates: ', dates);
}

setInterval(() => {
  main() //.then(() => printState());
}, intervalTime);
