import { store } from '../store.js';
import { ColorModel } from '../models/ColorModel.js';
import { ColorSteps } from '../models/ColorSteps.js';
import { ColorPalette } from '../models/ColorPalette.js';
import Color from 'colorjs.io';

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
const categoryRanges = {
  Red: [350, 35],
  Orange: [35, 90],
  Yellow: [90, 115],
  Green: [115, 170],
  Blue: [170, 270],
  Purple: [270, 350],
};
class ColorForm extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
  }
  circularRangePercentage(start, end, value, maxVal = 360) {
    const rangeLength = (end - start + maxVal) % maxVal;
    const distance = (value - start + maxVal) % maxVal;
    let percentage = (distance / rangeLength) * 100;
    return Math.max(0, Math.min(100, percentage)); // clamp 0-100
  }
  valueAtPercentage(start, end, percentage, maxVal = 360, isWrapping = false) {
    const pct = Math.max(0, Math.min(100, percentage)) / 100; // normalize 0-1

    if (!isWrapping) {
      // Simple linear range (like Green [115, 170])
      return start + pct * (end - start);
    } else {
      // Wrapping range (like Red [350, 35])
      const rangeLength = (end - start + maxVal) % maxVal;
      const distance = pct * rangeLength;
      return (start + distance) % maxVal;
    }
  }
  calculateVortexHues(startHue) {
    const vortexOrder = [1, 2, 4, 8, 7, 5];
    const offsets = { 1: 0, 2: 40, 4: 120, 8: 280, 7: 240, 5: 160 };

    const originalHues = {};
    for (const num of vortexOrder) {
      originalHues[num] = (startHue + offsets[num]) % 360;
    }

    const startCategory = this.getColorCategory(startHue);
    // console.log('Start hue:', startHue, 'Category:', startCategory);
    const startOffset = this.circularRangePercentage(categoryRanges[startCategory][0], categoryRanges[startCategory][1], startHue);

    const categoryCenters2 = {
      Red: 15,
      Orange: 65,
      Yellow: 90,
      Green: 138,
      Blue: 220,
      Purple: 320,
    };

    const categoryCenters = {
      Red: this.valueAtPercentage(categoryRanges['Red'][0], categoryRanges['Red'][1], startOffset, 360, true).toFixed(2),
      Orange: this.valueAtPercentage(categoryRanges['Orange'][0], categoryRanges['Orange'][1], startOffset, 360, false).toFixed(2),
      Yellow: this.valueAtPercentage(categoryRanges['Yellow'][0], categoryRanges['Yellow'][1], startOffset, 360, false).toFixed(2),
      Green: this.valueAtPercentage(categoryRanges['Green'][0], categoryRanges['Green'][1], startOffset, 360, false).toFixed(2),
      Blue: this.valueAtPercentage(categoryRanges['Blue'][0], categoryRanges['Blue'][1], startOffset, 360, false).toFixed(2),
      Purple: this.valueAtPercentage(categoryRanges['Purple'][0], categoryRanges['Purple'][1], startOffset, 360, false).toFixed(2),
    };

    // console.log('Category centers based on percentage offset:', categoryCenters2);
    const availableCats = Object.keys(categoryCenters).filter((cat) => cat !== startCategory);

    const sortedVortex = vortexOrder
      .slice()
      .sort((a, b) => {
        const distA = Math.min(Math.abs(originalHues[a] - startHue), 360 - Math.abs(originalHues[a] - startHue));
        const distB = Math.min(Math.abs(originalHues[b] - startHue), 360 - Math.abs(originalHues[b] - startHue));
        return distB - distA;
      })
      .slice(0, 5);

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

    return vortexOrder.filter((num) => assigned[num]).map((num) => assigned[num]);
  }

  getColorCategory(hue) {
    hue = ((hue % 360) + 360) % 360;

    if (hue >= 350 || hue < 35) return 'Red';
    if (hue >= 35 && hue < 90) return 'Orange';
    if (hue >= 90 && hue < 115) return 'Yellow';
    if (hue >= 115 && hue < 170) return 'Green';
    if (hue >= 170 && hue < 270) return 'Blue';

    return 'Purple';
  }

  connectedCallback() {
    this.initialize();
    this.render();

    this.unsubscribe = store.subscribeTo(['colorSpace', 'previewColor'], (changes, newState) => this.update(changes, newState), { batch: true });
    this.cacheElements();
    this.addEventListeners();
    this.updatePreview();
  }

  initialize() {
    this.colorSpace = store.getState().colorSpace;
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };

    this.previewColor = store.getState().previewColor || null;
    this.workingPalette = new ColorPalette('Working Palette', this.colorSpace, []);
    // console.log('Initialized working palette:', this.workingPalette);
    if (!this.previewColor) {
      const defaultPreviewColor = new ColorModel({
        colorSpace: this.colorSpace,
        hue: 180,
        saturation: this.getSaturation().default,
        lightness: lightnessSteps[5],
      });
      store.setState({ previewColor: defaultPreviewColor });
      this.previewColor = defaultPreviewColor;
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

  update(changes, newState) {
    console.log('ZZZZZZZZ ColorForm update called with changes:', changes);
    // console.log('Current preview color in state: ------->', this.previewColor);
    if (changes.colorSpace) {
      this.updateColorSpace();
      console.log('preview color', this.previewColor);
      if (this.previewColor && !changes.previewColor) {
        console.log('XXXXXXX ------>', this.previewColor);
        this.previewColor.colorSpace = newState.colorSpace;
        queueMicrotask(() => store.setState({ previewColor: this.previewColor }));
      }
      // return;
    }

    if (changes.previewColor && newState.previewColor) {
      this.previewColor = newState.previewColor;
      console.log('YYYYYYY Updated preview color from state change:', this.previewColor.toJSON());
      this.updatePreview();
    }
  }

  updatePreview() {
    if (!this.previewColor || !this.hueSlider || !this.saturationSlider || !this.colorPreview || !this.colorStepsPreview) {
      return;
    }

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
    const _previewColor = this.previewColor.getColor();
    const gradientValues = [];
    console.log('Updating hue slider with preview color:', this.previewColor.toJSON());
    for (let i = 0; i < 21; i++) {
      _previewColor.h = (18 * i) % 360;
      gradientValues.push(_previewColor.toString({ format: 'hex' }));
    }
    if (this.hueSlider.value !== this.previewColor.hue.toFixed(2)) {
      this.hueSlider.value = this.previewColor.hue.toFixed(2);
      this.hueInput.value = this.previewColor.hue.toFixed(2);
    }
    this.hueSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  updateSaturationSlider() {
    const _previewColor = this.previewColor.getColor();
    const gradientValues = [];
    console.log('Updating saturation slider with preview color:', this.previewColor.toJSON());
    for (let i = 0; i <= 100; i += 10) {
      _previewColor.s = this.previewColor.colorSpace === 'okhsl' ? i / 100 : i;
      gradientValues.push(_previewColor.toString({ format: 'hex' }));
    }

    if (this.saturationSlider.value !== this.previewColor.saturation.toFixed(2)) {
      this.saturationSlider.value = this.previewColor.saturation.toFixed(2);
      this.saturationInput.value = this.previewColor.saturation.toFixed(2);
    }
    this.saturationSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  getSaturation() {
    return {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };
  }
  //[321.03, 0.7399, 0.475] a040b2
  // [336.61, 0.7374, 0.475]
  normalizeValue(colorSpace, value) {
    if (colorSpace === 'okhsl') {
      return value <= 1 ? +(value * 100).toFixed(4) : value;
    } else {
      return value;
    }
  }

  updateColorPreview() {
    const previewColor = this.previewColor.getColor();

    this.colorPreview.style.backgroundColor = `${previewColor.toString({ format: 'hex' })}`;
    this.colorPreview.innerText = previewColor.toString({ format: 'hex' });

    // const saturation = this.normalizeValue(this.previewColor.colorSpace, this.saturationInput.value);
    let stepsContainer = '';
    const hueCategory = this.getColorCategory(this.hueInput.value);
    let colorSteps = new ColorSteps(hueCategory, this.previewColor.colorSpace, []);
    lightnessSteps.forEach((lightness, i) => {
      const colorModel = new ColorModel({
        colorSpace: this.previewColor.colorSpace,
        hue: this.hueInput.value || 0,
        saturation: this.saturationInput.value || 0,
        lightness: lightness,
      });
      colorSteps.colors.push(colorModel);
    });
    this.workingPalette.steps = [];
    this.workingPalette.steps.push(colorSteps);
    const vortexHues = this.calculateVortexHues(this.hueInput.value || 0);

    vortexHues.forEach((hue) => {
      let colorSteps = new ColorSteps(hue.category, this.previewColor.colorSpace, []);
      lightnessSteps.forEach((lightness, i) => {
        const colorModel = new ColorModel({
          colorSpace: this.previewColor.colorSpace,
          hue: hue.hue,
          saturation: this.saturationInput.value || 0,
          lightness: lightness,
        });
        colorSteps.colors.push(colorModel);
      });
      this.workingPalette.steps.push(colorSteps);
    });
    this.workingPalette.steps.sort((a, b) => {
      const categoryOrder = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];
      return categoryOrder.indexOf(a.colorName) - categoryOrder.indexOf(b.colorName);
    });
    this.workingPalette.steps.forEach((step) => {
      step.colors.forEach((color, i) => {
        const colorPreview = color.getColor();
        stepsContainer += `<div class="color-step-preview" style="background-color: ${colorPreview.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">${i === 0 ? step.colorName : ''}</div>`;
      });
    });
    this.colorStepsPreview.innerHTML = stepsContainer;
  }

  addEventListeners() {
    const form = this.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    this.addEventListener('input', this);
    this.addEventListener('keydown', this);
    this.addEventListener('change', this);
  }

  handleEvent(e) {
    if (e.type === 'change') {
      if (e.target.name === 'palette-name') {
        store.setState({ paletteName: e.target.value });
      }
    }
    if (e.type === 'input') {
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

        if (e.key === 'Backspace' || e.key === 'Delete') {
          return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const step = 1;
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

  commitPreviewColor(patch) {
    if (!this.previewColor) return;

    const nextPreviewColor = new ColorModel({
      ...this.previewColor,
      ...patch,
    });

    store.setState({ previewColor: nextPreviewColor });
  }

  changeHue(e) {
    this.commitPreviewColor({ hue: parseFloat(e.target.value) });
  }

  changeSaturation(e) {
    this.commitPreviewColor({ saturation: parseFloat(e.target.value) });
  }

  disconnectedCallback() {
    this.removeEventListener('input', this);
    this.removeEventListener('keydown', this);
    this.unsubscribe?.();
  }

  render() {
    const { colorSpace } = store.getState();
    const saturationMin = 0;
    const saturationMax = 100;
    const saturationStep = 0.01;
    const defaultSaturation = 50;
    const defaultColor = this.previewColor.getColor();

    this.innerHTML = `
      <div class="corn-row corn-margin-bottom">
        <div class="corn-col-lg-8 corn-col-12">
          <form class="corn-form">
            <div class="corn-form--item">
              <div class="corn-text-input">
                <input id="palette-name" name="palette-name" placeholder="Palette Name..." value="${store.getState().paletteName}" />
                <label for="palette-name">Enter Palette Name</label>
              </div>
            </div>
            <div class="corn-row">
              <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                <div class="corn-form--item">
                  <div class="corn-text-input corn-text-input--sm">
                    <input id="hue-value" name="hue-value" placeholder="Hue" value="${this.previewColor.hue.toFixed(2)}" />
                    <label for="hue-value" class="corn-assistive-text">Hue Value</label>
                  </div>
                </div>
              </div>
              <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                <div class="corn-slider corn-slider--sm">
                  <label for="hue-slider">Hue:</label>
                  <input type="range" min="0" max="360" step="0.01" value="${this.previewColor.hue.toFixed(2)}" id="hue-slider" name="hue-slider"/>
                </div>
              </div>
            </div>
            <div class="corn-row">
              <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                <div class="corn-form--item">
                  <div class="corn-text-input corn-text-input--sm">
                    <input id="saturation-value" name="saturation-value" placeholder="Saturation" value="${this.previewColor.colorSpace === 'hsluv' ? this.previewColor.saturation.toFixed(2) : (this.previewColor.saturation * 100).toFixed(2)}" />
                    <label for="saturation-value" class="corn-assistive-text">Saturation Value</label>
                  </div>
                </div>
              </div>
              <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                <div class="corn-slider corn-slider--sm">
                  <label for="saturation-slider">Saturation:</label>
                  <input type="range" min="${saturationMin}" max="${saturationMax}" step="${saturationStep}" value="${this.previewColor.colorSpace === 'hsluv' ? this.previewColor.saturation.toFixed(2) : (this.previewColor.saturation * 100).toFixed(2)}" id="saturation-slider" name="saturation-slider"/>
                </div>
              </div>
            </div>
            <div class="corn-button-group">
              <button type="submit" class="corn-button corn-button--sm">Save Palette</button>
            </div>
          </form>
        </div>
        <div class="corn-col-lg-4 corn-col-12">
          <div class="corn-panel">
            <h3>Color Preview</h3>
            <div id="color-preview" class="corn-color-preview corn-margin-bottom" style="background-color: ${defaultColor.toString({ format: 'hex' })}; height: 100px; border-radius: var(--cc-border--radius);"></div>
          </div>
        </div>
        <div class="corn-col-12">
          Pallette Preview:
          <div id="color-steps-container" class="color-steps-container"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('color-form', ColorForm);
