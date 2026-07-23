import { store } from './store.js';
import { createEmptyPalette } from './store.js';
import { router } from './router.js';
import toolstyles from '../assets/palette-tool.css?inline';
import bootstrapIconsSprite from 'bootstrap-icons/bootstrap-icons.svg';
/**
 * The AppRoot class represents the root component of the Color Palette Tool application. It is a custom HTML element that manages the overall layout, including the header, navigation, and main content area. The component listens for changes in the application's state, particularly the current route, and updates the displayed page accordingly. It also handles navigation events and initializes the router with the defined routes.
 */

class AppRoot extends HTMLElement {
  /**
   * This is the constructor for the AppRoot component. It initializes the component by calling the superclass constructor and setting up an unsubscribe property to manage state subscriptions. The constructor also registers the application's routes with the router, associating each route with a specific component and page type. This setup allows the AppRoot component to manage navigation and display the appropriate content based on the current route in the application's state.
   */
  constructor() {
    super();
    this.unsubscribe = null;
    router.register('/', 'home-page', 'home');
    router.register('/new-palette', 'palette-page', 'new');
    router.register('/about', 'about-page');
    router.register('/edit-palette', 'palette-page', 'edit');
    router.init();
  }

  /**
   * This method is called when the AppRoot element is added to the DOM. It subscribes to changes in the 'currentRoute' property of the application's state store, allowing the component to update the displayed page whenever the route changes. The method also calls render() to set up the initial HTML structure of the component, including the header, navigation, and main content area. This ensures that the application is properly initialized and ready to handle user interactions and navigation events.
   */
  connectedCallback() {
    this.unsubscribe = store.subscribeTo('currentRoute', () => this.storeUpdate());
    this.render();

    // Ensure runtime theme state also drives Lightning CSS helper vars in production builds.
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
    this.setTheme(initialTheme);

    this.querySelector('#toggle-theme').addEventListener('click', () => {
      this.setTheme();
    });
  }

  /**
   * This method is called whenever the 'currentRoute' property in the application's state store changes. It triggers an update of the displayed page by calling updatePage(), ensuring that the content shown to the user reflects the current route. This allows for dynamic navigation within the application, as users can move between different pages and see the corresponding content without needing to reload the entire application.
   */
  storeUpdate() {
    this.updatePage();
  }

  /**
   * This method is called when the AppRoot element is removed from the DOM. It checks if there is an active subscription to the application's state store and, if so, calls the unsubscribe function to clean up the subscription. This ensures that the component does not continue to receive updates or trigger re-renders after it has been removed from the DOM, preventing potential memory leaks and unnecessary processing.
   */
  disconnectedCallback() {
    this.unsubscribe?.();
  }

  /**
   * This method updates the displayed page based on the current route in the application's state store. It normalizes the route to handle dynamic routes, such as editing a specific palette, and sets the appropriate state properties for the working palette and page type. The method then determines which component to render based on the normalized route and updates the innerHTML of the main content area to display the corresponding component. This allows for seamless navigation within the application, as users can move between different pages and see the relevant content without needing to reload the entire application.
   */
  updatePage() {
    const { currentRoute, pageType } = store.getState();
    let normalizedRoute = '/' + (currentRoute || '/').split(/\//).filter(Boolean)[0]; // Get the first segment for dynamic routes

    if (currentRoute.split('/')[1] === 'edit-palette') {
      normalizedRoute = '/edit-palette';
      const id = currentRoute.split('/')[2]; // Get the ID from the URL
      store.setState({ editingPaletteId: id }); // Store the ID in the state for the edit page to use
    }

    if (normalizedRoute === '/new-palette') {
      store.setState({ workingPalette: createEmptyPalette(), editingPaletteId: null });
    }

    const pageTag = router.routes[normalizedRoute] || 'home-page';
    store.setState({ pageType: pageTag.pageType });
    this.querySelector('#current-page').innerHTML = `<${router.routes[normalizedRoute]?.componentName || 'home-page'}></${router.routes[normalizedRoute]?.componentName || 'home-page'}>`;
  }
  setTheme(theme) {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (!theme) {
      theme = newTheme;
    }

    const normalizedTheme = theme === 'dark' ? 'dark' : 'light';

    if (normalizedTheme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      html.style.setProperty('color-scheme', 'dark');
      html.style.setProperty('--lightningcss-light', ' ');
      html.style.setProperty('--lightningcss-dark', 'initial');
    } else {
      html.setAttribute('data-theme', 'light');
      html.style.setProperty('color-scheme', 'light');
      html.style.setProperty('--lightningcss-light', 'initial');
      html.style.setProperty('--lightningcss-dark', ' ');
    }

    try {
      localStorage.setItem('theme', normalizedTheme);
    } catch (_) {
      // storage unavailable (private browsing, sandboxed, or quota exceeded)
    }
  }

  /**
   * This method renders the initial HTML structure of the AppRoot component. It sets the innerHTML of the component to include a header with navigation links and a main content area where the current page will be displayed. The method also attaches event listeners to the navigation links to handle click events, preventing the default behavior and using the router to navigate to the specified route instead. This setup allows for dynamic navigation within the application, as users can move between different pages and see the corresponding content without needing to reload the entire application.
   */
  render() {
    this.innerHTML = `
    <style>
      ${toolstyles}
    </style>
    <header class="corn-header">
      <div class="corn-company">
        <div class="corn-company--logo">
          <img src="https://bootsmonday.github.io/corncob-design-language/_astro/corncob-colorized.BW4_Irv9_Z39pkX.webp" alt="Company Logo" />
        </div>
      </div>
      <div class="corn-header--title">Color Palette Tool</div>
      <nav class="corn-header--nav">
        <corn-button-bar class="corn-button-bar">
          <a href="${router.toAppPath('/')}" class="corn-button corn-button--sm" data-link data-route="/">Home</a>
          <a href="${router.toAppPath('/new-palette')}" class="corn-button corn-button--sm" data-link data-route="/new-palette">New Palette</a>
          <a href="${router.toAppPath('/about')}" class="corn-button corn-button--sm" data-link data-route="/about">About</a>
        </corn-button-bar>
      </nav>
      <div class="corn-header--actions">
        <button type="button" id="toggle-theme" class="corn-button corn-button--icon corn-button--xs" aria-label="Toggle dark / light mode"> <svg class="corn-icon docs-icon-dark" aria-hidden="true"><use href="${bootstrapIconsSprite}#moon"></use></svg><svg class="corn-icon docs-icon-light" aria-hidden="true"><use href="${bootstrapIconsSprite}#sun"></use></svg> </button> 
        <a href="https://github.com/bootsmonday/color-palette-tool" class="corn-button corn-button--icon corn-button--xs" aria-label="Color Palette Tool GitHub Repository"> <svg class="corn-icon"><use href="${bootstrapIconsSprite}#github"></use></svg></a> </div>
    </header>

      <main class="corn-main corn-container corn-container--fluid" id="current-page">
       
      </main>
    `;

    // Handle navigation links
    this.querySelectorAll('a[data-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate(link.getAttribute('data-route') || '/');
      });
    });
    this.updatePage();
  }
}

customElements.define('app-root', AppRoot);
