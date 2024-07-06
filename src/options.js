/* global DATE_STORAGE_KEY, START_TIME_STORAGE_KEY, END_TIME_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue */
async function main() {
  const day = await readValue(DATE_STORAGE_KEY);
  const startTime = await readValue(START_TIME_STORAGE_KEY);
  const endTime = await readValue(END_TIME_STORAGE_KEY);

  document.getElementById("day").textContent = day ?? 'not yet';

  // bound watch time between 0 and MAX_WATCH_TIME_MS
  let timeWatchedMs = Math.min(Math.max((endTime ?? Infinity) - (startTime ?? Infinity), 0), MAX_WATCH_TIME_MS);
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

