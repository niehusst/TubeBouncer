/* global DATE_STORAGE_KEY, WATCHED_TIME_MS_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue */
async function main() {
  const day = await readValue(DATE_STORAGE_KEY);

  document.getElementById("day").textContent = day ?? 'not yet';

  const watchedMs = (await readValue(WATCHED_TIME_MS_STORAGE_KEY)) ?? 0;
  let watchTimeLeftMinutes = (MAX_WATCH_TIME_MS - watchedMs) / (1000 * 60);
  // allow only 2 decimal places
  watchTimeLeftMinutes = Math.trunc(watchTimeLeftMinutes * 100) / 100;
  document.getElementById("time").textContent = watchTimeLeftMinutes;
}

main();
setInterval(() => {
  main();
}, 5000);

