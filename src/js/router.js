import { store } from './store.js';

export const router = {
  routes: {},

  register(path, componentName, pageType = 'home') {
    this.routes[path] = { componentName, pageType };
  },

  navigate(path) {
    history.pushState({}, '', path);
    const normalizedRoute = path.replace(/\/+$/, '') || '/';
    store.setState({ currentRoute: normalizedRoute, pageType: this.routes[normalizedRoute]?.pageType || 'home' });
    console.log('Navigated to:', normalizedRoute);
    console.log(store.getState());
  },

  init() {
    window.addEventListener('popstate', () => {
      const normalizedRoute = window.location.pathname.replace(/\/+$/, '') || '/';
      store.setState({ currentRoute: normalizedRoute, pageType: this.routes[normalizedRoute]?.pageType || 'home' });
    });

    // Initial route
    const normalizedRoute = window.location.pathname.replace(/\/+$/, '') || '/';
    store.setState({ currentRoute: normalizedRoute, pageType: this.routes[normalizedRoute]?.pageType || 'home' });
  },
};
