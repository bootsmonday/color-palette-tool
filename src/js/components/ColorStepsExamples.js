import bootstrapIconsSprite from 'bootstrap-icons/bootstrap-icons.svg';
/**
 * ColorStepsExamples is a custom element that displays a grid of color steps for various colors.
 * It allows users to filter colors and steps, and lock specific colors or steps.
 */
class ColorStepsExamples extends HTMLElement {
  /**
   * @type {string[]}
   * @description An array of color names to be displayed in the color steps grid.
   */
  colorSteps = ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Magenta', 'Gray'];

  /**
   * @description Indicates that this custom element is form-associated, allowing it to participate in form submission and validation.
   */
  static formAssociated = true;

  /**
   * @description Indicates that this custom element is form-associated, allowing it to participate in form submission and validation.
   */
  static get formAssociated() {
    return true;
  }

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

      if (target.name === 'filter-step') {
        let colorGridHeights = 'minmax(0, 1fr) ';
        const steps = Array.from(this.querySelectorAll('input[name="filter-step"]'));
        const checkedSteps = steps.filter((checkbox) => checkbox.checked);
        steps.forEach((checkbox) => {
          if (checkbox.checked) {
            colorGridHeights += `minmax(0, 1fr) `;
          } else {
            colorGridHeights += `minmax(0, 0fr)`;
          }
        });

        this.querySelectorAll('.color-example').forEach((row) => {
          row.style.gridTemplateRows = colorGridHeights;
          steps.forEach((checkbox) => {
            if (checkbox.checked) {
              row.querySelectorAll('div')[parseInt(checkbox.value)].classList.remove('selected');
            } else {
              row.querySelectorAll('div')[parseInt(checkbox.value)].classList.add('selected');
            }
          });
        });
      }
      if (target.name === 'filter-color') {
        let colorGridWidth = '';
        const checkedColors = Array.from(this.querySelectorAll('input[name="filter-color"]'));

        checkedColors.forEach((checkbox) => {
          if (checkbox.checked) {
            colorGridWidth += `minmax(0, 1fr) `;
          } else {
            colorGridWidth += `minmax(0, 0fr)`;
          }
        });
        this.querySelector('.color-examples').style.gridTemplateColumns = colorGridWidth;
      }
      if (target.name === 'lock-color' || target.name === 'lock-step') {
        if (target.name === 'lock-color') {
          this.setColorStepsLocked(target.value, target.checked);
          target.indeterminate = false;
          this.updateColorLockState(target.value);
        }

        if (target.name === 'lock-step') {
          const [colorKey] = String(target.value).split(':');
          this.updateColorLockState(colorKey);
        }

        this.updateFormValue();
      }
    }
  }

  /**
   * Returns all per-step lock inputs for a color key (e.g. "red").
   */
  getStepLockInputsForColor(colorKey) {
    return Array.from(this.querySelectorAll(`input[name="lock-step"][value^="${colorKey}:"]`));
  }

  /**
   * Locks or unlocks all steps for a single color.
   */
  setColorStepsLocked(colorKey, isLocked) {
    this.getStepLockInputsForColor(colorKey).forEach((stepInput) => {
      stepInput.checked = isLocked;
    });
  }

  /**
   * Synchronizes a color lock checkbox to reflect per-step lock state (checked/indeterminate/unchecked).
   */
  updateColorLockState(colorKey) {
    const colorInput = this.querySelector(`input[name="lock-color"][value="${colorKey}"]`);
    if (!colorInput) return;

    const stepInputs = this.getStepLockInputsForColor(colorKey);
    const lockedCount = stepInputs.filter((input) => input.checked).length;
    const totalCount = stepInputs.length;

    colorInput.checked = totalCount > 0 && lockedCount === totalCount;
    colorInput.indeterminate = lockedCount > 0 && lockedCount < totalCount;
    colorInput.setAttribute('aria-checked', colorInput.indeterminate ? 'mixed' : String(colorInput.checked));

    const label = this.querySelector(`label[for="${colorInput.id}"]`);
    if (label) {
      label.classList.toggle('is-indeterminate', colorInput.indeterminate);
    }
  }

  /**
   * Synchronizes all color lock checkboxes with their corresponding per-step locks.
   */
  updateAllColorLockStates() {
    this.querySelectorAll('input[name="lock-color"]').forEach((input) => {
      this.updateColorLockState(input.value);
    });
  }

  /**
   *
   * @param {string} color - The name of the color for which to generate the row. This function creates a row in the color steps grid for the specified color, including a color preview, label, and checkboxes for locking the color.It is displayed as a Column in the grid layout.
   */
  generateColorRow(color) {
    const row = document.createElement('div');
    row.classList.add('color-example');
    this.container.appendChild(row);
    //Add Color Label
    const colorPreview = document.createElement('div');

    colorPreview.classList.add('color-step-preview');
    const colorLabel = document.createElement('label');
    colorLabel.innerHTML = `<svg class="corn-icon"><use href="${bootstrapIconsSprite}#lock"></use></svg> ${color}`;
    colorLabel.setAttribute('for', `lock-${color.toLowerCase()}`);
    const colorCheckbox = document.createElement('input');
    colorCheckbox.type = 'checkbox';
    colorCheckbox.id = `lock-${color.toLowerCase()}`;
    colorCheckbox.name = 'lock-color';
    colorCheckbox.value = color.toLowerCase();
    colorCheckbox.ariaLabel = `Lock ${color}`;
    colorCheckbox.classList.add('palette-lock-checkbox');
    colorCheckbox.classList.add('corn-assistive-text');
    colorPreview.appendChild(colorCheckbox);

    colorPreview.appendChild(colorLabel);
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
      stepCheckbox.type = 'checkbox';
      stepCheckbox.id = lockId;
      stepCheckbox.name = 'lock-step';
      stepCheckbox.value = `${color.toLowerCase()}:${stepValue}`;
      stepCheckbox.ariaLabel = `Lock ${color} ${stepValue}`;
      stepCheckbox.classList.add('palette-lock-checkbox');
      stepCheckbox.classList.add('corn-assistive-text');

      const stepLabel = document.createElement('label');
      stepLabel.setAttribute('for', lockId);
      stepLabel.innerHTML = `<svg class="corn-icon"><use href="${bootstrapIconsSprite}#lock"></use></svg> ${stepValue}`;

      step.appendChild(stepCheckbox);
      step.appendChild(stepLabel);
      row.appendChild(step);
    }
  }

  /**
   * @description Renders the filter options for colors and steps, allowing users to customize the display of the color steps grid.
   */
  renderFilters() {
    this.innerHTML = `
      <corn-expandable class="corn-expandable">
      <details slot="details">
        <summary class="corn-expandable-button">
          Display Options
          <svg class="corn-icon" aria-hidden="true">
            <use href="${bootstrapIconsSprite}#chevron-right"></use>
          </svg>
        </summary>
        <div class="corn-expandable--content color-filters">
          <div class="corn-row">
          <div class="corn-col-12 corn-col-sm-6">
            <fieldset class="corn-form--item corn-checkbox-group corn-checkbox-group--inline">
            <legend>Colors</legend>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-red" name="filter-color" checked/>
              <label for="filter-red">Red</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-orange" name="filter-color" checked/>
              <label for="filter-orange">Orange</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-yellow" name="filter-color" checked/>
              <label for="filter-yellow">Yellow</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-green" name="filter-color" checked/>
              <label for="filter-green">Green</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-teal" name="filter-color" checked/>
              <label for="filter-teal">Teal</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-blue" name="filter-color" checked/>
              <label for="filter-blue">Blue</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-purple" name="filter-color" checked/>
              <label for="filter-purple">Purple</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-magenta" name="filter-color" checked/>
              <label for="filter-magenta">Magenta</label>
            </div>
            <div class="corn-checkbox corn-checkbox--sm">
              <input type="checkbox" id="filter-gray" name="filter-color" checked/>
              <label for="filter-gray">Gray</label>
            </div>
            </fieldset>      
          </div>
          <div class="corn-col-12 corn-col-sm-6">
            <fieldset class="corn-form--item corn-checkbox-group corn-checkbox-group--inline">
              <legend>Steps</legend>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="1" id="filter-steps-1" name="filter-step" checked/>
                <label for="filter-steps-1">10</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="2" id="filter-steps-2" name="filter-step" checked/>
                <label for="filter-steps-2">20</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="3" id="filter-steps-3" name="filter-step" checked/>
                <label for="filter-steps-3">30</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="4" id="filter-steps-4" name="filter-step" checked/>
                <label for="filter-steps-4">40</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="5" id="filter-steps-5" name="filter-step" checked/>
                <label for="filter-steps-5">50</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="6" id="filter-steps-6" name="filter-step" checked/>
                <label for="filter-steps-6">60</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="7" id="filter-steps-7" name="filter-step" checked/>
                <label for="filter-steps-7">70</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="8" id="filter-steps-8" name="filter-step" checked/>
                <label for="filter-steps-8">80</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="9" id="filter-steps-9" name="filter-step" checked/>
                <label for="filter-steps-9">90</label>
              </div>
              <div class="corn-checkbox corn-checkbox--sm">
                <input type="checkbox" value="10" id="filter-steps-10" name="filter-step" checked/>
                <label for="filter-steps-10">100</label>
              </div>
            </fieldset>
          </div>
        </details>
      </corn-expandable>`;
  }

  /**
   * @description Updates the form value based on the current state of locked colors and steps. This method collects the values of checked lock checkboxes and updates the form value accordingly.
   */
  updateFormValue() {
    const lockedColors = Array.from(this.querySelectorAll('input[name="lock-color"]:checked')).map((checkbox) => checkbox.value);
    const lockedSteps = Array.from(this.querySelectorAll('input[name="lock-step"]:checked')).map((checkbox) => checkbox.value);
    this.internals.setFormValue(JSON.stringify({ lockedColors, lockedSteps }));
  }

  /**
   * @description Gets the current value of the form, including locked colors and steps.
   */
  get value() {
    const lockedColors = Array.from(this.querySelectorAll('input[name="lock-color"]:checked')).map((checkbox) => checkbox.value);
    const lockedSteps = Array.from(this.querySelectorAll('input[name="lock-step"]:checked')).map((checkbox) => checkbox.value);
    return { lockedColors, lockedSteps };
  }

  /**
   * @param {Object} val - An object containing locked colors and steps to set the form value. The object should have properties `lockedColors` and `lockedSteps`, which are arrays of strings representing the locked colors and steps, respectively.
   * @description Sets the form value based on the provided object, updating the state of lock checkboxes accordingly.
   */
  set value(val) {
    if (val && typeof val === 'object') {
      const { lockedColors = [], lockedSteps = [] } = val;
      this.querySelectorAll('input[name="lock-step"]').forEach((checkbox) => {
        checkbox.checked = lockedSteps.includes(checkbox.value);
      });

      // Backward compatibility: if only color locks are present, lock all steps for those colors.
      this.querySelectorAll('input[name="lock-color"]').forEach((checkbox) => {
        if (lockedColors.includes(checkbox.value)) {
          this.setColorStepsLocked(checkbox.value, true);
        }
      });
    }
    this.updateAllColorLockStates();
    this.updateFormValue();
  }

  /**
   * @param {string[]} value - An array of color names to set as the color steps for the component. This setter updates the `colorSteps` property and re-renders the color steps grid accordingly.
   */
  set colors(value) {
    this.colorSteps = value;
  }

  /**
   * @description Gets the current array of color steps for the component.
   */
  get colors() {
    return this.colorSteps;
  }

  /**
   * @description Initializes the component, sets up the internals, renders filters, creates the container for color examples, generates color rows for each color step, and adds event listeners.
   */
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.renderFilters();
    this.container = document.createElement('div');
    this.container.classList.add('color-examples');
    this.appendChild(this.container);

    this.colorSteps.forEach((color) => {
      this.generateColorRow(color);
    });
    this.addEventListeners();
    this.updateAllColorLockStates();
    this.updateFormValue();
  }
  /**
   * @description Cleans up event listeners when the component is disconnected from the DOM.
   */
  disconnectedCallback() {
    this.removeEventListener('change', this);
  }
}

customElements.define('color-steps-examples', ColorStepsExamples);
