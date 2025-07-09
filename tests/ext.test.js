import test from "ava";
import { buildLocalStorage } from "./util.js";
import { DATE_STORAGE_KEY, END_TIME_STORAGE_KEY, START_TIME_STORAGE_KEY } from "../src/store.js";
import { spentTooLongOnUrl } from "../src/ext.js";

const min = 60 * 1000;

test("too much watch time calculated correctly across sessions", async (t) => {
  const key1 = "youtube.com";

  const browser = buildLocalStorage({
    [DATE_STORAGE_KEY]: {
      [key1]: "today",
    },
    [START_TIME_STORAGE_KEY]: {
      [key1]: [1727539537187,1727542345954],
    },
    [END_TIME_STORAGE_KEY]: {
      [key1]: [1727540377920,1727543142771],
    },
  });
  
  let actual = await spentTooLongOnUrl(key1, browser);
  t.is(actual, false);
});
