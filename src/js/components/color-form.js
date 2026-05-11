import { store } from '../store.js';
import { ColorModel } from '../models/ColorModel.js';
import { ColorSteps } from '../models/ColorSteps.js';
import { ColorPalette } from '../models/ColorPalette.js';

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
const CATEGORY_ORDER = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];
const VORTEX_ORDER = [1, 2, 4, 8, 7, 5];
const VORTEX_OFFSETS = { 1: 0, 2: 40, 4: 120, 8: 280, 7: 240, 5: 160 };
const categoryRanges = {
  Red: [350, 35],
  Orange: [35, 90],
  Yellow: [90, 115],
  Green: [115, 170],
  Blue: [170, 270],
  Purple: [270, 350],
};

function clampPercentage(value) {
  return Math.max(0, Math.min(100, value));
}

function circularRangePercentage(start, end, value, maxVal = 360) {
  const rangeLength = (end - start + maxVal) % maxVal;
  const distance = (value - start + maxVal) % maxVal;
  return clampPercentage((distance / rangeLength) * 100);
}

function valueAtPercentage(start, end, percentage, maxVal = 360, isWrapping = false) {
  const pct = clampPercentage(percentage) / 100;

  if (!isWrapping) {
    return start + pct * (end - start);
  }

  const rangeLength = (end - start + maxVal) % maxVal;
  const distance = pct * rangeLength;
  return (start + distance) % maxVal;
}

function getColorCategory(hue) {
  const normalizedHue = ((hue % 360) + 360) % 360;

  if (normalizedHue >= 350 || normalizedHue < 40) return 'Red';
  if (normalizedHue >= 40 && normalizedHue < 85) return 'Orange';
  if (normalizedHue >= 85 && normalizedHue < 115) return 'Yellow';
  if (normalizedHue >= 115 && normalizedHue < 170) return 'Green';
  if (normalizedHue >= 170 && normalizedHue < 270) return 'Blue';

  return 'Purple';
}

function buildCategoryCenters(startOffset) {
  return {
    Red: valueAtPercentage(categoryRanges.Red[0], categoryRanges.Red[1], startOffset, 360, true).toFixed(2),
    Orange: valueAtPercentage(categoryRanges.Orange[0], categoryRanges.Orange[1], startOffset, 360, false).toFixed(2),
    Yellow: valueAtPercentage(categoryRanges.Yellow[0], categoryRanges.Yellow[1], startOffset, 360, false).toFixed(2),
    Green: valueAtPercentage(categoryRanges.Green[0], categoryRanges.Green[1], startOffset, 360, false).toFixed(2),
    Blue: valueAtPercentage(categoryRanges.Blue[0], categoryRanges.Blue[1], startOffset, 360, false).toFixed(2),
    Purple: valueAtPercentage(categoryRanges.Purple[0], categoryRanges.Purple[1], startOffset, 360, false).toFixed(2),
  };
}

function calculateVortexHues(startHue) {
  const originalHues = {};
  for (const num of VORTEX_ORDER) {
    originalHues[num] = (startHue + VORTEX_OFFSETS[num]) % 360;
  }

  const startCategory = getColorCategory(startHue);
  const [startRangeMin, startRangeMax] = categoryRanges[startCategory];
  const startOffset = circularRangePercentage(startRangeMin, startRangeMax, startHue);
  const categoryCenters = buildCategoryCenters(startOffset);
  const availableCats = Object.keys(categoryCenters).filter((cat) => cat !== startCategory);

  const sortedVortex = VORTEX_ORDER.slice()
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

  return VORTEX_ORDER.filter((num) => assigned[num]).map((num) => assigned[num]);
}

function createHueGradientValues(previewColorModel) {
  const previewColor = previewColorModel.getColor();
  const gradientValues = [];

  for (let i = 0; i < 21; i++) {
    previewColor.h = (18 * i) % 360;
    gradientValues.push(previewColor.toString({ format: 'hex' }));
  }

  return gradientValues;
}

function createSaturationGradientValues(previewColorModel) {
  const previewColor = previewColorModel.getColor();
  const gradientValues = [];

  for (let i = 0; i <= 100; i += 10) {
    previewColor.s = previewColorModel.colorSpace === 'okhsl' ? i / 100 : i;
    gradientValues.push(previewColor.toString({ format: 'hex' }));
  }

  return gradientValues;
}

function buildColorSteps(colorName, colorSpace, hue, saturation) {
  const colorSteps = new ColorSteps(colorName, colorSpace, []);

  lightnessSteps.forEach((lightness) => {
    colorSteps.colors.push(
      new ColorModel({
        colorSpace,
        hue,
        saturation,
        lightness,
      })
    );
  });

  return colorSteps;
}

function renderPaletteStepsHtml(steps) {
  let stepsHtml = '';

  steps.forEach((step) => {
    step.colors.forEach((color, i) => {
      const colorPreview = color.getColor();
      stepsHtml += `<div class="color-step-preview" style="background-color: ${colorPreview.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">${i === 0 ? step.colorName : ''}</div>`;
    });
  });

  return stepsHtml;
}

class ColorForm extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
  }

  calculateVortexHues(startHue) {
    return calculateVortexHues(startHue);
  }

  getColorCategory(hue) {
    return getColorCategory(hue);
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
    if (changes.previewColor && newState.previewColor) {
      this.previewColor = newState.previewColor;
      this.syncControlsFromPreviewColor(); // keep UI in sync with store
      this.updateHueSlider();
      this.updateSaturationSlider();
      this.updateColorPreview();
    }
    if (changes.colorSpace) {
      this.updateColorSpace();
      if (this.previewColor && !changes.previewColor) {
        const updatedPreviewColor = new ColorModel({
          ...this.previewColor.toJSON(),
          colorSpace: newState.colorSpace,
        });
        queueMicrotask(() => store.setState({ previewColor: updatedPreviewColor }));
      }
      return;
    }

    // if (changes.previewColor && newState.previewColor) {
    //   this.previewColor = newState.previewColor;
    //   this.updatePreview();
    // }
  }

  updatePreview() {
    if (!this.previewColor || !this.hueSlider || !this.saturationSlider || !this.colorPreview || !this.colorStepsPreview) {
      return;
    }

    this.updateHueSlider();
    this.updateSaturationSlider();
    this.updateColorPreview();
  }
  syncControlsFromPreviewColor() {
    if (!this.previewColor) return;

    const hue = this.previewColor.hue.toFixed(2);
    const saturation = this.previewColor.saturation.toFixed(2);

    if (this.hueSlider.value !== hue) this.hueSlider.value = hue;
    if (this.hueInput.value !== hue) this.hueInput.value = hue;

    if (this.saturationSlider.value !== saturation) this.saturationSlider.value = saturation;
    if (this.saturationInput.value !== saturation) this.saturationInput.value = saturation;
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
    const gradientValues = createHueGradientValues(this.previewColor);
    if (this.hueSlider.value !== this.previewColor.hue.toFixed(2)) {
      this.hueSlider.value = this.previewColor.hue.toFixed(2);
      this.hueInput.value = this.previewColor.hue.toFixed(2);
    }
    this.hueSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  updateSaturationSlider() {
    const gradientValues = createSaturationGradientValues(this.previewColor);

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

  updateColorPreview() {
    const previewColor = this.previewColor.getColor();

    this.colorPreview.style.backgroundColor = `${previewColor.toString({ format: 'hex' })}`;
    this.colorPreview.innerText = previewColor.toString({ format: 'hex' });

    const currentHue = Number(this.hueInput.value || 0);
    const currentSaturation = Number(this.saturationInput.value || 0);

    const hueCategory = this.getColorCategory(currentHue);
    const colorSteps = buildColorSteps(hueCategory, this.previewColor.colorSpace, currentHue, currentSaturation);

    this.workingPalette.steps = [];
    this.workingPalette.steps.push(colorSteps);
    const vortexHues = this.calculateVortexHues(currentHue);

    vortexHues.forEach((hue) => {
      this.workingPalette.steps.push(buildColorSteps(hue.category, this.previewColor.colorSpace, hue.hue, currentSaturation));
    });

    this.workingPalette.steps.sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.colorName) - CATEGORY_ORDER.indexOf(b.colorName);
    });

    this.colorStepsPreview.innerHTML = renderPaletteStepsHtml(this.workingPalette.steps);
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
      ...this.previewColor.toJSON(),
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
                    <input id="saturation-value" name="saturation-value" placeholder="Saturation" value="${this.previewColor.saturation.toFixed(2)}" />
                    <label for="saturation-value" class="corn-assistive-text">Saturation Value</label>
                  </div>
                </div>
              </div>
              <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                <div class="corn-slider corn-slider--sm">
                  <label for="saturation-slider">Saturation:</label>
                  <input type="range" min="${saturationMin}" max="${saturationMax}" step="${saturationStep}" value="${this.previewColor.saturation.toFixed(2)}" id="saturation-slider" name="saturation-slider"/>
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
          Palette Preview:
          <div id="color-steps-container" class="color-steps-container"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('color-form', ColorForm);
