import { store } from '../store.js';
import Color from 'colorjs.io';
import { ColorModel } from '../models/ColorModel.js';
import { ColorSteps } from '../models/ColorSteps.js';
import { ColorPalette } from '../models/ColorPalette.js';

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
const categoryOrder = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Gray'];
const vortextOrder = [1, 2, 4, 8, 7, 5];
const vortextOffsets = { 1: 0, 2: 40, 4: 120, 8: 280, 7: 240, 5: 160 };

const categoryRangesHSLUV = {
  Red: [345, 15],
  Orange: [15, 60],
  Yellow: [60, 90],
  Green: [90, 165],
  Blue: [165, 255],
  Purple: [255, 345],
};
const categoryRangesOKHSL = {
  Red: [345, 15],
  Orange: [15, 50],
  Yellow: [50, 95],
  Green: [95, 170],
  Blue: [170, 273],
  Purple: [273, 345],
};

// const categoryRangesOKHSL = {
//   Red: [355, 45],
//   Orange: [45, 85],
//   Yellow: [85, 115],
//   Green: [115, 185],
//   Blue: [185, 285],
//   Purple: [285, 355],
// };

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
  console.log('Getting color category for hue:', hue, 'in color space:', store.getState().colorSpace);
  const ranges = store.getState().colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;

  const normalizedHue = ((hue % 360) + 360) % 360;
  console.log('Normalized hue:', normalizedHue, ranges.Red[0], ranges.Red[1]);
  if (normalizedHue >= ranges.Red[0] || normalizedHue < ranges.Red[1]) return 'Red';
  if (normalizedHue >= ranges.Orange[0] && normalizedHue < ranges.Orange[1]) return 'Orange';
  if (normalizedHue >= ranges.Yellow[0] && normalizedHue < ranges.Yellow[1]) return 'Yellow';
  if (normalizedHue >= ranges.Green[0] && normalizedHue < ranges.Green[1]) return 'Green';
  if (normalizedHue >= ranges.Blue[0] && normalizedHue < ranges.Blue[1]) return 'Blue';

  return 'Purple';
}

function buildCategoryCenters(startOffset) {
  const ranges = store.getState().colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;

  return {
    Red: valueAtPercentage(ranges.Red[0], ranges.Red[1], startOffset, 360, true).toFixed(2),
    Orange: valueAtPercentage(ranges.Orange[0], ranges.Orange[1], startOffset, 360, false).toFixed(2),
    Yellow: valueAtPercentage(ranges.Yellow[0], ranges.Yellow[1], startOffset, 360, false).toFixed(2),
    Green: valueAtPercentage(ranges.Green[0], ranges.Green[1], startOffset, 360, false).toFixed(2),
    Blue: valueAtPercentage(ranges.Blue[0], ranges.Blue[1], startOffset, 360, false).toFixed(2),
    Purple: valueAtPercentage(ranges.Purple[0], ranges.Purple[1], startOffset, 360, false).toFixed(2),
  };
}

function calculateVortexHues(startHue) {
  // const originalHues = {};
  // for (const num of vortextOrder) {
  //   originalHues[num] = (startHue + vortextOffsets[num]) % 360;
  // }

  const startCategory = getColorCategory(startHue);
  const ranges = store.getState().colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;
  const [startRangeMin, startRangeMax] = ranges[startCategory];
  const startOffset = circularRangePercentage(startRangeMin, startRangeMax, startHue);
  const categoryCenters = buildCategoryCenters(startOffset);
  const availableCats = Object.keys(categoryCenters).filter((cat) => cat !== startCategory);

  const sortedVortex = vortextOrder
    .slice()
    // .sort((a, b) => {
    //   const distA = Math.min(Math.abs(originalHues[a] - startHue), 360 - Math.abs(originalHues[a] - startHue));
    //   const distB = Math.min(Math.abs(originalHues[b] - startHue), 360 - Math.abs(originalHues[b] - startHue));
    //   return distB - distA;
    // })
    .slice(0, 5);

  const assigned = {};
  availableCats.forEach((cat, i) => {
    const vortexNum = sortedVortex[i];
    const hue = categoryCenters[cat];
    console.log(`Assigning vortex ${vortexNum} to category ${cat} with hue ${hue}`);
    assigned[vortexNum] = {
      vortex: vortexNum,
      hue: Math.round(hue * 100) / 100,
      category: cat,
      // originalHue: Math.round(originalHues[vortexNum] * 100) / 100,
    };
  });

  return vortextOrder.filter((num) => assigned[num]).map((num) => assigned[num]);
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
      let lightText = step.colors[0].getColor();
      let darkText = step.colors[9].getColor();
      let j = (i + 1) * 10;
      const colorPreview = color.getColor();
      if (i === 0) {
        let stepColor;
        if (step.colorName === 'Yellow') {
          stepColor = step.colors[2].getColor();
        } else {
          stepColor = step.colors[4].getColor();
        }

        //stepsHtml += `<button class="corn-button" style="background-color: ${stepColor.toString({ format: 'hex' })}; color: var(--cc-gray-100);">${i === 0 ? step.colorName : ''}</button>`;
        stepsHtml += `<div class="color-step-preview" style="box-shadow:inset 0 0 0 2px ${stepColor.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">
        <label for="lock-${step.colorName}">${i === 0 ? step.colorName : ''}</label>
          <input type="checkbox" name="color-lock" id="lock-${step.colorName}" class="corn-assistive-text" />
          <svg class="lock-icon" width="16" height="16" fill="currentColor">
            <use href="/node_modules/bootstrap-icons/bootstrap-icons.svg#lock"/>
          </svg>          
        </div>`;
      }

      if (i < 5) {
        //wcag ${colorPreview.contrast(darkText, 'WCAG21').toFixed(2)}
        stepsHtml += `<div style="background-color: ${colorPreview.toString({ format: 'hex' })}; color: ${darkText.toString({ format: 'hex' })};">
        
        ${j}
        </div>`;
      } else {
        //wcag ${colorPreview.contrast(lightText, 'WCAG21').toFixed(2)}
        stepsHtml += `<div style="background-color: ${colorPreview.toString({ format: 'hex' })}; color: ${lightText.toString({ format: 'hex' })};">
        
        ${j}
        </div>`;
      }
      // stepsHtml += `<div class="color-step-preview" style="background-color: ${colorPreview.toString({ format: 'hex' })}; height: 50px; border-radius: var(--cc-border--radius);">${j}</div>`;
    });
  });
  let contrastSteps = steps.find((step) => step.colorName === 'Gray');
  let darkText = contrastSteps.colors[9].getColor();
  let lightText = contrastSteps.colors[0].getColor();
  contrastSteps.colors.forEach((color, i) => {
    let colorPreview = color.getColor();
    if (i === 0) {
      stepsHtml += `<div style="box-shadow: inset 0 0 0 2px ${darkText.toString({ format: 'hex' })}; color: ${darkText.toString({ format: 'hex' })};"> WCAG2.1 </div>`;
    }
    if (i < 5) {
      //wcag ${colorPreview.contrast(darkText, 'WCAG21').toFixed(2)}
      stepsHtml += `<div style="background-color: ${colorPreview.toString({ format: 'hex' })}; color: ${darkText.toString({ format: 'hex' })};">
        ${colorPreview.contrast(darkText, 'WCAG21').toFixed(2)}
        </div>`;
    } else {
      //wcag ${colorPreview.contrast(lightText, 'WCAG21').toFixed(2)}
      stepsHtml += `<div style="background-color: ${colorPreview.toString({ format: 'hex' })}; color: ${lightText.toString({ format: 'hex' })};">
        ${colorPreview.contrast(lightText, 'WCAG21').toFixed(2)}
        </div>`;
    }
  });
  console.log(
    'gray',
    steps.find((step) => step.colorName === 'Gray')
  );
  return stepsHtml;
}

class EditColorForm extends HTMLElement {
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
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'type' && oldValue !== newValue) {
      this.render();
      this.cacheElements();
      this.updatePreview();
    }
  }
  initialize() {
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };
    this.colorSpace = store.getState().colorSpace;
    this.previewColor = store.getState().previewColor || null;

    this.workingPalette = store.getState().workingPalette;

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
    this.paletteName = this.querySelector('#palette-name');
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
  }

  updatePreview() {
    if (!this.previewColor || !this.hueSlider || !this.saturationSlider || !this.colorStepsPreview) {
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

    // this.colorPreview.style.backgroundColor = `${previewColor.toString({ format: 'hex' })}`;

    // this.colorPreview.innerText = this.getColorCategory(this.previewColor.hue);

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

    this.workingPalette.steps.push(buildColorSteps('Gray', this.previewColor.colorSpace, currentHue, 11));

    this.workingPalette.steps.sort((a, b) => {
      return categoryOrder.indexOf(a.colorName) - categoryOrder.indexOf(b.colorName);
    });

    this.colorStepsPreview.innerHTML = renderPaletteStepsHtml(this.workingPalette.steps);
  }

  addEventListeners() {
    const form = this.querySelector('form');
    this.addEventListener('submit', this);
    this.addEventListener('input', this);
    this.addEventListener('keydown', this);
    this.addEventListener('change', this);
  }

  handleEvent(e) {
    if (e.type === 'submit') {
      console.log('Form submitted');
      const paletteCollection = store.getState().paletteCollection;
      store.setState({ paletteCollection: [] });
      // return;
      console.log('Current palette collection:', paletteCollection);
      let newPalette = true;
      for (const palette of paletteCollection) {
        if (palette.id === this.workingPalette.id) {
          this.workingPalette.name = this.paletteName.value || 'Untitled Palette';
          this.workingPalette.colorSpace = this.colorSpace;
          paletteCollection.splice(paletteCollection.indexOf(palette), 1, this.workingPalette);
          console.log('Updated existing palette in collection:', palette);
          newPalette = false;
          store.setState({ paletteCollection });
          return;
        }
      }
      if (newPalette) {
        paletteCollection.push(this.workingPalette);
        console.log('Added new palette to collection:', this.workingPalette);
        store.setState({ paletteCollection });
      }
      console.log('Would save to existing collection with ID:', store.getState().colorCollectionId);
      e.preventDefault();
      return;
    }
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
        <div class="corn-col-12">
          <form class="corn-form">
            <div class="corn-row">
              <div class="corn-col-3 corn-form">
                <div class="corn-form--item">
                  <div class="corn-text-input">
                    <input id="palette-name" name="palette-name" placeholder="Palette Name..." value="${store.getState().paletteName}" />
                    <label for="palette-name">Enter Palette Name</label>
                  </div>
                </div>
                <fieldset class="corn-toggle-group corn-toggle--xl color-space-toggle" aria-labelledby="legend1">
                  <legend id="legend1" class="corn-assistive-text">Color Space</legend>
                  <div class="corn-toggles">
                    <div class="corn-toggle">
                      <input type="radio" id="colospace1" name="color-space" value="hsluv" ${colorSpace === 'hsluv' ? 'checked' : ''} />
                      <label for="colospace1">hsluv</label>
                    </div>
                    <div class="corn-toggle">
                      <input type="radio" id="colospace2" name="color-space" value="okhsl" ${colorSpace === 'okhsl' ? 'checked' : ''} />
                      <label for="colospace2">okhsl</label>
                    </div>
                  </div>
                </fieldset>                   
              </div>
              <div class="corn-col-9 corn-form">
                <div class="corn-row">
                  <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                    <div class="corn-form--item">
                      <div class="corn-text-input">
                        <input id="hue-value" name="hue-value" placeholder="Hue" value="${this.previewColor.hue.toFixed(2)}" />
                        <label for="hue-value">Hue Value</label>
                      </div>
                    </div>
                  </div>
                  <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                    <div class="corn-slider ">
                      <label for="hue-slider">Hue:</label>
                      <input type="range" min="0" max="360" step="0.01" value="${this.previewColor.hue.toFixed(2)}" id="hue-slider" name="hue-slider"/>
                    </div>
                  </div>
                </div>
                <div class="corn-row">
                  <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                    <div class="corn-form--item">
                      <div class="corn-text-input">
                        <input id="saturation-value" name="saturation-value" placeholder="Saturation" value="${this.previewColor.saturation.toFixed(2)}" />
                        <label for="saturation-value">Saturation Value</label>
                      </div>
                    </div>
                  </div>
                  <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                    <div class="corn-slider">
                      <label for="saturation-slider">Saturation:</label>
                      <input type="range" min="${saturationMin}" max="${saturationMax}" step="${saturationStep}" value="${this.previewColor.saturation.toFixed(2)}" id="saturation-slider" name="saturation-slider"/>
                    </div>
                  </div>
                </div>                
              </div>

            </div>

            <div class="corn-button-group">
              <button type="submit" class="corn-button corn-button--sm">Save Palette</button>
            </div>
          </form>
        </div>
      </div>
      <div class="corn-row">
        <div class="corn-col-12">
          <h2>Palette</h2>
          <div id="color-steps-container" class="color-steps-container edit-mode"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('edit-color-form', EditColorForm);
