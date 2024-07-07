/* global DATE_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue, sumWatchTime */
async function main() {
  const day = await readValue(DATE_STORAGE_KEY);

  document.getElementById("day").textContent = day ?? 'not yet';

  // bound watch time between 0 and MAX_WATCH_TIME_MS
  let timeWatchedMs = await sumWatchTime();
  timeWatchedMs = Math.min(Math.max(timeWatchedMs, 0), MAX_WATCH_TIME_MS);
  timeWatchedMs = isNaN(timeWatchedMs) ? 0 : timeWatchedMs;
  let watchTimeLeftMinutes = (MAX_WATCH_TIME_MS - timeWatchedMs) / (1000 * 60);
  // allow only 2 decimal places
  watchTimeLeftMinutes = Math.trunc(watchTimeLeftMinutes * 100) / 100;
  document.getElementById("time").textContent = watchTimeLeftMinutes;
}

main();
setInterval(() => {
  main();
}, 5000);

