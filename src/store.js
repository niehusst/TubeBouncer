 

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
export const DATE_STORAGE_KEY = "date_key";
export const START_TIME_STORAGE_KEY = "start_key"; 
export const END_TIME_STORAGE_KEY = "end_key";
export const MAX_WATCH_TIME_MS = 1000 * 60 * 60; // 1h

export async function readValue(key, browser) {
  const savedValue = await browser.storage.local.get(key);
  return savedValue[key];
}

export async function writeValue(key, value, browser) {
  await browser.storage.local.set({
    [key]: value,
  });
}

export async function latestStartTime(urlKey, browser) {
  const startTimeList = await readValue(START_TIME_STORAGE_KEY, browser);
  if (startTimeList && startTimeList[urlKey]) {
    return startTimeList[urlKey][startTimeList[urlKey].length - 1];
  }
  return undefined;
}

export async function latestEndTime(urlKey, browser) {
  const endTimeList = await readValue(END_TIME_STORAGE_KEY, browser);
  if (endTimeList && endTimeList[urlKey]) {
    return endTimeList[urlKey][endTimeList[urlKey].length - 1];
  }
  return undefined;
}

export async function sumWatchTime(urlKey, browser) {
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

export function getCurrentDate() {
  const d = new Date();
  return `${d.getMonth()+1}-${d.getDate()}-${d.getFullYear()}`;
}
