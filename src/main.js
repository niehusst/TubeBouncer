const oneHourMs = 1000 * 60 * 60;
const intervalTime = 2000; // 2s
const DATE_STORAGE_KEY = "date_key";
const TIME_SPENT_STORAGE_KEY = "time_spent_key";

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

async function updateStoredDate() {
  const today = getCurrentDate();
  if (await browser.storage.local.get(DATE_STORAGE_KEY) !== today) {
    await browser.storage.local.set({
      DATE_STORAGE_KEY: today,
      TIME_SPENT_STORAGE_KEY: 0,
    });
  }
}

async function incrementWatchTime() {
  // could check if today, but should always be today due to execution order
  // in main
  if (isOnYoutube()) {
    let watchTime = await browser.storage.local.get(TIME_SPENT_STORAGE_KEY);
    watchTime += intervalTime;
    await browser.storage.local.set({
      TIME_SPENT_STORAGE_KEY: watchTime,
    });
  }
}

/**
 * Returns `true` if a window with a location matching
 * "youtube.com" has been focused for 1 hour or more during
 * this day. Else `false`.
 */
async function didWatchTooMuchYouTube() {
  const youtubeWatched = await browser.storage.local.get(TIME_SPENT_STORAGE_KEY);
  return youtubeWatched >= oneHourMs;
}

/**
 * main logic body. intended to be run on an interval
 */
async function main() {
  await updateStoredDate();

  await incrementWatchTime();

  // gtfo if on yt and already watched too much
  if (isOnYoutube() and (await didWatchTooMuchYouTube())) {
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
