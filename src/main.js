const oneHourMs = 1000 * 60 * 60;
const intervalTime = 5 * 1000; // 5s
const DATE_STORAGE_KEY = "date_key";
const START_TIME_STORAGE_KEY = "start_key";

function navigateAway() {
  window.location.href = "https://en.wikipedia.org/wiki/Stop_sign#/media/File:Vienna_Convention_road_sign_B2a.svg";
}


function isOnYoutube() {
  return window.location.href.includes('youtube.com');
}

function getCurrentDate() {
  const d = new Date();
  return `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
}

async function watchedYoutubeToday() {
  const today = getCurrentDate();
  const savedDate = await browser.storage.local.get(DATE_STORAGE_KEY);
  return savedDate[DATE_STORAGE_KEY] === today;
}

async function updateStoredDate() {
  const today = getCurrentDate();
  if (!watchedYoutubeToday() && isOnYoutube()) {
    await browser.storage.local.set({
      [DATE_STORAGE_KEY]: today,
      [START_TIME_STORAGE_KEY]: Date.now(),
    });
  }
}

/**
 * Returns `true` if a window with a location matching
 * "youtube.com" has been focused for 1 hour or more during
 * this day. Else `false`.
 */
async function didWatchTooMuchYouTube() {
  const youtubeWatched = await browser.storage.local.get(START_TIME_STORAGE_KEY);
  const timeDiff = Date.now() - youtubeWatched[START_TIME_STORAGE_KEY];
  return timeDiff >= oneHourMs;
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
 * if date stored != today, set eq today and reset time spent count
 * if location is youtub.e, add $interval to curr time spent on page in store
 *
 * when t_spent > 1h, nav away from youtube
 */
setInterval(() => {
  main();
}, intervalTime);
