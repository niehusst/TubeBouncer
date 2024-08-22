const test = require("ava");
const { readFileIntoScope, buildLocalStorage } = require("./util.js");
readFileIntoScope("./src/store.js");
readFileIntoScope("./src/options.js");

let browser = {};

test.beforeEach((t) => {
  browser = buildLocalStorage();
});

test("remaining watch time is correctly calculated", async (t) => {
  const key1 = "youtube.com";
  const key2 = "crunchyroll.com";

  browser = buildLocalStorage({
    [DATE_STORAGE_KEY()]: {
      [key1]: "today",
      [key2]: "yesterday",
    },
    [START_TIME_STORAGE_KEY()]: {
      [key1]: [0, 20000, 100000],
      [key2]: [10000, 100000],
    },
    [END_TIME_STORAGE_KEY()]: {
      [key1]: [10000, 50000, 130000],
      [key2]: [50000, 100000],
    },
  });
  
  let actual = await getRemainingWatchTime(key1);
  t.is(actual, 0);
  actual = await getRemainingWatchTime(key2);
  t.is(actual, 20);
});

