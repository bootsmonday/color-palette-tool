import bootstrapIconsSprite from 'bootstrap-icons/bootstrap-icons.svg';
import store from '../store.js';
import { ColorModel } from '../models/ColorModel.js';

/**
 * ColorStepsExamples is a custom element that displays a grid of color steps for various colors.
 * It allows users to filter colors and steps, and lock specific colors or steps.
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
      const workingPalette = store.getState().workingPalette;
      //      console.log('workingPalette:', workingPalette);
      console.log('Change event detected:', target.name, target.value, target.checked);

      const colorName = target.value.split(':')[0];
      const stepValue = target.value.split(':')[1];
      const colorCategory = workingPalette.steps.find((step) => step.colorName.toLowerCase() === colorName);
      const colorStep = colorCategory.colors[stepValue];

      console.log('Color Step:', colorStep);

      if (target.name === 'contrast-foreground') {
        this.contrastColors.foreground = new ColorModel(colorStep);
        this.contrastColors.foregroundName = colorCategory.colorName;
        this.contrastColors.foregroundStep = `${(Number(stepValue) + 1) * 10}`;
        this.contrastColors.foregroundStyle = `var(--sample-${colorName.toLowerCase()}-${(Number(stepValue) + 1) * 10})`;
        document.getElementById('contrast-foreground').innerText = `${this.contrastColors.foregroundName} ${this.contrastColors.foregroundStep}`;
        // document.getElementById('contrast-sample').style.color = `var(--sample-${colorName.toLowerCase()}-${(Number(stepValue) + 1) * 10})`;
      }
      if (target.name === 'contrast-background') {
        this.contrastColors.background = new ColorModel(colorStep);
        this.contrastColors.backgroundName = colorCategory.colorName;
        this.contrastColors.backgroundStep = `${(Number(stepValue) + 1) * 10}`;
        this.contrastColors.backgroundStyle = `var(--sample-${colorName.toLowerCase()}-${(Number(stepValue) + 1) * 10})`;
        document.getElementById('contrast-background').innerText = `${this.contrastColors.backgroundName} ${this.contrastColors.backgroundStep}`;
        //document.getElementById('contrast-sample').style.backgroundColor = `var(--sample-${colorName.toLowerCase()}-${(Number(stepValue) + 1) * 10})`;
      }
      if (this.contrastColors.foreground && this.contrastColors.background) {
        document.getElementById('contrast-sample').style.color = this.contrastColors.foregroundStyle;
        document.getElementById('contrast-sample').style.backgroundColor = this.contrastColors.backgroundStyle;
        if (this.contrastColors.foregroundStep > this.contrastColors.backgroundStep) {
          document.getElementById('contrast-math').innerText = `${this.contrastColors.foregroundStep} - ${this.contrastColors.backgroundStep} = ${Number(this.contrastColors.foregroundStep) - Number(this.contrastColors.backgroundStep)}`;
        } else {
          document.getElementById('contrast-math').innerText = `${this.contrastColors.backgroundStep} - ${this.contrastColors.foregroundStep} = ${Number(this.contrastColors.backgroundStep) - Number(this.contrastColors.foregroundStep)}`;
        }
        const contrastRatio = this.contrastColors.foreground.getColor().contrast(this.contrastColors.background.getColor(), 'WCAG21');
        // document.getElementById('contrast-ratio').innerText = `Contrast Ratio: ${contrastRatio.toFixed(2)}`;
        // document.getElementById('contrast-text-normal').innerText = contrastRatio >= 4.5 ? 'Pass' : 'Fail';
        // document.getElementById('contrast-text-large').innerText = contrastRatio >= 3 ? 'Pass' : 'Fail';

        document.getElementById('contrast-ratio').innerText = `Contrast Ratio: ${contrastRatio.toFixed(2)} - ${contrastRatio >= 4.5 ? 'Pass' : 'Fail'} (Normal Text), ${contrastRatio >= 3 ? 'Pass' : 'Fail'} (Large Text)`;
        // document.getElementById('contrast-math').innerText = `${this.contrastColors.foregroundStep} - ${this.contrastColors.backgroundStep} = ${Number(this.contrastColors.foregroundStep) - Number(this.contrastColors.backgroundStep)}`;
        // document.getElementById('contrast-foreground').innerText = `${this.contrastColors.foregroundName}-${this.contrastColors.foregroundStep}`;
        // document.getElementById('contrast-background').innerText = `${this.contrastColors.backgroundName}-${this.contrastColors.backgroundStep}`;
        // const contrastRatio = this.calculateContrastRatio(this.contrastColors.foreground, this.contrastColors.background);
        //const contrastRatio = this.calculateContrastRatio(this.contrastColors.foreground, this.contrastColors.background);
        // console.log('Contrast Ratio:', contrastRatio);
        // document.getElementById('contrast-text-normal').innerText = contrastRatio >= 4.5 ? 'Pass' : 'Fail';
        // document.getElementById('contrast-text-large').innerText = contrastRatio >= 3 ? 'Pass' : 'Fail';
      }

      // workingPalette.
      // if (target.name === 'contrast-forground') {
      //   store.setState({ contrastForground: { color: colorName, step: stepValue } });
      // }

      // document.querySelectorAll('.color-step-preview').forEach((step) => {
      //   const checkbox = step.querySelector('input[type="checkbox"]');
      //   if (checkbox) {
      //     if (target.name === 'filter-color') {
      //       step.style.display = target.checked && checkbox.value.split(':')[0] !== target.value ? 'none' : '';
      //     } else if (target.name === 'filter-step') {
      //       step.style.display = target.checked && checkbox.value.split(':')[1] !== target.value ? 'none' : '';
      //     }
      //   }
      // });
    }
  }

  /**
   *
   * @param {string} color - The name of the color for which to generate the row. This function creates a row in the color steps grid for the specified color, including a color preview, label, and checkboxes for locking the color.It is displayed as a Column in the grid layout.
   */
  generateColorRow(color) {
    const row = document.createElement('div');
    row.classList.add('color-contrast-row');
    this.container.appendChild(row);
    //Add Color Label
    const colorPreview = document.createElement('div');

    colorPreview.classList.add('color-step-preview');
    const colorLabel = document.createElement('div');
    colorLabel.innerHTML = `${color}`;
    // colorPreview.appendChild(colorCheckbox);

    colorPreview.appendChild(colorLabel);
    // colorPreview.innerText = color;
    colorPreview.style.boxShadow = `inset 0 0 0 2px var(--sample-${color.toLowerCase()}-50)`;
    row.appendChild(colorPreview);
    // Add Color Step Examples
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
      foregroundStep.ariaLabel = ` ${color} ${stepValue}`;
      foregroundStep.classList.add('corn-assistive-text');

      const foregroundLabel = document.createElement('label');
      foregroundLabel.classList.add('corn-button', 'corn-button--icon', 'corn-button--xs');
      foregroundLabel.style.color = stepLabelColor;
      foregroundLabel.setAttribute('for', `foreground-${contrastId}`);
      foregroundLabel.innerHTML = `F`; //` ${stepValue}`;
      step.appendChild(foregroundStep);
      step.appendChild(foregroundLabel);

      const backgroundStep = document.createElement('input');
      backgroundStep.type = 'radio';
      backgroundStep.id = `background-${contrastId}`;
      backgroundStep.name = 'contrast-background';
      backgroundStep.value = `${color.toLowerCase()}:${stepValue}`;
      backgroundStep.ariaLabel = ` ${color} ${stepValue}`;
      backgroundStep.classList.add('corn-assistive-text');

      const backgroundLabel = document.createElement('label');
      backgroundLabel.classList.add('corn-button', 'corn-button--icon', 'corn-button--xs');
      backgroundLabel.setAttribute('for', `background-${contrastId}`);
      backgroundLabel.style.color = stepLabelColor;
      backgroundLabel.innerHTML = `B`; //` ${stepValue}`;
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
        <div id="contrast-sample" class="corn-panel">
          <div class="corn-margin-bottom" id="contrast-foreground">Choose a (F)oreground Color</div>
          <div id="contrast-background">Choose a (B)ackground Color</div>
          <div id="contrast-math"></div>
        </div>
      </div>
      <div class="corn-col-6">
        <div class="corn-panel contrast-score">
          <div id="contrast-ratio" class="corn-margin-bottom">For WCAG2.1 compliance: </div>
          <div>AA: 4.5:1</div>
          <div>AAA: 7:1</div>
        </div>
      </div>
    </div>`;
    //     <div>Normal Text: <span id="contrast-text-normal">Normal</span></div>
    // <div>Large Text: <span id="contrast-text-large">Normal</span></div>
    // <div>Large text is defined as 14 point (typically 18.66px) and bold or larger, or 18 point (typically 24px) or larger</div>
    //

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
    // this.updateAllColorLockStates();
    // this.updateFormValue();
  }
  /**
   * @description Cleans up event listeners when the component is disconnected from the DOM.
   */
  disconnectedCallback() {
    this.removeEventListener('change', this);
  }
}

customElements.define('contrast-checker', ContrastChecker);
