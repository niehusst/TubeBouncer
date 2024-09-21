/* global DATE_STORAGE_KEY, START_TIME_STORAGE_KEY, END_TIME_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue, sumWatchTime */

async function getRemainingWatchTime(urlKey, browser) {
  // bound watch time between 0 and MAX_WATCH_TIME_MS
  let timeWatchedMs = await sumWatchTime(urlKey, browser);
  timeWatchedMs = isNaN(timeWatchedMs) ? 0 : timeWatchedMs;
  timeWatchedMs = Math.min(Math.max(timeWatchedMs, 0), MAX_WATCH_TIME_MS);
  let watchTimeLeftMinutes = (MAX_WATCH_TIME_MS - timeWatchedMs) / (1000 * 60);
  // allow only 2 decimal places
  watchTimeLeftMinutes = Math.trunc(watchTimeLeftMinutes * 100) / 100;
  return watchTimeLeftMinutes;
}

/* eslint-disable no-unused-vars */

async function optMain({browser, document}) {
  const dayMap = (await readValue(DATE_STORAGE_KEY, browser)) || {};

  const sites = Object.keys(dayMap);
  const body = document.getElementsByTagName("body")[0];

  // clear those children
  while (body.lastElementChild) {
    body.removeChild(body.lastElementChild);
  }

  if (sites.length === 0) {
    const key = "none";
    body.insertAdjacentHTML("beforeend", `<div id=${key}></div>`);
    const elemGroup = document.getElementById(key);
    elemGroup.insertAdjacentHTML("beforeend", `<h2>Haven't watched any sites yet</h2>`);
  }
  
  for (let key of sites) {
    body.insertAdjacentHTML("beforeend", `<div id=${key}></div>`);
    const elemGroup = document.getElementById(key);
    const watchTimeLeftMinutes = await getRemainingWatchTime(key, browser);
    elemGroup.insertAdjacentHTML("beforeend", `<p>Last watched ${key} on:</p>`);
    elemGroup.insertAdjacentHTML("beforeend", `<h2>${dayMap[key]}</h2>`);
    elemGroup.insertAdjacentHTML("beforeend", `<p>Minutes left in day to watch:</p>`);
    elemGroup.insertAdjacentHTML("beforeend", `<h2>${watchTimeLeftMinutes}</h2>`);
  }

  const endTimeList = await readValue(END_TIME_STORAGE_KEY, browser);
  const startTimeList = await readValue(START_TIME_STORAGE_KEY, browser);
  const infoList = [
    `days: ${JSON.stringify(dayMap)}`,
    `starts ms: ${JSON.stringify(startTimeList)}`,
    `ends ms: ${JSON.stringify(endTimeList)}`,
  ]
  body.insertAdjacentHTML("beforeend", `<button id="btn">(debug info)</button><p class="small gone" id="dd">${infoList.join('\n')}</p>`);
  const btn = document.getElementById('btn');
  btn.addEventListener('click', function () {
    const content = document.getElementById('dd');
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
  });
}

