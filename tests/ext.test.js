import test from "ava";
import { buildLocalStorage } from "./util.js";
import { DATE_STORAGE_KEY, END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY, MAX_WATCH_TIME_MS } from "../src/store.js";
import { spentTooLongOnUrl } from "../src/ext.js";

test("too much watch time calculated correctly across sessions", async (t) => {
  const key1 = "youtube.com";

  const third_max = Math.ceil(MAX_WATCH_TIME_MS / 3);
  const d1 = new Date().getTime();
  const d2 = new Date().getTime() + MAX_WATCH_TIME_MS;

  const browser = buildLocalStorage({
    [DATE_STORAGE_KEY]: {
      [key1]: "today",
    },
    [START_TIME_STORAGE_KEY]: {
      [key1]: [d1,d2],
    },
    [END_TIME_STORAGE_KEY]: {
      [key1]: [d1+third_max,d2+third_max],
    },
  });
  
  let actual = await spentTooLongOnUrl(key1, browser);
  t.is(actual, false);
});
