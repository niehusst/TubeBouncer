import test from "ava";
import { buildLocalStorage } from "./util.js";
import { DATE_STORAGE_KEY, END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY, MAX_WATCH_TIME_MS } from "../src/store.js";
import { getRemainingWatchTime } from "../src/options.js";

const min = 60 * 1000;
const minute_diff = (MAX_WATCH_TIME_MS / min) / 3;

test("remaining watch time is correctly calculated", async (t) => {
  const key1 = "youtube.com";
  const key2 = "crunchyroll.com";
  
  const browser = buildLocalStorage({
    [DATE_STORAGE_KEY]: {
      [key1]: "today",
      [key2]: "yesterday",
    },
    [START_TIME_STORAGE_KEY]: {
      [key1]: [0, 2*minute_diff*min, 4*minute_diff*min],
      [key2]: [0, 2*minute_diff*min],
    },
    [END_TIME_STORAGE_KEY]: {
      [key1]: [1*minute_diff*min, 3*minute_diff*min, 5*minute_diff*min],
      [key2]: [1*minute_diff*min, 3*minute_diff*min],
    },
  });
  
  let actual = await getRemainingWatchTime(key1, browser);
  t.is(actual, 0);
  actual = await getRemainingWatchTime(key2, browser);
  t.is(actual.toFixed(2), minute_diff.toFixed(2));
});

test("remaining watch time doesnt go below 0", async (t) => {
  const key1 = "youtube.com";

  const browser = buildLocalStorage({
    [DATE_STORAGE_KEY]: {
      [key1]: "today",
    },
    [START_TIME_STORAGE_KEY]: {
      [key1]: [0, 2*minute_diff*min],
    },
    [END_TIME_STORAGE_KEY]: {
      [key1]: [1*minute_diff*min, 30*minute_diff*min],
    },
  });
  
  let actual = await getRemainingWatchTime(key1, browser);
  t.is(actual, 0);
});
