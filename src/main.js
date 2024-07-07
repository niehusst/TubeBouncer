/* global DATE_STORAGE_KEY, END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY, firstEndTime, sumWatchTime, MAX_WATCH_TIME_MS, readValue, writeValue */
const intervalTime = 5 * 1000; // 5s

function navigateAway() {
  window.location.href = "https://en.wikipedia.org/wiki/Stop_sign#/media/File:Vienna_Convention_road_sign_B2a.svg";
}

function isOnYoutube() {
  return window.location.href.includes('youtube.com');
}

function getCurrentDate() {
  const d = new Date();
  return `${d.getMonth()+1}-${d.getDate()}-${d.getFullYear()}`;
}

async function watchedYoutubeToday() {
  const today = getCurrentDate();
  const savedDate = await readValue(DATE_STORAGE_KEY);
  return savedDate === today;
}

async function writeTimeValue(key, value) {
  const timeList = (await readValue(key)) ?? [];

  if (timeList.length === 0) {
    timeList.push(value);
  } else {
    timeList[0] = value;
  }

  await writeValue(key, timeList);
}

async function updateStoredData() {
  if (isOnYoutube()) {
    // add new time diff pair to lists if we've been off yt for a bit
    const now = Date.now();
    const endTime = (await firstEndTime()) ?? now;
    if (now - endTime > 2 * intervalTime) {
      // add new slots to lists
      const endTimeList = (await readValue(END_TIME_STORAGE_KEY)) ?? [];
      const startTimeList = (await readValue(START_TIME_STORAGE_KEY)) ?? [];
      console.log('start', startTimeList, 'end', endTimeList);
      endTimeList.push(now);
      startTimeList.push(now);
      await writeValue(END_TIME_STORAGE_KEY, endTimeList);
      await writeValue(START_TIME_STORAGE_KEY, startTimeList);
    }

    await writeTimeValue(END_TIME_STORAGE_KEY, Date.now());

    if (!(await watchedYoutubeToday())) {
      const today = getCurrentDate();
      await writeValue(DATE_STORAGE_KEY, today);
      await writeTimeValue(START_TIME_STORAGE_KEY, Date.now());
    }
  }
}

/**
 * Returns `true` if a window with a location matching
 * "youtube.com" has been focused for 1 hour or more during
 * this day. Else `false`.
 */
async function didWatchTooMuchYouTube() {
  const youtubeWatched = await sumWatchTime();
  return youtubeWatched >= MAX_WATCH_TIME_MS;
}

/**
 * main logic body. intended to be run on an interval
 */
async function main() {
  await updateStoredData();

  // gtfo if on yt and already watched too much
  if (isOnYoutube() && (await didWatchTooMuchYouTube())) {
    navigateAway();
  }
}

/* eslint-disable no-unused-vars */
async function printState() {
  const endTimeList = await readValue(END_TIME_STORAGE_KEY);
  const startTimeList = await readValue(START_TIME_STORAGE_KEY);
  console.log('start: ', startTimeList); 
  console.log('end: ', endTimeList); 
}

/*
 * on every interval,
 * if date  != today, set eq today and reset time spent count
 * if location is youtub.e, add $interval to curr time spent on page in store
 *
 * when t_spent > 1h, nav away from youtube
 */
setInterval(() => {
  main() //.then(() => printState());
}, intervalTime);
