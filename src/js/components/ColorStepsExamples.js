import bootstrapIconsSprite from 'bootstrap-icons/bootstrap-icons.svg';

class ColorStepsExamples extends HTMLElement {
  colorSteps = ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Magenta', 'Gray'];

  generateColorTools(color) {
    const tools = document.createElement('div');
    tools.classList.add('color-examples-toolbar', 'color-example-row');
    this.container.appendChild(tools);
    const spacer = document.createElement('div');
    tools.appendChild(spacer);
    this.label = document.createElement('div');
    this.label.classList.add('color-step-preview');
    this.label.innerText = 'Tools';
    tools.appendChild(this.label);
    for (let i = 1; i < 11; i++) {
      const gridItem = document.createElement('div');
      const tool = document.createElement('div');
      tool.classList.add('corn-checkbox', 'corn-checkbox--xs');
      const button = document.createElement('input');
      const buttonLabel = document.createElement('label');
      buttonLabel.innerText = `${i * 10}`;
      buttonLabel.setAttribute('for', `tool-${i * 10}`);
      buttonLabel.classList.add('corn-assistive-text');
      tool.appendChild(buttonLabel);
      button.id = `tool-${i * 10}`;
      button.type = 'checkbox';
      button.value = `${i + 1}`;
      button.name = 'color-step';
      button.ariaLabel = `Toggle ${i * 10}`;
      tool.appendChild(button);
      gridItem.appendChild(tool);
      tools.appendChild(gridItem);
    }
  }
  generateColorRow(color) {
    const row = document.createElement('div');
    row.classList.add('color-example');
    this.container.appendChild(row);
    //Add Color Label
    const colorPreview = document.createElement('div');

    colorPreview.classList.add('color-step-preview');
    const colorLabel = document.createElement('label');
    colorLabel.innerText = color;
    colorLabel.setAttribute('for', `lock-${color.toLowerCase()}`);
    const colorCheckbox = document.createElement('input');
    colorCheckbox.type = 'checkbox';
    colorCheckbox.id = `lock-${color.toLowerCase()}`;
    colorCheckbox.name = 'lock-color';
    colorCheckbox.value = color.toLowerCase();
    colorCheckbox.ariaLabel = `Lock ${color}`;
    //colorCheckbox.classList.add('corn-assistive-text');
    colorPreview.appendChild(colorCheckbox);

    colorPreview.appendChild(colorLabel);
    // colorPreview.innerText = color;
    colorPreview.style.boxShadow = `inset 0 0 0 2px var(--sample-${color.toLowerCase()}-50)`;
    row.appendChild(colorPreview);
    // Add Color Step Examples
    for (let i = 1; i < 11; i++) {
      const step = document.createElement('div');
      if (i < 6) {
        step.style.color = `var(--sample-black)`;
      } else {
        step.style.color = `var(--sample-white)`;
      }
      step.style.backgroundColor = `var(--sample-${color.toLowerCase()}-${i * 10})`;
      step.innerText = `${i * 10}`;
      row.appendChild(step);
    }
  }
  _generateColorRow(color) {
    const row = document.createElement('div');
    row.classList.add('color-example-row');
    this.container.appendChild(row);
    //Add Color Label
    const label = document.createElement('div');
    label.classList.add('color-step-preview');
    label.innerText = color;
    label.style.boxShadow = `inset 0 0 0 2px var(--sample-${color.toLowerCase()}-50)`;
    row.appendChild(label);
    // Add Color Step Examples
    for (let i = 1; i < 11; i++) {
      const step = document.createElement('div');
      if (i < 6) {
        step.style.color = `var(--sample-black)`;
      } else {
        step.style.color = `var(--sample-white)`;
      }
      step.style.backgroundColor = `var(--sample-${color.toLowerCase()}-${i * 10})`;
      step.innerText = `${i * 10}`;
      row.appendChild(step);
    }
  }
  addEventListeners() {
    this.addEventListener('change', this);
  }
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
        // const colorIndex = this.colorSteps.findIndex((c) => c.toLowerCase() === color);
        // if (target.checked) {
        //   rows[colorIndex].classList.remove('hidden');
        // } else {
        //   rows[colorIndex].classList.add('hidden');
        // }
      }
      if (target.name === 'lock-color' || target.name === 'lock-step') {
        this.updateFormValue();
      }
    }
  }

  renderFilters() {
    this.innerHTML = `
      <corn-expandable class="corn-expandable">
      <details slot="details">
        <summary class="corn-expandable-button">
          Filter options
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
  static formAssociated = true;
  static get formAssociated() {
    return true;
  }
  updateFormValue() {
    const lockedColors = Array.from(this.querySelectorAll('input[name="lock-color"]:checked')).map((checkbox) => checkbox.value);
    const lockedSteps = Array.from(this.querySelectorAll('input[name="lock-step"]:checked')).map((checkbox) => checkbox.value);
    this.internals.setFormValue('hello', 'world');
    console.log('internals', this.internals);
    console.log('value', this.value);
  }
  get value() {
    const lockedColors = Array.from(this.querySelectorAll('input[name="lock-color"]:checked')).map((checkbox) => checkbox.value);
    const lockedSteps = Array.from(this.querySelectorAll('input[name="lock-step"]:checked')).map((checkbox) => checkbox.value);
    return { lockedColors, lockedSteps };
  }
  set value(val) {
    this.updateFormValue();
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.renderFilters();
    this.container = document.createElement('div');
    this.container.classList.add('color-examples');
    this.appendChild(this.container);
    //this.generateColorTools();
    this.colorSteps.forEach((color) => {
      this.generateColorRow(color);
    });
    this.addEventListeners();
  }
}

customElements.define('color-steps-examples', ColorStepsExamples);
