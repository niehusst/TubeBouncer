import { END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY, DATE_STORAGE_KEY, readValue } from './store.js';
import { intervalTime, main } from './ext.js';

/* eslint-disable no-unused-vars */
async function printState() {
  const endTimeList = await readValue(END_TIME_STORAGE_KEY, browser);
  const startTimeList = await readValue(START_TIME_STORAGE_KEY, browser);
  const dates = await readValue(DATE_STORAGE_KEY, browser);
  console.log('start: ', startTimeList); 
  console.log('end: ', endTimeList); 
  console.log('dates: ', dates);
}

setInterval(() => {
  main({browser, window});
}, intervalTime);

