/* global DATE_STORAGE_KEY, START_TIME_STORAGE_KEY, MAX_WATCH_TIME_MS, readValue */
async function main() {
  const day = await readValue(DATE_STORAGE_KEY);
  const startTime = await readValue(START_TIME_STORAGE_KEY);
  document.getElementById("day").textContent = day ?? 'not yet';
  const timeWatchedMs = Math.max(Date.now() - (startTime ?? Infinity), 0);
  const watchTimeLeftMinutes = (MAX_WATCH_TIME_MS - timeWatchedMs) / (1000 * 60);
  document.getElementById("time").textContent = watchTimeLeftMinutes;
}

main();
setInterval(() => {
  main();
}, 5000);

