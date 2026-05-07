import { store } from '../store.js';
import { router } from '../router.js';
import corncobStyles from '@bootsmonday/corncob-design-language/style.css?inline';
import toolstyles from '../../assets/palette-tool.css?inline';

class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.unsubscribe = null;
  }

  connectedCallback() {
    //this.render();
    this.unsubscribe = store.subscribeTo('currentRoute', () => this.storeUpdate());

    // Register routes
    router.register('/', 'home-page');
    router.register('/counter', 'counter-page');
    router.register('/new-palette', 'palette-page');
    router.register('/todos', 'todo-page');
    router.init();
  }

  storeUpdate() {
    this.render();
  }
  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    const { currentRoute } = store.getState();
    const pageTag = router.routes[currentRoute] || 'home-page';

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
          <a href="/" class="corn-button corn-button--sm">Home</a>
          <a href="/new-palette" class="corn-button corn-button--sm">New Palette</a>
          <a href="/about" class="corn-button corn-button--sm">About</a>
          <div class="corn-popover--anchor corn-button-bar--more">
            <button class="corn-button corn-button--sm corn-pop" aria-controls="button-bar-popover" aria-label="more items">&middot;&middot;&middot;</button>
            <corn-popover position="bottom" id="button-bar-popover" class="corn-popover"></corn-popover>
          </div>
        </corn-button-bar>
      </nav>
    </header>

      <main class="corn-main corn-container corn-container--fluid">
        <${pageTag}></${pageTag}>
      </main>
    `;

    // Handle navigation links
    this.shadowRoot.querySelectorAll('a[data-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate(link.getAttribute('href'));
      });
    });
  }
}

customElements.define('app-root', AppRoot);
