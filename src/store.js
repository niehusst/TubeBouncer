
async function readValue(key) {
  const savedValue = await browser.storage.local.get(key);
  return savedValue[key];
}

async function writeValue(key, value) {
  await browser.storage.local.set({
    [key]: value,
  });
}

module.exports = {
  DATE_STORAGE_KEY: "date_key",
  START_TIME_STORAGE_KEY: "start_key",
  readValue,
  writeValue,
};

