import { store } from '../store.js';

class HomePage extends HTMLElement {
  connectedCallback() {
    this.render();
    store.getState().paletteCollection.forEach((palette) => {
      console.log('Rendering palette:', palette);
      const paletteElement = document.createElement('div');
      paletteElement.classList.add('corn-palette');
      paletteElement.innerHTML = `
        <h3>${palette.name}</h3>
        <div class="corn-palette-colors">
          ${palette.steps.map((step) => `<div class="corn-palette-color" style="background-color: ${step.hex};"></div>`).join('')}
        </div>
        <a href="/edit-palette/${palette.id}" class="corn-link">View Palette</a>
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
          <a href="/new-palette" class="corn-link">Create New Palette</a>
            <p>This tool allows you to create a color palette with 10 lightness steps using the HSLuv color space. This color space is designed for perceptual uniformity that allows for more consistent lightness steps across different hues and saturations. By creating a palette with consistent lightness steps, you can ensure that your color palette will have good contrast and accessibility across a wide range of colors making it easier for both designers and developers to create accessible designs.</p>
            <p>You may start with a hex value and check the value against prescribed lightness steps. The tool will create a side by side comparison of the original hex value and the closest matching lightness step.</p>
            <p>You can create a palette from scratch by selecting a hue and saturation and allowing the tool to generate lightness steps based on those values.</p>
            <p>Palettes are saved to local storage and can be accessed from the home page. You will also be able to export Sass or CSS variables to use in your projects.</p>
          
            <h2>Current Palettes</h2>
            <p>No palettes saved yet. Create a new palette to get started!</p>
          

        </div>
      </div>
    `;
  }
}

customElements.define('home-page', HomePage);
