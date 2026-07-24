import demoPalette from '../data/demoPalette.json';
import { ColorModel } from '../models/ColorModel.js';

/**
 * HeroImage is a custom element that displays a grid of color steps for various colors.
 */
class HeroImage extends HTMLElement {
  renderExamples(steps) {
    steps.forEach((step) => {
      const row = document.createElement('div');
      row.classList.add('hero-color-row');
      this.container.appendChild(row);
      step.colors.forEach((color) => {
        const stepDiv = document.createElement('div');
        const colorModel = new ColorModel(color);
        stepDiv.classList.add('hero-color-step');

        stepDiv.style.backgroundColor = colorModel.getColor().toString({ format: 'hex' });
        row.appendChild(stepDiv);
      });
    });
  }

  /**
   * @description Initializes the component and renders the demo palette rows.
   */
  constructor() {
    super();
    this.container = document.createElement('div');
    this.container.classList.add('hero-image');
    this.appendChild(this.container);
    this.renderExamples(demoPalette.steps);
  }
}

customElements.define('hero-image', HeroImage);
