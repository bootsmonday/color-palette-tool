import store from '../store.js';
import { ColorModel } from '../models/ColorModel.js';

/**
 * ContrastChecker is a custom element that lets users compare foreground and background
 * color steps and review their WCAG 2.1 contrast ratio.
 */
class ContrastChecker extends HTMLElement {
  /**
   * @type {string[]}
   * @description An array of color names to be displayed in the color steps grid.
   */
  colorSteps = ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Magenta', 'Gray'];

  /**
   * @description Adds event listeners to the component for handling changes in filter and lock checkboxes.
   */
  addEventListeners() {
    this.addEventListener('change', this);
  }

  /**
   *
   * @param {Event} event - The event object triggered by user interaction.
   * @description Handles change events for filter and lock checkboxes, updating the display of color steps and the form value accordingly.
   */
  handleEvent(event) {
    if (event.type === 'change') {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !['contrast-foreground', 'contrast-background'].includes(target.name)) {
        return;
      }

      const workingPalette = store.getState().workingPalette;
      const [colorName, rawStepValue] = String(target.value || '').split(':');
      const stepValue = Number(rawStepValue);
      const colorCategory = workingPalette?.steps?.find((step) => step.colorName.toLowerCase() === colorName);
      const colorStep = colorCategory?.colors?.[stepValue];

      if (!colorName || !Number.isInteger(stepValue) || !colorCategory || !colorStep) {
        return;
      }

      const displayStep = (stepValue + 1) * 10;
      const contrastForeground = this.querySelector('#contrast-foreground');
      const contrastBackground = this.querySelector('#contrast-background');
      const contrastSample = this.querySelector('#contrast-sample');
      const contrastMath = this.querySelector('#contrast-math');
      const contrastRatioOutput = this.querySelector('#contrast-ratio');

      if (target.name === 'contrast-foreground') {
        this.contrastColors.foreground = new ColorModel(colorStep);
        this.contrastColors.foregroundName = colorCategory.colorName;
        this.contrastColors.foregroundStep = displayStep;
        this.contrastColors.foregroundStyle = `var(--sample-${colorName.toLowerCase()}-${displayStep})`;
        if (contrastForeground) {
          contrastForeground.innerText = `${this.contrastColors.foregroundName} ${this.contrastColors.foregroundStep}`;
        }
      }
      if (target.name === 'contrast-background') {
        this.contrastColors.background = new ColorModel(colorStep);
        this.contrastColors.backgroundName = colorCategory.colorName;
        this.contrastColors.backgroundStep = displayStep;
        this.contrastColors.backgroundStyle = `var(--sample-${colorName.toLowerCase()}-${displayStep})`;
        if (contrastBackground) {
          contrastBackground.innerText = `${this.contrastColors.backgroundName} ${this.contrastColors.backgroundStep}`;
        }
      }

      if (this.contrastColors.foreground && this.contrastColors.background && contrastSample && contrastMath && contrastRatioOutput) {
        contrastSample.style.color = this.contrastColors.foregroundStyle;
        contrastSample.style.backgroundColor = this.contrastColors.backgroundStyle;
        if (this.contrastColors.foregroundStep > this.contrastColors.backgroundStep) {
          contrastMath.innerText = `${this.contrastColors.foregroundStep} - ${this.contrastColors.backgroundStep} = ${this.contrastColors.foregroundStep - this.contrastColors.backgroundStep}`;
        } else {
          contrastMath.innerText = `${this.contrastColors.backgroundStep} - ${this.contrastColors.foregroundStep} = ${this.contrastColors.backgroundStep - this.contrastColors.foregroundStep}`;
        }
        const contrastRatio = this.contrastColors.foreground.getColor().contrast(this.contrastColors.background.getColor(), 'WCAG21');
        contrastRatioOutput.innerText = `Contrast Ratio: ${contrastRatio.toFixed(2)} - ${contrastRatio >= 4.5 ? 'Pass' : 'Fail'} (Normal Text), ${contrastRatio >= 3 ? 'Pass' : 'Fail'} (Large Text)`;
      }
    }
  }

  /**
   * @description Creates a row in the color steps grid for the specified color, including a color preview, label, and contrast selection controls. It is displayed as a column in the grid layout.
   * @param {string} color - The name of the color for which to generate the row.
   */
  generateColorRow(color) {
    const row = document.createElement('div');
    row.classList.add('color-contrast-row');
    this.container.appendChild(row);
    const colorPreview = document.createElement('div');

    colorPreview.classList.add('color-step-preview');
    const colorLabel = document.createElement('div');
    colorLabel.innerHTML = `${color}`;
    colorPreview.appendChild(colorLabel);
    colorPreview.style.boxShadow = `inset 0 0 0 2px var(--sample-${color.toLowerCase()}-50)`;
    row.appendChild(colorPreview);
    for (let i = 0; i < 10; i++) {
      const step = document.createElement('div');
      const stepValue = i;
      const contrastId = `contrast-step-${color.toLowerCase()}-${stepValue}`;
      let stepLabelColor = `var(--sample-black)`;
      if (i < 6) {
        step.style.color = `var(--sample-black)`;
      } else {
        step.style.color = `var(--sample-white)`;
        stepLabelColor = `var(--sample-white)`;
      }
      step.classList.add('color-step-preview', 'corn-col-1');
      step.style.backgroundColor = `var(--sample-${color.toLowerCase()}-${(i + 1) * 10})`;
      const foregroundStep = document.createElement('input');
      foregroundStep.type = 'radio';
      foregroundStep.id = `foreground-${contrastId}`;
      foregroundStep.name = 'contrast-foreground';
      foregroundStep.value = `${color.toLowerCase()}:${stepValue}`;
      foregroundStep.setAttribute('aria-label', `Select ${color} ${(i + 1) * 10} as foreground color`);
      foregroundStep.classList.add('corn-assistive-text');

      const foregroundLabel = document.createElement('label');
      foregroundLabel.classList.add('corn-button', 'corn-button--icon', 'corn-button--xs');
      foregroundLabel.style.color = stepLabelColor;
      foregroundLabel.setAttribute('for', `foreground-${contrastId}`);
      foregroundLabel.innerHTML = `F`;
      step.appendChild(foregroundStep);
      step.appendChild(foregroundLabel);

      const backgroundStep = document.createElement('input');
      backgroundStep.type = 'radio';
      backgroundStep.id = `background-${contrastId}`;
      backgroundStep.name = 'contrast-background';
      backgroundStep.value = `${color.toLowerCase()}:${stepValue}`;
      backgroundStep.setAttribute('aria-label', `Select ${color} ${(i + 1) * 10} as background color`);
      backgroundStep.classList.add('corn-assistive-text');

      const backgroundLabel = document.createElement('label');
      backgroundLabel.classList.add('corn-button', 'corn-button--icon', 'corn-button--xs');
      backgroundLabel.setAttribute('for', `background-${contrastId}`);
      backgroundLabel.style.color = stepLabelColor;
      backgroundLabel.innerHTML = `B`;
      step.appendChild(backgroundStep);
      step.appendChild(backgroundLabel);
      row.appendChild(step);
    }
  }

  /**
   * @description Renders the filter options for colors and steps, allowing users to customize the display of the color steps grid.
   */
  renderFilters() {
    this.innerHTML = `<h2 id="contrast-checker">WCAG 2.1 Contrast Checker</h2>`;
  }

  renderContrastResults() {
    const resultsContainer = document.createElement('div');
    resultsContainer.innerHTML = `<div class="corn-row">
      <div class="corn-col-6">
        <div id="contrast-sample" class="corn-panel" aria-live="polite" aria-atomic="true" aria-label="Color contrast sample preview">
          <div class="corn-margin-bottom" id="contrast-foreground">Choose a (F)oreground Color</div>
          <div id="contrast-background">Choose a (B)ackground Color</div>
          <div id="contrast-math"></div>
        </div>
      </div>
      <div class="corn-col-6">
        <div class="corn-panel contrast-score" aria-live="polite" aria-atomic="true" aria-label="WCAG contrast ratio results and compliance status">
          <div id="contrast-ratio" class="corn-margin-bottom">Contrast ratio will be displayed here after selecting colors.</div>
          <div>AA: 4.5:1</div>
          <div>AAA: 7:1</div>
        </div>
      </div>
    </div>`;

    resultsContainer.classList.add('contrast-results');
    this.appendChild(resultsContainer);
  }

  /**
   * @description Initializes the component, sets up the internals, renders filters, creates the container for color examples, generates color rows for each color step, and adds event listeners.
   */
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.renderFilters();
    this.contrastColors = {};
    this.container = document.createElement('div');
    this.container.classList.add('color-contrast-examples', 'corn-margin-bottom');
    this.appendChild(this.container);

    this.colorSteps.forEach((color) => {
      this.generateColorRow(color);
    });

    this.renderContrastResults();
    this.addEventListeners();
  }
  /**
   * @description Cleans up event listeners when the component is disconnected from the DOM.
   */
  disconnectedCallback() {
    this.removeEventListener('change', this);
  }
}

customElements.define('contrast-checker', ContrastChecker);
