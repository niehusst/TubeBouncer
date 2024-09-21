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

async function getInfo(browser) {
  const dayMap = await readValue(DATE_STORAGE_KEY, browser);
  const endTimeList = await readValue(END_TIME_STORAGE_KEY, browser);
  const startTimeList = await readValue(START_TIME_STORAGE_KEY, browser);
  const infoList = [
    `days: ${JSON.stringify(dayMap)}`,
    `starts ms: ${JSON.stringify(startTimeList)}`,
    `ends ms: ${JSON.stringify(endTimeList)}`,
  ]
  return infoList.join('\n');
}

/* eslint-disable no-unused-vars */

async function optMain({browser, document}) {
  const naKey = "none";
  document.getElementById(naKey)?.remove();

  const dayMap = (await readValue(DATE_STORAGE_KEY, browser)) || {};
  const sites = Object.keys(dayMap);
  const body = document.getElementsByTagName("body")[0];
  const hasVisitedSites = sites.length > 0;
  const hasPageUI = body.children.length > 0;
  // elements w/ dynamicLabel class marker have id w/ pattern "site_key::info_type"
  const dynamicLabel = 'dyn';
  const day = 'day';
  const watched = 'watched';
  const info = 'info';

  if (!hasVisitedSites && !hasPageUI) {
    body.insertAdjacentHTML("beforeend", `<div id="${naKey}"><h2>Haven't watched any sites yet</h2></div>`);
  } else if (hasVisitedSites && !hasPageUI) {
    // add elements for first time
    for (let key of sites) {
      body.insertAdjacentHTML("beforeend", `<div id=${key}></div>`);
      const elemGroup = document.getElementById(key);
      const watchTimeLeftMinutes = await getRemainingWatchTime(key, browser);
      elemGroup.insertAdjacentHTML("beforeend", `<p>Last watched ${key} on:</p>`);
      elemGroup.insertAdjacentHTML("beforeend", `<h2 id="${key}::${day}" class="${dynamicLabel}">${dayMap[key]}</h2>`);
      elemGroup.insertAdjacentHTML("beforeend", '<p>Minutes left in day to watch:</p>');
      elemGroup.insertAdjacentHTML("beforeend", `<h2 id="${key}::${watched}" class="${dynamicLabel}">${watchTimeLeftMinutes}</h2>`);
    }

    const btnId = 'btn';
    const ddId = `dd::${info}`;
    const infoData = await getInfo(browser);
    body.insertAdjacentHTML("beforeend", `<button id="${btnId}">(debug info)</button>`);
    body.insertAdjacentHTML("beforeend", `<p class="small gone ${dynamicLabel}" id="${ddId}">${infoData}</p>`);
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', function () {
      const content = document.getElementById(ddId);
      if (content.style.display === "none" || content.style.display === "") {
          content.style.display = "block";
      } else {
          content.style.display = "none";
      }
    });
  } else if (hasVisitedSites && hasPageUI) {
    // update in place
    const elemsToUpdate = document.getElementsByClassName(dynamicLabel);
    for (let elem of elemsToUpdate) {
      const [key, action] = elem.id.split('::');
      switch (action) {
        case info:
          elem.innerText = await getInfo(browser);
          break;
        case day:
          elem.innerText = dayMap[key];
          break;
        case watched:
          elem.innerText = await getRemainingWatchTime(key, browser);
          break;
        default:
          console.error("bad action:", action);
          break;
      }
    }
  }
}

