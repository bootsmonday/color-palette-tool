import { store } from '../store.js';

class HomePage extends HTMLElement {
  connectedCallback() {
    this.render();

    store.getState().paletteCollection.forEach((palette, index) => {
      const paletteElement = document.createElement('div');
      paletteElement.classList.add('corn-palette');
      paletteElement.innerHTML = `
        <h3 ${index !== 0 ? 'style="margin-top: var(--cc-size-4)"' : ''}>${palette.name}</h3>
        <div class="palette-sample-image">
          <a href="/edit-palette/${palette.id}" class="corn-link"><sample-image palette-steps='${JSON.stringify(palette.steps)}'></sample-image></a>
        </div>
      `;
      this.querySelector('.corn-panel').appendChild(paletteElement);
    });
  }

  render() {
    this.innerHTML = `
      <div class="corn-row">
        <div class="corn-col-12">
        <h1>Color Palette Tool</h1>
        <div class="corn-panel">
            <a href="/new-palette" class="corn-link" style="margin-bottom: var(--cc-size-4);display: inline-block;">Create New Palette</a>
            <p>This tool allows you to create and manage color palettes. You can create a new palette, edit existing ones, and view sample images based on your palettes.</p>
            <p>Pallete data is stored in your browser's local storage, so it will persist across sessions. You can also export your palettes for use in other applications.</p>
            <p>To get started, click on "Create New Palette" to design your first color palette.</p>
            <h2>Current Palettes</h2>
            <a href="/new-palette" class="corn-link" style="margin-bottom: var(--cc-size-4);display: inline-block;">Create New Palette</a>
            ${store.getState().paletteCollection.length === 0 ? `<p>No palettes saved yet. Create a new palette to get started!</p>` : ''}
          

        </div>
      </div>
    `;
  }
}

customElements.define('home-page', HomePage);
