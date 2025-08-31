(function () {
  'use strict';

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
  const DATE_STORAGE_KEY = "date_key";
  const START_TIME_STORAGE_KEY = "start_key"; 
  const END_TIME_STORAGE_KEY = "end_key";
  const MAX_WATCH_TIME_MS = 1000 * 60 * 60; // 1h
  const USER_URLS_KEY = 'user_urls';

  async function readValue(key, browser) {
    const savedValue = await browser.storage.local.get(key);
    return savedValue[key];
  }

  async function writeValue(key, value, browser) {
    await browser.storage.local.set({
      [key]: value,
    });
  }

  async function sumWatchTime(urlKey, browser) {
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
    ];
    return infoList.join('\n');
  }

  async function optMain({browser, document}) {
    const naKey = "none";
    document.getElementById(naKey)?.remove();

    const dayMap = (await readValue(DATE_STORAGE_KEY, browser)) || {};
    const sites = Object.keys(dayMap);
    const body = document.getElementById("root");
    const hasVisitedSites = sites.length > 0;
    const hasPageUI = body.children.length > 0;
    // elements w/ dynamicLabel class marker have id w/ pattern "site_key::info_type"
    const dynamicLabel = 'dyn';
    const day = 'day';
    const watched = 'watched';
    const info = 'info';

    // --- User URL input UI (now static in HTML) ---
    const input = document.getElementById('user-url-list');
    const saveBtn = document.getElementById('user-url-save');
    if (input && saveBtn) {
      // Load and display current URLs
      const urls = await readValue(USER_URLS_KEY, browser) || [];

      // Display current patterns in the list
      const listDisplay = document.getElementById('user-url-list-display');
      function renderPatternList(patterns) {
        if (!listDisplay) return;
        listDisplay.innerHTML = '';
        patterns.forEach((pattern, idx) => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.alignItems = 'center';
          li.style.marginBottom = '2px';
          const span = document.createElement('span');
          span.textContent = pattern;
          li.appendChild(span);
          const delBtn = document.createElement('button');
          delBtn.textContent = 'X';
          delBtn.title = 'Delete pattern';
          delBtn.style.marginLeft = '8px';
          delBtn.style.fontSize = '0.9em';
          delBtn.style.padding = '0 4px';
          delBtn.onclick = async () => {
            const newPatterns = patterns.filter((_, i) => i !== idx);
            await writeValue(USER_URLS_KEY, newPatterns, browser);
            renderPatternList(newPatterns);
          };
          li.appendChild(delBtn);
          listDisplay.appendChild(li);
        });
      }
      renderPatternList(urls);

      saveBtn.onclick = async () => {
        const currentPatterns = await readValue(USER_URLS_KEY, browser) || [];
        const newPatterns = Array.from(new Set([...currentPatterns, input.value]));
        // Save unique, non-empty patterns
        await writeValue(USER_URLS_KEY, newPatterns, browser);
        saveBtn.textContent = 'Saved!';
        setTimeout(() => { saveBtn.textContent = 'Save'; }, 1000);
        renderPatternList(newPatterns);
      };
    }

    if (!hasVisitedSites && !hasPageUI) {
      // <div id="${naKey}"><h2>Haven't watched any sites yet</h2></div>
      const div = document.createElement('div');
      div.id = naKey;
      const h2 = document.createElement('h2');
      h2.textContent = "Haven't watched any sites yet";
      div.appendChild(h2);
      body.appendChild(div);
    } else if (hasVisitedSites && !hasPageUI) {
      // add elements for first time
      for (let key of sites) {
        // <div id=${key}></div>
        const elemGroup = document.createElement('div');
        elemGroup.id = key;
        body.appendChild(elemGroup);

        const watchTimeLeftMinutes = await getRemainingWatchTime(key, browser);

        // <p>Last watched ${key} on:</p>
        const p1 = document.createElement('p');
        p1.textContent = `Last watched ${key} on:`;
        elemGroup.appendChild(p1);

        // <h2 id="${key}::${day}" class="${dynamicLabel}">${dayMap[key]}</h2>
        const h2day = document.createElement('h2');
        h2day.id = `${key}::${day}`;
        h2day.className = dynamicLabel;
        h2day.textContent = dayMap[key];
        elemGroup.appendChild(h2day);

        // <p>Minutes left in day to watch:</p>
        const p2 = document.createElement('p');
        p2.textContent = 'Minutes left in day to watch:';
        elemGroup.appendChild(p2);

        // <h2 id="${key}::${watched}" class="${dynamicLabel}">${watchTimeLeftMinutes}</h2>
        const h2watched = document.createElement('h2');
        h2watched.id = `${key}::${watched}`;
        h2watched.className = dynamicLabel;
        h2watched.textContent = watchTimeLeftMinutes;
        elemGroup.appendChild(h2watched);
      }

      const btnId = 'btn';
      const ddId = `dd::${info}`;
      const infoData = await getInfo(browser);

      // <button id="${btnId}">(debug info)</button>
      const btn = document.createElement('button');
      btn.id = btnId;
      btn.textContent = '(debug info)';
      body.appendChild(btn);

      // <p class="small gone ${dynamicLabel}" id="${ddId}">${infoData}</p>
      const pInfo = document.createElement('p');
      pInfo.className = `small gone ${dynamicLabel}`;
      pInfo.id = ddId;
      pInfo.textContent = infoData;
      body.appendChild(pInfo);

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

  optMain({browser, document});
  setInterval(() => {
    optMain({browser, document});
  }, 5000);

})();
//# sourceMappingURL=options_bundle.js.map
