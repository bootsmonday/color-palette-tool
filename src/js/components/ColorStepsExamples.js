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

      if (target.name === 'color-step') {
        let colorGridWidths = 'minmax(var(--cc-size-4), 0fr) minmax(0, 1fr) ';
        const steps = Array.from(this.querySelectorAll('input[name="color-step"]'));
        const checkedSteps = steps.filter((checkbox) => checkbox.checked);
        steps.forEach((checkbox) => {
          if (checkbox.checked) {
            colorGridWidths += `minmax(var(--cc-form--widget--size--xs), 0fr) `;
          } else {
            colorGridWidths += `minmax(0, 1fr) `;
          }
        });
        console.log(
          'Checked steps:',
          checkedSteps.map((checkbox) => checkbox.value)
        );
        this.querySelectorAll('.color-example-row').forEach((row) => {
          row.style.gridTemplateColumns = colorGridWidths;
          steps.forEach((checkbox) => {
            if (checkbox.checked) {
              row.querySelectorAll('div')[parseInt(checkbox.value) + 1].classList.add('selected');
            } else {
              row.querySelectorAll('div')[parseInt(checkbox.value) + 1].classList.remove('selected');
            }
          });
        });
      }
    }
  }
  constructor() {
    super();
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
