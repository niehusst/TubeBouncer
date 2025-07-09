export class LocalStorage {
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

export function buildLocalStorage(initialState = {}) {
  return {
    storage: {
      local: new LocalStorage(initialState),
    }
  };
}

