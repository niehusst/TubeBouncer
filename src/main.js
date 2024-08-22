/* global DATE_STORAGE_KEY, END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY, latestEndTime, sumWatchTime, MAX_WATCH_TIME_MS, readValue, writeValue, intervalTime, main */

/* eslint-disable no-unused-vars */
async function printState() {
  const endTimeList = await readValue(END_TIME_STORAGE_KEY());
  const startTimeList = await readValue(START_TIME_STORAGE_KEY());
  const dates = await readValue(DATE_STORAGE_KEY());
  console.log('start: ', startTimeList); 
  console.log('end: ', endTimeList); 
  console.log('dates: ', dates);
}

setInterval(() => {
  main() //.then(() => printState());
}, intervalTime);

