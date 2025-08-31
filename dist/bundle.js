(function () {
  'use strict';

  /* DATA STORAGE EXPLANATION:
   *
   * 3 separate data bits stored in local storage.
   * DATE_STORAGE_KEY is a map from urlKey to a date string of the
   * last day the urlKey was visited.
   *
   * START_TIME_STORAGE_KEY is a map from urlKey to a list of
   * watch-session start times as unix timestamps.
   * Ordered in chronological order. Corresponds to and end time
   * by matching index; together the 2 values form a time diff pair
   * representing the length of the watch-session.
   *
   * END_TIME_STORAGE_KEY is a map from urlKey to a list of
   * watch-session end times as unix timestamps.
   * Ordered in chronological order. Latest end timestamp will
   * be updated in place repeated until watch-session stagnates.
   * MUST BE SAME LENGTH AS LISTS IN START_TIME_STORAGE_KEY
   */

  // TODO: just consolidate this shit into 1 object

  // date_key: {urlKey: <date>, ...}
  const DATE_STORAGE_KEY = "date_key";
  const START_TIME_STORAGE_KEY = "start_key"; 
  const END_TIME_STORAGE_KEY = "end_key";
  const MAX_WATCH_TIME_MS = 1000 * 60 * 60; // 1h
  const USER_URLS_KEY = 'user_urls';

  async function readValue(key, browser) {
    const savedValue = await browser.storage.local.get(key);
    return savedValue[key];
  }

  async function writeValue(key, value, browser) {
    await browser.storage.local.set({
      [key]: value,
    });
  }

  async function latestEndTime(urlKey, browser) {
    const endTimeList = await readValue(END_TIME_STORAGE_KEY, browser);
    if (endTimeList && endTimeList[urlKey]) {
      return endTimeList[urlKey][endTimeList[urlKey].length - 1];
    }
    return undefined;
  }

  async function sumWatchTime(urlKey, browser) {
    const startTimeMap = (await readValue(START_TIME_STORAGE_KEY, browser)) ?? {};
    const startTimeList = startTimeMap[urlKey] ?? [];
    const endTimeMap = (await readValue(END_TIME_STORAGE_KEY, browser)) ?? {};
    const endTimeList = endTimeMap[urlKey] ?? [];

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

  function getCurrentDate() {
    const d = new Date();
    return `${d.getMonth()+1}-${d.getDate()}-${d.getFullYear()}`;
  }

  const intervalTime = 5 * 1000; // 5s

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
  async function spentTooLongOnUrl(urlKey, browser) {
    const tubeWatched = await sumWatchTime(urlKey, browser);
    return tubeWatched >= MAX_WATCH_TIME_MS;
  }

  /**
   * main logic body. intended to be run on an interval
   */
  async function main({browser, window}) {
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

  setInterval(() => {
    main({browser, window});
  }, intervalTime);

})();
//# sourceMappingURL=bundle.js.map
