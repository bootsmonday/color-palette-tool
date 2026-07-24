import demoPalette from '../data/demoPalette.json';
import { ColorModel } from '../models/ColorModel.js';

/**
 * HeroImage is a custom element that displays a grid of color steps for various colors.
 */
class HeroImage extends HTMLElement {
  /**
   * @type {string[]}
   * @description An array of color names to be displayed in the color steps grid.
   */
  colorSteps = ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Magenta', 'Gray'];

  /**
   * @description Adds event listeners to the component for handling changes in filter and lock checkboxes.
   */
  addEventListeners() {
    // this.addEventListener('change', this);
  }

  renderExamples(steps) {
    steps.forEach((step) => {
      const row = document.createElement('div');
      row.classList.add('hero-color-row');
      this.container.appendChild(row);
      step.colors.forEach((color, i) => {
        const stepDiv = document.createElement('div');
        const colorModel = new ColorModel(color);
        stepDiv.classList.add('hero-color-step');

        stepDiv.style.backgroundColor = colorModel.getColor().toString({ format: 'hex' });
        row.appendChild(stepDiv);
        // let j = (i + 1) * 10;
        // const runtimeColor = color.getColor ? color : new ColorModel(color);
        // document.documentElement.style.setProperty(`--sample-${step.colorName.toLowerCase()}-${j}`, runtimeColor.getColor().toString({ format: 'hex' }));
        // if (i === 0) {
        //   // intentionally no-op; retained to avoid changing render timing assumptions
        // }
      });
    });
  }

  /**
   * @description Generates a row of color steps for a given color, including radio buttons for selecting foreground and background colors.
   * @param {string} color - The name of the color for which to generate the row.
   */
  generateColorRow(color) {
    const row = document.createElement('div');
    row.classList.add('color-example');
    this.container.appendChild(row);
    //Add Color Label
    const colorPreview = document.createElement('div');

    colorPreview.classList.add('color-step-preview');
    // const colorLabel = document.createElement('label');
    // colorLabel.innerHTML = `${color} <svg class="corn-icon"><use href="${bootstrapIconsSprite}#lock"></use></svg>`;
    // colorLabel.setAttribute('for', `lock-${color.toLowerCase()}`);
    // const colorCheckbox = document.createElement('input');
    // colorCheckbox.type = 'checkbox';
    // colorCheckbox.id = `lock-${color.toLowerCase()}`;
    // colorCheckbox.name = 'lock-color';
    // colorCheckbox.value = color.toLowerCase();
    // colorCheckbox.ariaLabel = `Lock ${color}`;
    // colorCheckbox.classList.add('palette-lock-checkbox');
    // colorCheckbox.classList.add('corn-assistive-text');
    // colorPreview.appendChild(colorCheckbox);

    // colorPreview.appendChild(colorLabel);
    // colorPreview.innerText = color;
    colorPreview.style.boxShadow = `inset 0 0 0 2px var(--sample-${color.toLowerCase()}-50)`;
    row.appendChild(colorPreview);
    // Add Color Step Examples
    for (let i = 1; i < 11; i++) {
      const step = document.createElement('div');
      const stepValue = i * 10;
      const lockId = `lock-step-${color.toLowerCase()}-${stepValue}`;
      if (i < 6) {
        step.style.color = `var(--sample-black)`;
      } else {
        step.style.color = `var(--sample-white)`;
      }
      step.classList.add('color-step-preview');
      step.style.backgroundColor = `var(--sample-${color.toLowerCase()}-${i * 10})`;
      const stepCheckbox = document.createElement('input');
      // stepCheckbox.type = 'checkbox';
      // stepCheckbox.id = lockId;
      // stepCheckbox.name = 'lock-step';
      // stepCheckbox.value = `${color.toLowerCase()}:${stepValue}`;
      // stepCheckbox.ariaLabel = `Lock ${color} ${stepValue}`;
      // stepCheckbox.classList.add('palette-lock-checkbox');
      // stepCheckbox.classList.add('corn-assistive-text');

      // const stepLabel = document.createElement('label');
      // stepLabel.setAttribute('for', lockId);
      // stepLabel.innerHTML = ` ${stepValue} <svg class="corn-icon"><use href="${bootstrapIconsSprite}#lock"></use></svg>`;

      // step.appendChild(stepCheckbox);
      // step.appendChild(stepLabel);
      row.appendChild(step);
    }
  }

  /**
   * @description Initializes the component, sets up the internals, renders filters, creates the container for color examples, generates color rows for each color step, and adds event listeners.
   */
  constructor() {
    super();
    // this.renderFilters();
    this.contrastColors = {};
    this.container = document.createElement('div');
    this.container.classList.add('hero-image');
    // this.container.classList.add('color-contrast-examples', 'corn-margin-bottom');
    this.appendChild(this.container);
    this.renderExamples(demoPalette.steps);
    const row = document.createElement('div');
    // row.classList.add('color-contrast-row');
    // this.container.appendChild(row);
    // const color = document.createElement('div');
    // color.classList.add('color-step-preview');
    // color.innerHTML = `Color`;
    // row.appendChild(color);

    // for (let i = 0; i < 10; i++) {
    //   const step = document.createElement('div');
    //   step.classList.add('color-step-preview', 'corn-col-1');
    //   step.innerHTML = `${(i + 1) * 10}`;
    //   row.appendChild(step);
    // }
    // this.colorSteps.forEach((color) => {
    //   this.generateColorRow(color);
    // });

    // this.renderContrastResults();
    // this.addEventListeners();
  }
  /**
   * @description Cleans up event listeners when the component is disconnected from the DOM.
   */
  disconnectedCallback() {
    // this.removeEventListener('change', this);
  }
}

customElements.define('hero-image', HeroImage);
