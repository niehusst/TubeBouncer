const fs = require('fs');

module.exports.readFileIntoScope = function (filePath) {
  const content = fs.readFileSync(filePath, {encoding: 'utf8'});
  // sadly cant run eval here because we need to eval in global scope
  return content;
}

class LocalStorage {
  constructor(state) {
    this.state = state;
  }

  async get(key) {
    return { [key]: this.state[key] };
  }
  async set(updateState) {
    this.state = {
      ...this.state,
      ...updateState,
    };
  }
}

module.exports.buildLocalStorage = function (initialState = {}) {
  return {
    storage: {
      local: new LocalStorage(initialState),
    }
  }
}

