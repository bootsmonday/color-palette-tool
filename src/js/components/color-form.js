import { store } from '../store.js';
import { ColorModel } from '../models/ColorModel.js';
import Color from 'colorjs.io';

// // import * as HSLuv from 'colorjs.io/plugins/hsluv';
// Color.register(OKHSL);
// // Color.register(HSLuv);

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];

// Red: 340° – 20°, 320 - 10
// Orange: 20° – 50°
// Yellow: 50° – 70°
// Green: 70° – 160°
// Cyan: 160° – 190°
// Blue: 190° – 250°,  160 - 250
// Purple: 250° – 290°, 250 - 320
// Pink: 290° – 340°
// 1 starts at 20;
// vortext math 1 - 2 20deg 2-4 40deg 4-5 20 deg 5-7 40 deg 7 - 8 20 deg

class ColorForm extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
  }

  calculateColorPreview() {
    // const hue = this.hueInput.value || 0;
    // const saturation = this.saturationInput.value || 0;
    // const lightness = lightnessSteps[10]; // Default to middle lightness
    // const color = new Color(this.colorSpace, [hue, saturation, lightness]);
    // this.colorPreview.style.backgroundColor = `${color.toString({ format: 'hex' })}`;
    //this.updateColorPreview();
  }

  /**
   * Vortex Math Palette – Unique Categories + Exclude Starting Hue Category
   */
  calculateVortexHues(startHue, saturation = 100, lightness = 50) {
    const vortexOrder = [1, 2, 4, 8, 7, 5];
    const offsets = { 1: 0, 2: 40, 4: 120, 8: 280, 7: 240, 5: 160 };

    // Calculate original vortex hues
    let originalHues = {};
    for (const num of vortexOrder) {
      originalHues[num] = (startHue + offsets[num]) % 360;
    }

    const startCategory = this.getColorCategory(startHue);

    // Category centers
    const categoryCenters = {
      Red: 15,
      Orange: 65,
      Yellow: 90,
      Green: 138,
      Blue: 220,
      Purple: 320,
    };

    // Available categories (exclude starting one)
    let availableCats = Object.keys(categoryCenters).filter((cat) => cat !== startCategory);

    // Sort vortex numbers by angular distance from startHue (farthest first)
    const sortedVortex = vortexOrder
      .slice()
      .sort((a, b) => {
        const distA = Math.min(Math.abs(originalHues[a] - startHue), 360 - Math.abs(originalHues[a] - startHue));
        const distB = Math.min(Math.abs(originalHues[b] - startHue), 360 - Math.abs(originalHues[b] - startHue));
        return distB - distA; // farthest first
      })
      .slice(0, 5); // take only 5 farthest vortex numbers

    const assigned = {};

    availableCats.forEach((cat, i) => {
      const vortexNum = sortedVortex[i];
      const hue = categoryCenters[cat];

      assigned[vortexNum] = {
        vortex: vortexNum,
        hue: Math.round(hue * 100) / 100,
        category: cat,
        originalHue: Math.round(originalHues[vortexNum] * 100) / 100,
      };
    });

    // Return in original vortex sequence order (only the 5 used)
    return vortexOrder.filter((num) => assigned[num]).map((num) => assigned[num]);
  }

  /** Helper: Get category from hue */
  getColorCategory(hue) {
    hue = ((hue % 360) + 360) % 360;
    if (hue >= 350 || hue < 40) return 'Red';
    if (hue >= 40 && hue < 90) return 'Orange';
    if (hue >= 90 && hue < 115) return 'Yellow';
    if (hue >= 115 && hue < 170) return 'Green';
    if (hue >= 170 && hue < 270) return 'Blue';
    return 'Purple';
  }

  connectedCallback() {
    // convert let okhslColor = color.to('okhsl');
    this.initialize();
    this.render();

    this.unsubscribe = store.subscribeTo(['colorSpace', 'previewColor'], (changes, newState, oldState) => this.update(changes, newState, oldState), { batch: true });
    this.cacheElements();
    this.addEventListeners();
    this.updatePreview();
  }

  initialize() {
    console.log('Initializing ColorForm');
    this.colorSpace = store.getState().colorSpace;
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };

    this.previewColor = store.getState().previewColor || null;

    if (!this.previewColor) {
      const defaultPreviewColor = new ColorModel({
        colorSpace: this.colorSpace,
        hue: 180,
        saturation: this.getSaturation().default,
        lightness: lightnessSteps[5],
      });
      console.log('Setting initial preview color in store:', defaultPreviewColor);
      store.setState({ previewColor: defaultPreviewColor });
      this.previewColor = defaultPreviewColor;
      console.log('Initialized previewColor:', this.previewColor);
    }
  }
  cacheElements() {
    this.colorNameInput = this.querySelector('#color-name');
    this.hueInput = this.querySelector('#hue-value');
    this.hueSlider = this.querySelector('#hue-slider');
    this.saturationInput = this.querySelector('#saturation-value');
    this.saturationSlider = this.querySelector('#saturation-slider');
    this.colorPreview = this.querySelector('#color-preview');
    this.colorStepsPreview = this.querySelector('#color-steps-container');
  }
  update(change, newState, oldState) {
    console.log('ColorForm update triggered by store change:', change);
    if (change.colorSpace) {
      this.updateColorSpace();
      this.previewColor.colorSpace = this.colorSpace;

      store.setState({ previewColor: this.previewColor });
    }
    if (change.previewColor) {
      // this.previewColor = newState.previewColor;
      this.updatePreview();
    }

    // this.colorSpaceLightnessSteps = this.colorSpace === 'okhsl' ? lightnessSteps.map((l) => l / 100) : lightnessSteps;

    // // this.saturationInput.value = this.colorSpace === 'okhsl' ? this.saturationInput.value / 100 : this.saturationInput.value;
    // this.updateHueSlider();
    //this.styleSaturationSlider();
    // this.updateColorPreview();
  }
  updatePreview() {
    this.updateHueSlider();
    this.updateSaturationSlider();
    this.updateColorPreview();
  }
  updateColorSpace() {
    this.colorSpace = store.getState().colorSpace;
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };
  }

  updateHueSlider() {
    const previewColor = new Color(this.colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    console.log('Updating hue slider with preview color:', previewColor.toString({ format: 'hex' }));
    console.log('Hue color for slider gradient:', previewColor.h, previewColor.s, previewColor.l);
    const gradientValues = [];

    for (let i = 0; i < 21; i++) {
      previewColor.h = (18 * i) % 360;
      gradientValues.push(previewColor.toString({ format: 'hex' }));
    }
    // console.log('Hue slider gradient values:', gradientValues);
    // // this.hueSlider.style.setProperty('--cc-slider--thumb--size--sm', 'var(--cc-slider--thumb--size--md)');

    this.hueSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }
  // styleSaturationSlider() {
  //   const { colorSpace } = store.getState();
  //   const defaultLightness = colorSpace === 'okhsl' ? lightnessSteps[5] / 100 : lightnessSteps[5];
  //   const saturationColor = new Color(colorSpace, [this.hueInput.value || 0, 0, defaultLightness]);
  //   const gradientValues = [];

  //   for (let i = 0; i <= 100; i += 10) {
  //     saturationColor.s = i / 100;
  //     gradientValues.push(saturationColor.toString({ format: 'hex' }));
  //   }
  //   this.saturationSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  // }
  updateSaturationSlider() {
    console.log('Updating saturation slider with preview color:', this.colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    const previewColor = new Color(this.colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    const gradientValues = [];

    for (let i = 0; i <= 100; i += 10) {
      previewColor.s = this.colorSpace === 'okhsl' ? i / 100 : i;
      gradientValues.push(previewColor.toString({ format: 'hex' }));
    }
    // this.saturationSlider.style.setProperty('--cc-slider--thumb--size--sm', 'var(--cc-slider--thumb--size--md)');
    // this.saturationSlider.style.setProperty('border-radius', `var(--cc-border--radius)`);
    this.saturationSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }
  // styleHueSlider() {
  //   const { colorSpace } = store.getState();
  //   const defaultLightness = lightnessSteps[5]; // Use the default lightness for the hue slider gradient
  //   const hueColor = new Color(colorSpace, [0, 0.5, defaultLightness]);

  //   const gradientValues = [];

  //   for (let i = 0; i < 21; i++) {
  //     hueColor.h = 18 * i;
  //     gradientValues.push(hueColor.toString({ format: 'hex' }));
  //   }
  //   console.log('Hue slider gradient values:', gradientValues);
  //   // this.hueSlider.style.setProperty('--cc-slider--thumb--size--sm', 'var(--cc-slider--thumb--size--md)');

  //   this.hueSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  // }

  getSaturation() {
    return {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };
  }
  updateColorPreview() {
    const previewColor = new Color(this.colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    this.colorPreview.style.backgroundColor = `${previewColor.toString({ format: 'hex' })}`;
    const saturation = this.colorSpace === 'okhsl' ? this.saturationInput.value / 100 : this.saturationInput.value;
    let stepsContainer = '';
    lightnessSteps.forEach((lightness, i) => {
      const stepColor = new Color(this.colorSpace, [this.hueInput.value || 0, saturation || 0, lightness]);
      const hueCategory = this.getColorCategory(this.hueInput.value);
      stepColor.l = this.colorSpace === 'okhsl' ? lightness / 100 : lightness;
      stepsContainer += `<div class="color-step-preview" style="background-color: ${stepColor.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">${i === 0 ? hueCategory : ''}</div>`;
    });
    //this.colorStepsPreview.innerHTML = stepsContainer;
    const vortexHues = this.calculateVortexHues(this.hueInput.value || 0);

    Object.entries(vortexHues).forEach(([vortexNum, hue]) => {
      lightnessSteps.forEach((lightness, i) => {
        const vortexColor = new Color(this.colorSpace, [hue.hue, saturation || 0, lightness]);
        vortexColor.l = this.colorSpace === 'okhsl' ? lightness / 100 : lightness;
        stepsContainer += `<div class="color-step-preview" style="background-color: ${vortexColor.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">${i === 0 ? hue.category : ''}</div>`;
      });
    });
    this.colorStepsPreview.innerHTML = stepsContainer;
    console.log('Updated color preview with hue:', this.hueInput.value, 'saturation:', this.saturationInput.value);
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
      // console.log({ colorName, hue, saturation });
    });
    this.addEventListener('input', this);
    this.addEventListener('keydown', this);
    // console.log('Added input event listener to ColorForm', this);
  }

  handleEvent(e) {
    if (e.type === 'input') {
      // console.log('Input event detected:', e, e.target.value);
      if (e.target.name === 'hue-slider') {
        this.hueInput.value = e.target.value;
        this.changeHue(e);
      } else if (e.target.name === 'saturation-slider') {
        this.saturationInput.value = e.target.value;
        this.changeSaturation(e);
      }
    }
    if (e.type === 'keydown') {
      if (e.target.name === 'hue-value' || e.target.name === 'saturation-value') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const newValue = parseFloat(e.target.value);
          if (e.target.name === 'hue-value') {
            this.hueInput.value = newValue.toFixed(2);
            this.hueSlider.value = newValue;
            this.changeHue(e);
          } else if (e.target.name === 'saturation-value') {
            this.saturationInput.value = newValue.toFixed(2);
            this.saturationSlider.value = newValue;
            this.changeSaturation(e);
          }
        }
        console.log('Keydown event detected:', e, e.target.value);
        if (e.key === 'Backspace' || e.key === 'Delete') {
          return; // Allow normal behavior for deleting input
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const step = e.target.name === 'hue-value' ? 1 : 1; // Increment by 1 for hue and saturation
          let newValue = parseFloat(e.target.value) + (e.key === 'ArrowUp' ? step : -step);
          if (e.target.name === 'hue-value') {
            newValue = Math.min(Math.max(newValue, 0), 360);
            this.hueInput.value = newValue.toFixed(2);
            this.hueSlider.value = newValue;
            this.changeHue(e);
          } else {
            newValue = Math.min(Math.max(newValue, 0), 100);
            this.saturationInput.value = newValue.toFixed(2);
            this.saturationSlider.value = newValue;
            this.changeSaturation(e);
          }
        }
      }
    }
  }

  changeHue(e) {
    console.log('Hue changed:', e.target.value);
    this.previewColor.hue = parseFloat(e.target.value);
    this.updateColorPreview();
    this.updateSaturationSlider();
  }

  changeSaturation(e) {
    console.log('Saturation changed:', e.target.value);
    this.previewColor.saturation = parseFloat(e.target.value);
    this.updateColorPreview();
  }

  disconnectedCallback() {
    this.removeEventListener('input', this);
    this.removeEventListener('keydown', this);
    this.unsubscribe?.();
  }

  render() {
    console.log('Rendering ColorForm');

    const { colorSpace } = store.getState();
    const saturationMin = 0;
    const saturationMax = 100;
    const saturationStep = 0.01;
    const defaultSaturation = 50;
    const defaultLightness = lightnessSteps[5];
    //const defaultColor = new Color(`"color(--${colorSpace} ${this.previewColor.hue} ${this.previewColor.saturation}% ${this.previewColor.lightness}%)"`);
    console.log('Rendering with previewColor:', this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness);
    const defaultColor = new Color(colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    // const defaultColor = new Color(colorSpace, [180, defaultSaturation, defaultLightness]);
    this.innerHTML = `
      <div class="corn-row corn-margin-bottom">
        <div class="corn-col-lg-8 corn-col-12">
          <form class="corn-form">
            <div class="corn-form--item">
              <div class="corn-text-input">
                <input id="color-name" name="color-name" placeholder="Color Name..." />
                <label for="color-name">Enter Color Name</label>
              </div>
            </div>
            <div class="corn-row">
              <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                <div class="corn-form--item">
                  <div class="corn-text-input corn-text-input--sm">
                    <input id="hue-value" name="hue-value" placeholder="Hue" value="180.00" />
                    <label for="hue-value" class="corn-assistive-text">Hue Value</label>
                  </div>
                </div>
              </div>
              <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                <div class="corn-slider corn-slider--sm">
                  <label for="hue-slider">Hue:</label>
                  <input type="range" min="0" max="360" step="0.01" value="180.00" id="hue-slider" name="hue-slider"/>
                </div>
              </div>
            </div>
            <div class="corn-row">
              <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                <div class="corn-form--item">
                  <div class="corn-text-input corn-text-input--sm">
                    <input id="saturation-value" name="saturation-value" placeholder="Saturation" value="${defaultSaturation}" />
                    <label for="saturation-value" class="corn-assistive-text">Saturation Value</label>
                  </div>
                </div>
              </div>
              <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                <div class="corn-slider corn-slider--sm">
                  <label for="saturation-slider">Saturation:</label>
                  <input type="range" min="${saturationMin}" max="${saturationMax}" step="${saturationStep}" value="${defaultSaturation}" id="saturation-slider" name="saturation-slider"/>
                </div>
              </div>
            </div>
            <div class="corn-button-group">
              <button type="submit" class="corn-button corn-button--sm">Add Color</button>
            </div> 
          </form>
        </div>
        <div class="corn-col-lg-4 corn-col-12">
          <div class="corn-panel">
            <h3>Color Preview</h3>
            <div id="color-preview"class="corn-color-preview corn-margin-bottom" style="background-color: ${defaultColor.toString({ format: 'hex' })}; height: 100px; border-radius: var(--cc-border--radius);"></div>
          </div>
        </div>
        <div class="corn-col-12">
          Lightness Steps Preview:
          <div id="color-steps-container" class="color-steps-container"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('color-form', ColorForm);
