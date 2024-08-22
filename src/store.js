/* eslint-disable no-unused-vars */

/* DATA STORAGE EXPLANATION:
 *
 * 3 separate data bits stored in local storage.
 * DATE_STORAGE_KEY() is a map from urlKey to a date string of the
 * last day the urlKey was visited.
 *
 * START_TIME_STORAGE_KEY() is a map from urlKey to a list of
 * watch-session start times as unix timestamps.
 * Ordered in chronological order. Corresponds to and end time
 * by matching index; together the 2 values form a time diff pair
 * representing the length of the watch-session.
 *
 * END_TIME_STORAGE_KEY() is a map from urlKey to a list of
 * watch-session end times as unix timestamps.
 * Ordered in chronological order. Latest end timestamp will
 * be updated in place repeated until watch-session stagnates.
 * MUST BE SAME LENGTH AS LISTS IN START_TIME_STORAGE_KEY()
 */

// TODO: just consolidate this shit into 1 object

// date_key: {urlKey: <date>, ...}
function DATE_STORAGE_KEY() { return "date_key"; }
// start_key: {urlKey: [<ts>, ...], ...}
function START_TIME_STORAGE_KEY() { return "start_key"; } 
// end_key: {urlKey: [<ts>, ...], ...}
function END_TIME_STORAGE_KEY() { return "end_key"; }
function MAX_WATCH_TIME_MS() { return 1000 * 60 * 60; } // 1h

async function readValue(key) {
  const savedValue = await browser.storage.local.get(key);
  return savedValue[key];
}

async function writeValue(key, value) {
  await browser.storage.local.set({
    [key]: value,
  });
}

async function latestStartTime(urlKey) {
  const startTimeList = await readValue(START_TIME_STORAGE_KEY());
  if (startTimeList && startTimeList[urlKey]) {
    return startTimeList[urlKey][startTimeList[urlKey].length - 1];
  }
  return undefined;
}

async function latestEndTime(urlKey) {
  const endTimeList = await readValue(END_TIME_STORAGE_KEY());
  if (endTimeList && endTimeList[urlKey]) {
    return endTimeList[urlKey][endTimeList[urlKey].length - 1];
  }
  return undefined;
}

async function sumWatchTime(urlKey) {
  const startTimeMap = (await readValue(START_TIME_STORAGE_KEY())) ?? {};
  const startTimeList = startTimeMap[urlKey] ?? [];
  const endTimeMap = (await readValue(END_TIME_STORAGE_KEY())) ?? {};
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

