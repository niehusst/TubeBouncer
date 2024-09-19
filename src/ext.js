/* global DATE_STORAGE_KEY, END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY, latestEndTime, sumWatchTime, MAX_WATCH_TIME_MS, readValue, writeValue, getCurrentDate */
var intervalTime = 5 * 1000; // 5s

function navigateAway(window) {
  window.location.href = "https://en.wikipedia.org/wiki/Stop_sign#/media/File:Vienna_Convention_road_sign_B2a.svg";
}

function getUrlKey(window) {
  return new URL(window.location.href).host;
}

async function didWatchUrlToday(urlKey, browser) {
  const today = getCurrentDate();
  const savedDate = (await readValue(DATE_STORAGE_KEY, browser)) ?? {};
  return savedDate[urlKey] === today;
}

/**
 * Always appends a new entry to the START/END_TIME_STORAGE_KEY
 * list.
 */
async function writeNewTimeValue(key, urlKey, value, browser) {
  const timeMap = (await readValue(key, browser)) ?? {};

  if (timeMap[urlKey]) {
    timeMap[urlKey].push(value);
  } else {
    timeMap[urlKey] = [value];
  }

  await writeValue(key, timeMap, browser);
}

/**
 * Updates the latest (last) entry of the START/END_TIME_STORAGE_KEY
 * in-place with a new value.
 *
 * key: START/END_TIME_STORAGE_KEY
 * urlKey: urlKey to update value for
 * value: new value to set in key->urlKey->value map
 * browser: ext js browser global
 */
async function updateTimeValue(key, urlKey, value, browser) {
  const timeMap = (await readValue(key, browser)) ?? {};

  if (timeMap[urlKey]) {
    timeMap[urlKey][timeMap[urlKey].length - 1] = value;
  } else {
    timeMap[urlKey] = [value];
  }

  await writeValue(key, timeMap, browser);
}

async function updateStoredData(urlKey, browser) {
  const now = Date.now();

  // reset storage if first time on url today
  if (!(await didWatchUrlToday(urlKey, browser))) {
    const today = getCurrentDate();
    // reset all storage values for urlKey
    const dates = (await readValue(DATE_STORAGE_KEY, browser)) ?? {};
    dates[urlKey] = today;
    await writeValue(DATE_STORAGE_KEY, dates, browser);

    const startTimes = (await readValue(START_TIME_STORAGE_KEY, browser)) ?? {};
    startTimes[urlKey] = [now];
    await writeValue(START_TIME_STORAGE_KEY, startTimes, browser);
    
    const endTimes = (await readValue(END_TIME_STORAGE_KEY, browser)) ?? {};
    endTimes[urlKey] = [now];
    await writeValue(END_TIME_STORAGE_KEY, endTimes, browser);
  }

  // add new time diff pair to lists if we've been off url for a bit
  // aka start a new watch session
  const endTime = (await latestEndTime(urlKey, browser)) ?? now;
  if (now - endTime > 2 * intervalTime) {
    // add new slots to lists
    await writeNewTimeValue(START_TIME_STORAGE_KEY, urlKey, now, browser);
    await writeNewTimeValue(END_TIME_STORAGE_KEY, urlKey, now, browser);
  }

  // extend current watch session
  await updateTimeValue(END_TIME_STORAGE_KEY, urlKey, now, browser);
}

/**
 * Returns `true` if a window with a location matching
 * urlKey has been focused for MAX_WATCH_TIME_MS or more during
 * this day. Else `false`.
 */
async function spentTooLongOnUrl(urlKey, browser) {
  const tubeWatched = await sumWatchTime(urlKey, browser);
  return tubeWatched >= MAX_WATCH_TIME_MS;
}

/* eslint-disable no-unused-vars */

/**
 * main logic body. intended to be run on an interval
 */
async function main({browser, window}) {
  const urlKey = getUrlKey(window);
  await updateStoredData(urlKey);

  // gtfo if on yt and already watched too much
  if (await spentTooLongOnUrl(urlKey, browser)) {
    navigateAway(window);
  }
}

