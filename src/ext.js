import {
  DATE_STORAGE_KEY,
  END_TIME_STORAGE_KEY,
  START_TIME_STORAGE_KEY,
  latestEndTime,
  sumWatchTime,
  MAX_WATCH_TIME_MS,
  readValue,
  writeValue,
  getCurrentDate,
  USER_URLS_KEY
} from './store.js';

export const intervalTime = 5 * 1000; // 5s

export function navigateAway(window) {
  window.location.href = "https://en.wikipedia.org/wiki/Stop_sign#/media/File:Vienna_Convention_road_sign_B2a.svg";
}

export function getUrlKey(window) {
  return new URL(window.location.href).host;
}

export async function didWatchUrlToday(urlKey, browser) {
  const today = getCurrentDate();
  const savedDate = (await readValue(DATE_STORAGE_KEY, browser)) ?? {};
  return savedDate[urlKey] === today;
}

/**
 * Always appends a new entry to the START/END_TIME_STORAGE_KEY
 * list.
 */
export async function writeNewTimeValue(key, urlKey, value, browser) {
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
export async function updateTimeValue(key, urlKey, value, browser) {
  const timeMap = (await readValue(key, browser)) ?? {};

  if (timeMap[urlKey]) {
    timeMap[urlKey][timeMap[urlKey].length - 1] = value;
  } else {
    timeMap[urlKey] = [value];
  }

  await writeValue(key, timeMap, browser);
}

export async function updateStoredData(urlKey, browser) {
  const now = Date.now();

  // reset storage if first time on url today
  if (!(await didWatchUrlToday(urlKey, browser))) {
    const today = getCurrentDate();
    // reset all storage values for urlKey
    const dates = {};
    dates[urlKey] = today;
    await writeValue(DATE_STORAGE_KEY, dates, browser);

    const startTimes = {};
    startTimes[urlKey] = [now];
    await writeValue(START_TIME_STORAGE_KEY, startTimes, browser);
    
    const endTimes = {};
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
export async function spentTooLongOnUrl(urlKey, browser) {
  const tubeWatched = await sumWatchTime(urlKey, browser);
  return tubeWatched >= MAX_WATCH_TIME_MS;
}

/**
 * main logic body. intended to be run on an interval
 */
export async function main({browser, window}) {
  const urlKey = getUrlKey(window);
  // Only decrease timer if current site matches user regex patterns
  const userPatterns = await readValue(USER_URLS_KEY ,browser) || [];
  const matches = userPatterns.some(pattern => {
    try {
      return new RegExp(pattern).test(urlKey);
    } catch {
      // Invalid regex, ignore
      return false;
    }
  });

  if (matches) {
    await updateStoredData(urlKey, browser);
    if (await spentTooLongOnUrl(urlKey, browser)) {
      navigateAway(window);
    }
  }
}
