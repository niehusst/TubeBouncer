/* global DATE_STORAGE_KEY, START_TIME_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue, writeValue */
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

async function updateStoredDate() {
  const today = getCurrentDate();
  if (!(await watchedYoutubeToday()) && isOnYoutube()) {
    await writeValue(DATE_STORAGE_KEY, today);
    await writeValue(START_TIME_STORAGE_KEY, Date.now());
  }
}

/**
 * Returns `true` if a window with a location matching
 * "youtube.com" has been focused for 1 hour or more during
 * this day. Else `false`.
 */
async function didWatchTooMuchYouTube() {
  const youtubeWatched = await readValue(START_TIME_STORAGE_KEY);
  const timeDiff = Date.now() - youtubeWatched;
  return timeDiff >= MAX_WATCH_TIME_MS;
}

/**
 * main logic body. intended to be run on an interval
 */
async function main() {
  await updateStoredDate();

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
