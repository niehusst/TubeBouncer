const coreImport = require('@actions/core');
const fsImport = require('fs').promises;

// expects this repo to be locally cloned and available
async function run({
  fs = fsImport,
  core = coreImport,
} = {}) {
  const newVersion = core.getInput('new-version', { required: true });

  const manifestPath = './manifest.json';
  const rawManifest = await fs.readFile(manifestPath);
  const manifest = JSON.parse(rawManifest);
  manifest.version = newVersion;
  await fs.writeFile(manifestPath, JSON.stringify(manifest));
}

module.exports = run;

if (require.main === module) {
  run().catch((e) => {
    console.error(e);
    coreImport.setFailed(e);
  });
}
