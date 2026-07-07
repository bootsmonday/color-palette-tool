import { store } from '../store.js';
import Color from 'colorjs.io';
import { ColorModel } from '../models/ColorModel.js';

class ColorTokens extends HTMLElement {
  constructor() {
    super();
    console.log('ColorTokens constructor', store.getState());
  }
  render() {
    this.innerHTML += `
      <div class="corn-row">
        <div class="corn-col-12">
          <h2>Tokens</h2>
          <div id="color-tokens">tokens will go here</div>
        </div>
      </div>
      `;
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribeTo('workingPalette', () => this.update());
    this.addEventListeners();
  }
  addEventListeners() {
    // Add event listeners here
  }
  update() {
    const { workingPalette } = store.getState();
  }
}

customElements.define('color-tokens', ColorTokens);
