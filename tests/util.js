const fs = require('fs');

module.exports.readFileIntoScope = function (filePath) {
  const content = fs.readFileSync(filePath, {encoding: 'utf8'});
  // sadly cant run eval here because we need to eval in global scope
  return content;
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

