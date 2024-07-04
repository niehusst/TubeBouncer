const store = require("./store.js");

async function main() {
  const day = await store.readValue(store.DATE_STORAGE_KEY);
  const startTime = await store.readValue(store.START_TIME_STORAGE_KEY);
  document.getElementById("day").value = day;
  document.getElementById("time").value = Math.max(Date.now() - startTime, 0);
}

setInterval(() => {
  main();
}, 5000);
