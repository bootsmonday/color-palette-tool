import { store } from '../store.js';

class ColorForm extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribe(() => this.render());
    this.cacheElements();
    this.addEventListeners();
  }
  cacheElements() {
    this.colorNameInput = this.querySelector('#color-name');
    this.hueInput = this.querySelector('#hue-value');
    this.hueSlider = this.querySelector('#hue');
    this.saturationInput = this.querySelector('#saturation-value');
    this.saturationSlider = this.querySelector('#saturation');
  }
  addEventListeners() {
    const form = this.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.target.tagName.toLowerCase() === 'input') {
        return; // Ignore submit events from input elements
      }
      const formData = new FormData(form);
      const colorName = formData.get('color-name');
      const hue = formData.get('hue');
      const saturation = formData.get('saturation');
      console.log({ colorName, hue, saturation });
    });
    this.addEventListener('change', this);
  }
  handleEvent(e) {
    if (e.type === 'change') {
      console.log('Change event detected:', e.target.name, e.target.value);
      if (e.target.name === 'hue') {
        this.hueInput.value = e.target.value;
        this.changeHue(e);
      } else if (e.target.name === 'saturation') {
        this.saturationInput.value = e.target.value;
        this.changeSaturation(e);
      } else if (e.target.name === 'hue-value') {
        if (isNaN(e.target.value) || e.target.value < 0 || e.target.value > 360) {
          e.target.value = 180; // Reset to default if invalid
        }
        // Format to 2 decimal places
        e.target.value = parseFloat(e.target.value).toFixed(2);
        this.hueSlider.value = e.target.value;
        this.changeHue(e);
      } else if (e.target.name === 'saturation-value') {
        if (isNaN(e.target.value) || e.target.value < 0 || e.target.value > 100) {
          e.target.value = 50; // Reset to default if invalid
        }
        // Format to 2 decimal places
        e.target.value = parseFloat(e.target.value).toFixed(2);
        this.saturationSlider.value = e.target.value;
        this.changeSaturation(e);
      }
    }
  }

  changeHue(e) {
    console.log('Hue changed:', e.target.value);
  }

  changeSaturation(e) {
    console.log('Saturation changed:', e.target.value);
  }

  disconnectedCallback() {
    this.removeEventListener('change', this);
    this.unsubscribe?.();
  }

  render() {
    console.log('Rendering ColorForm');
    this.innerHTML = `
      <div class="corn-row corn-margin-bottom">
        <div class="corn-col-lg-8 corn-col-12">
          <form class="corn-form">
            <div class="corn-form--item">
              <div class="corn-text-input">
                <input id="color-name" name="color-name" placeholder="Enter Color Name..." />
                <label for="color-name">Color Name</label>
              </div>
            </div>
            <div class="corn-row">
              <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                <div class="corn-form--item">
                  <div class="corn-text-input corn-text-input--sm">
                    <input id="hue-value" name="hue-value" placeholder="Hue" value="360.88" />
                    <label for="hue-value" class="corn-assistive-text">Hue Value</label>
                  </div>
                </div>
              </div>
              <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                <div class="corn-slider corn-slider--sm">
                  <label for="hue">Hue:</label>
                  <input type="range" min="0" max="360" step="0.01" value="50" id="hue" name="hue"/>
                </div>
              </div>
            </div>
            <div class="corn-row">
              <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                <div class="corn-form--item">
                  <div class="corn-text-input corn-text-input--sm">
                    <input id="saturation-value" name="saturation-value" placeholder="Saturation" value="50" />
                    <label for="saturation-value" class="corn-assistive-text">Saturation Value</label>
                  </div>
                </div>
              </div>
              <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                <div class="corn-slider corn-slider--sm">
                  <label for="saturation">Saturation:</label>
                  <input type="range" min="0" max="100" step="0.01" value="50" id="saturation" name="saturation"/>
                </div>
              </div>
            </div>
            <div class="corn-button-group">
              <button type="submit" class="corn-button corn-button--sm">Add Color</button>
              <button type="reset" class="corn-button corn-button--sm corn-button--outline">Reset</button>
            </div> 
          </form>
        </div>
        <div class="corn-col-lg-4 corn-col-12">
          <div class="corn-panel">
            <h3>Color Preview</h3>
            <div class="corn-color-preview corn-margin-bottom" style="background-color: hsl(200, 50%, 50%); height: 100px; border-radius: var(--cc-border--radius);"></div>
      </div>
    `;
  }
}

customElements.define('color-form', ColorForm);
