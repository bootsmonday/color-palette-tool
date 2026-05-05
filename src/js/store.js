export const store = {
  state: {
    count: 0,
    todos: [],
    user: { name: "Alex" },
    currentRoute: "/",
  },

  listeners: new Set(),

  getState() {
    return { ...this.state };
  },

  setState(newPartialState) {
    this.state = { ...this.state, ...newPartialState };
    this.notify();
  },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  },
};
