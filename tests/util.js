const fs = require('fs');

module.exports.readFileIntoScope = function (filePath) {
  const content = fs.readFileSync(filePath);
  eval(content);
}

module.exports.buildLocalStorage = function (initialState = {}) {
  let state = initialState;
  return {
    storage: {
      local: {
        get: async (key) => {
          return { [key]: state[key] };
        },
        set: async (updateState) => {
          state = {
            ...state,
            ...updateState,
          };
        },
      }
    }
  }
}

