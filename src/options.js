/* global DATE_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue, sumWatchTime */

async function getRemainingWatchTime(urlKey) {
    // bound watch time between 0 and MAX_WATCH_TIME_MS()
    let timeWatchedMs = await sumWatchTime(urlKey);
    timeWatchedMs = isNaN(timeWatchedMs) ? 0 : timeWatchedMs;
    timeWatchedMs = Math.min(Math.max(timeWatchedMs, 0), MAX_WATCH_TIME_MS());
    let watchTimeLeftMinutes = (MAX_WATCH_TIME_MS() - timeWatchedMs) / (1000 * 60);
    // allow only 2 decimal places
    watchTimeLeftMinutes = Math.trunc(watchTimeLeftMinutes * 100) / 100;
    return watchTimeLeftMinutes;
}

async function main() {
  const dayMap = await readValue(DATE_STORAGE_KEY());

  for (let key of Object.keys(dayMap)) {
    const body = document.getElementsByTagName("body")[0];
    body.insertAdjacentHTML("beforeend", `<div id=${key}></div>`);
    const elemGroup = document.getElementById(key);
    const watchTimeLeftMinutes = getRemainingWatchTime(key);
    elemGroup.insertAdjacentHTML("beforeend", `<p>Last watched ${key} on:</p>`);
    elemGroup.insertAdjacentHTML("beforeend", `<h2>${dayMap[key]}</h2>`);
    elemGroup.insertAdjacentHTML("beforeend", `<p>Minutes left in day to watch:</p>`);
    elemGroup.insertAdjacentHTML("beforeend", `<h2>${watchTimeLeftMinutes}</h2>`);
  }
}

