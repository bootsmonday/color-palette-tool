import { store } from '../store.js';

class PalettePage extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribeTo(['workingPalette', 'pageType'], () => this.update(), { batch: true });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  update() {
    const title = this.querySelector('#page-title');
    if (!title) return;

    const { workingPalette, pageType } = store.getState();
    const paletteName = workingPalette?.name || 'Palette';
    title.textContent = pageType === 'edit' ? `Edit ${paletteName}` : 'Create Palette';
  }

  render() {
    const { workingPalette, pageType } = store.getState();
    const paletteName = workingPalette?.name || 'Palette';

    this.innerHTML = `
      <div class="corn-row">
        <div class="corn-col-12">
          ${pageType === 'edit' ? `<h1 id="page-title">Edit ${paletteName}</h1>` : `<h1 id="page-title">Create Palette</h1>`}
        </div>
      </div>
      <div class="corn-row">
        <div class="corn-col-12">
          <div class="corn-panel">
            ${pageType === 'edit' ? `<color-tokens></color-tokens><hr />` : ``}
            <palette-form></palette-form>

            <div class="corn-row">
              <div class="corn-col-12">
                <h2>Template Samples</h2>
              </div>
              <div class="corn-col-6">
                <h3>CornCob Sample</h3>
                <corn-cob-template></corn-cob-template>
              </div>
              <div class="corn-col-6">
                <h3>Tailwind Sample</h3>
                <tailwind-template></tailwind-template>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('palette-page', PalettePage);
