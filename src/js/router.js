import { store } from './store.js';

/**
 * The router object manages the application's routing functionality. It allows for the registration of routes, navigation between different pages, and initialization of the router to handle browser history events. The router maintains a mapping of routes to their corresponding component names and page types, enabling dynamic rendering of components based on the current route in the application's state store. It also provides methods for navigating to specific routes and updating the application's state accordingly.
 *
 * Built to better understand how routing works in the application.
 * Can be replaced with a more robust routing library in the future if needed.
 */
export const router = {
  routes: {},

  getBasePath() {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    return base === '/' ? '' : base;
  },

  normalizeRoutePath(path) {
    const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
    const normalizedRoute = withLeadingSlash.replace(/\/+$/, '') || '/';
    return normalizedRoute;
  },

  toAppPath(path) {
    const routePath = this.normalizeRoutePath(path);
    const basePath = this.getBasePath();
    return `${basePath}${routePath}` || '/';
  },

  fromLocationPath(pathname) {
    const basePath = this.getBasePath();
    let routePath = pathname;

    if (basePath && routePath.startsWith(basePath)) {
      routePath = routePath.slice(basePath.length) || '/';
    }

    return this.normalizeRoutePath(routePath);
  },

  /**
   * Registers a new route with the router. It associates a specific path with a component name and an optional page type. The registered route is stored in the routes object, allowing the router to determine which component to render when navigating to that path. This method enables the application to define its navigation structure and map URLs to corresponding components.
   *
   * @param {string} path - The URL path for the route (e.g., '/new-palette').
   * @param {string} componentName - The name of the component to render for this route (e.g., 'palette-page').
   * @param {string} [pageType='home'] - An optional page type that can be used to differentiate between different types of pages (default is 'home').
   */
  register(path, componentName, pageType = 'home') {
    this.routes[path] = { componentName, pageType };
  },

  /**
   *
   * @param {string} path - The URL path to navigate to (e.g., '/new-palette').
   * This method updates the browser's history and the application's state to reflect the new route. It normalizes the provided path, removing any trailing slashes, and sets the currentRoute and pageType properties in the application's state store. This allows the application to dynamically render the appropriate component based on the new route, enabling seamless navigation between different pages without requiring a full page reload.
   */
  navigate(path) {
    const normalizedRoute = this.normalizeRoutePath(path);
    history.pushState({}, '', this.toAppPath(normalizedRoute));
    store.setState({ currentRoute: normalizedRoute, pageType: this.routes[normalizedRoute]?.pageType || 'home' });
  },

  /**
   * Initializes the router by setting up an event listener for the 'popstate' event, which is triggered when the user navigates using the browser's back or forward buttons. The method also sets the initial route based on the current URL path, normalizing it to remove any trailing slashes. It updates the application's state store with the current route and page type, allowing the application to render the appropriate component based on the initial URL when the page is first loaded.
   */
  init() {
    window.addEventListener('popstate', () => {
      const normalizedRoute = this.fromLocationPath(window.location.pathname);
      store.setState({ currentRoute: normalizedRoute, pageType: this.routes[normalizedRoute]?.pageType || 'home' });
    });

    // Initial route
    const normalizedRoute = this.fromLocationPath(window.location.pathname);
    store.setState({ currentRoute: normalizedRoute, pageType: this.routes[normalizedRoute]?.pageType || 'home' });
  },
};
