import { store } from './store.js';
import { router } from './router.js';
import corncobStyles from '@bootsmonday/corncob-design-language/style.css?inline';
import toolstyles from '../assets/palette-tool.css?inline';

class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.unsubscribe = null;
    router.register('/', 'home-page', 'home');
    router.register('/counter', 'counter-page');
    router.register('/new-palette', 'palette-page', 'new');
    router.register('/todos', 'todo-page');
    router.register('/edit-palette', 'palette-page', 'edit');
    router.init();
  }

  connectedCallback() {
    this.unsubscribe = store.subscribeTo('currentRoute', () => this.storeUpdate());
    this.render();
    // Register routes

    console.log('AppRoot connectedCallback called');
  }

  storeUpdate() {
    this.updatePage();
  }
  disconnectedCallback() {
    this.unsubscribe?.();
  }
  updatePage() {
    const { currentRoute, pageType } = store.getState();
    console.log('---->Current route:', currentRoute, 'Page type:', pageType);
    let normalizedRoute = '/' + (currentRoute || '/').split(/\//).filter(Boolean)[0]; // Get the first segment for dynamic routes

    if (currentRoute.split('/')[1] === 'edit-palette') {
      normalizedRoute = '/edit-palette';
      const id = currentRoute.split('/')[2]; // Get the ID from the URL
      store.getState().paletteCollection.forEach((palette) => {
        if (palette.id === id) {
          store.setState({ workingPalette: palette, paletteName: palette.name, colorSpace: palette.colorSpace });
        }
      });
      store.setState({ editingPaletteId: id }); // Store the ID in the state for the edit page to use
    }

    const pageTag = router.routes[normalizedRoute] || 'home-page';
    console.log('Navigating to page:', pageTag, 'for route:', normalizedRoute);
    store.setState({ pageType: pageTag.pageType });
    console.log('Rendering page:', pageTag, normalizedRoute, router.routes, router.routes[normalizedRoute]?.componentName);
    this.shadowRoot.getElementById('current-page').innerHTML = `<${router.routes[normalizedRoute]?.componentName || 'home-page'}></${router.routes[normalizedRoute]?.componentName || 'home-page'}>`;
  }

  render() {
    // console.log('XXXXXXXXXXXXXXXX AppRoot render called');

    this.shadowRoot.innerHTML = `
    <style>
      ${corncobStyles}
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
          <a href="/" class="corn-button corn-button--sm" data-link>Home</a>
          <a href="/new-palette" class="corn-button corn-button--sm" data-link>New Palette</a>
          <div class="corn-popover--anchor corn-button-bar--more">
            <button class="corn-button corn-button--sm corn-pop" aria-controls="button-bar-popover" aria-label="more items">&middot;&middot;&middot;</button>
            <corn-popover position="bottom" id="button-bar-popover" class="corn-popover"></corn-popover>
          </div>
        </corn-button-bar>
      </nav>
    </header>

      <main class="corn-main corn-container corn-container--fluid" id="current-page">
       
      </main>
    `;

    // Handle navigation links
    this.shadowRoot.querySelectorAll('a[data-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate(link.getAttribute('href'));
      });
    });
    this.updatePage();
  }
}

customElements.define('app-root', AppRoot);
