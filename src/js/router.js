import { store } from "./store.js";

export const router = {
  routes: {},

  register(path, componentName) {
    this.routes[path] = componentName;
  },

  navigate(path) {
    history.pushState({}, "", path);
    store.setState({ currentRoute: path });
  },

  init() {
    window.addEventListener("popstate", () => {
      store.setState({ currentRoute: window.location.pathname || "/" });
    });

    // Initial route
    store.setState({ currentRoute: window.location.pathname || "/" });
  },
};
