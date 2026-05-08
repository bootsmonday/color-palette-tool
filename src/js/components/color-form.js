import { store } from '../store.js';
import { ColorModel } from '../models/ColorModel.js';
import Color from 'colorjs.io';

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];

class ColorForm extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
  }

  calculateVortexHues(startHue) {
    const vortexOrder = [1, 2, 4, 8, 7, 5];
    const offsets = { 1: 0, 2: 40, 4: 120, 8: 280, 7: 240, 5: 160 };

    const originalHues = {};
    for (const num of vortexOrder) {
      originalHues[num] = (startHue + offsets[num]) % 360;
    }

    const startCategory = this.getColorCategory(startHue);

    const categoryCenters = {
      Red: 15,
      Orange: 65,
      Yellow: 90,
      Green: 138,
      Blue: 220,
      Purple: 320,
    };

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
    if (changes.colorSpace) {
      this.updateColorSpace();

      if (this.previewColor) {
        const updatedPreviewColor = new ColorModel({
          ...this.previewColor,
          colorSpace: this.colorSpace,
        });

        // Defer setState to avoid re-entrant notifications while listeners are running.
        queueMicrotask(() => store.setState({ previewColor: updatedPreviewColor }));
      }
      return;
    }

    if (changes.previewColor && newState.previewColor) {
      this.previewColor = newState.previewColor;
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
    const previewColor = new Color(this.previewColor.colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    const gradientValues = [];

    for (let i = 0; i < 21; i++) {
      previewColor.h = (18 * i) % 360;
      gradientValues.push(previewColor.toString({ format: 'hex' }));
    }

    this.hueSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  updateSaturationSlider() {
    const previewColor = new Color(this.previewColor.colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    const gradientValues = [];

    for (let i = 0; i <= 100; i += 10) {
      previewColor.s = this.previewColor.colorSpace === 'okhsl' ? i / 100 : i;
      gradientValues.push(previewColor.toString({ format: 'hex' }));
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
    const previewColor = new Color(this.previewColor.colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);
    this.colorPreview.style.backgroundColor = `${previewColor.toString({ format: 'hex' })}`;

    const saturation = this.previewColor.colorSpace === 'okhsl' ? this.saturationInput.value / 100 : this.saturationInput.value;
    let stepsContainer = '';

    lightnessSteps.forEach((lightness, i) => {
      const stepColor = new Color(this.previewColor.colorSpace, [this.hueInput.value || 0, saturation || 0, lightness]);
      const hueCategory = this.getColorCategory(this.hueInput.value);
      stepColor.l = this.previewColor.colorSpace === 'okhsl' ? lightness / 100 : lightness;
      stepsContainer += `<div class="color-step-preview" style="background-color: ${stepColor.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">${i === 0 ? hueCategory : ''}</div>`;
    });

    const vortexHues = this.calculateVortexHues(this.hueInput.value || 0);

    vortexHues.forEach((hue) => {
      lightnessSteps.forEach((lightness, i) => {
        const vortexColor = new Color(this.previewColor.colorSpace, [hue.hue, saturation || 0, lightness]);
        vortexColor.l = this.previewColor.colorSpace === 'okhsl' ? lightness / 100 : lightness;
        stepsContainer += `<div class="color-step-preview" style="background-color: ${vortexColor.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">${i === 0 ? hue.category : ''}</div>`;
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
  }

  handleEvent(e) {
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
    const defaultColor = new Color(colorSpace, [this.previewColor.hue, this.previewColor.saturation, this.previewColor.lightness]);

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
              <button type="submit" class="corn-button corn-button--sm">Add Color</button>
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
          Lightness Steps Preview:
          <div id="color-steps-container" class="color-steps-container"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('color-form', ColorForm);
