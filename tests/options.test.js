const test = require("ava");
const { readFileIntoScope, buildLocalStorage } = require("./util.js");
var browser = {};

eval(readFileIntoScope("./src/store.js"));
eval(readFileIntoScope("./src/options.js"));

const min = 60 * 1000;

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
      [key1]: [0, 20*min, 100*min, ],
      [key2]: [10*min, 40*min],
    },
    [END_TIME_STORAGE_KEY()]: {
      [key1]: [10*min, 50*min, 130*min],
      [key2]: [15*min, 75*min],
    },
  });
  console.log(JSON.stringify(browser))
  
  let actual = await getRemainingWatchTime(key1);
  t.is(actual, 0);
  actual = await getRemainingWatchTime(key2);
  t.is(actual, 20);
});

test("remaining watch time doesnt go below 0", async (t) => {
  const key1 = "youtube.com";

  browser = buildLocalStorage({
    [DATE_STORAGE_KEY()]: {
      [key1]: "today",
    },
    [START_TIME_STORAGE_KEY()]: {
      [key1]: [0, 20*min, 100*min, ],
    },
    [END_TIME_STORAGE_KEY()]: {
      [key1]: [10*min, 50*min, 135*min],
    },
  });
  
  let actual = await getRemainingWatchTime(key1);
  t.is(actual, 0);
});
