/* global DATE_STORAGE_KEY, START_TIME_STORAGE_KEY, END_TIME_STORAGE_KEY, WATCHED_TIME_MS_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue, writeValue */
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

async function updateStoredData() {
  if (isOnYoutube()) {
    await writeValue(END_TIME_STORAGE_KEY, Date.now());

    // write time watched
    const startTime = await readValue(START_TIME_STORAGE_KEY);
    const endTime = await readValue(END_TIME_STORAGE_KEY);
    const currWatchTime = (await readValue(WATCHED_TIME_MS_STORAGE_KEY)) ?? 0;
    // bound watch time between 0 and MAX_WATCH_TIME_MS
    let timeWatchedMs = Math.min(Math.max((endTime ?? Infinity) - (startTime ?? Infinity), 0), MAX_WATCH_TIME_MS);
    timeWatchedMs = isNaN(timeWatchedMs) ? 0 : timeWatchedMs;
    if (timeWatchedMs < currWatchTime) {
      // TODO: this isnt only executing once
      timeWatchedMs += currWatchTime;
    }
    await writeValue(WATCHED_TIME_MS_STORAGE_KEY, timeWatchedMs);

    if (!(await watchedYoutubeToday())) {
      const today = getCurrentDate();
      await writeValue(DATE_STORAGE_KEY, today);
      await writeValue(START_TIME_STORAGE_KEY, Date.now());
      await writeValue(WATCHED_TIME_MS_STORAGE_KEY, 0);
    }
  } else {
    // keep bumping start time along while we arent watching tube
    // to prevent counting time between yt sessions as watch time
    const now = Date.now();
    const endTime = (await readValue(END_TIME_STORAGE_KEY)) ?? now;
  
    if (now - endTime > 2 * intervalTime) {
      // reset start time for when yt is next watched
      await writeValue(START_TIME_STORAGE_KEY, now);
    }
  }
}

/**
 * Returns `true` if a window with a location matching
 * "youtube.com" has been focused for 1 hour or more during
 * this day. Else `false`.
 */
async function didWatchTooMuchYouTube() {
  const startTime = await readValue(START_TIME_STORAGE_KEY);
  const endTime = await readValue(END_TIME_STORAGE_KEY);
  const youtubeWatched = endTime - startTime;
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

/*
 * on every interval,
 * if date  != today, set eq today and reset time spent count
 * if location is youtub.e, add $interval to curr time spent on page in store
 *
 * when t_spent > 1h, nav away from youtube
 */
setInterval(() => {
  main();
}, intervalTime);
