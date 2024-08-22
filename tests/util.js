const fs = require('fs');

module.exports.readFileIntoScope = function (filePath) {
  const content = fs.readFileSync(filePath, {encoding: 'utf8'});
  // weird hack to make eval run in the global scope
  // https://www.nico.fyi/blog/eval-global-and-local
  (1, eval)(content);
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

