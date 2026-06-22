import { store } from '../store.js';
import Color from 'colorjs.io';
import { ColorModel } from '../models/ColorModel.js';
import { ColorSteps } from '../models/ColorSteps.js';
import { ColorPalette } from '../models/ColorPalette.js';

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
const categoryOrder = ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Magenta', 'Gray'];
// const vortextOrder = [1, 2, 4, 8, 7, 5];
// const vortextOffsets = { 1: 0, 2: 40, 4: 120, 8: 280, 7: 240, 5: 160 };

// Red: [355, 20],
// Orange: [20, 55],
// Yellow: [55, 100],
// Green: [100, 155],
// Teal: [155, 190],
// Blue: [190, 245],
// Magenta: [245, 305],
// Purple: [305, 355],

const categoryRangesHSLUV = {
  Red: [355, 20],
  Orange: [20, 75],
  Yellow: [75, 120],
  Green: [120, 160],
  Teal: [160, 190],
  Blue: [190, 255],
  Purple: [255, 305],
  Magenta: [305, 355],
  // Red: [355, 30],
  // Orange: [30, 90],
  // Yellow: [90, 120],
  // Green: [120, 155],
  // Blue: [155, 270],
  // Purple: [270, 355],
};
// Red: [350, 40]
// Orange: [40, 70]
// Yellow: [70, 110]
// Green: [110, 165]
// Teal: [165, 210]
// Blue: [210, 275]
// Magenta: [275, 330]
// Purple: [330, 350]
const categoryRangesOKHSL = {
  Red: [350, 45],
  Orange: [45, 98],
  Yellow: [98, 120],
  Green: [120, 165],
  Teal: [165, 210],
  Blue: [210, 275],
  Purple: [275, 330],
  Magenta: [330, 350],

  // Red: [350, 40],
  // Orange: [40, 100],
  // Yellow: [100, 120],
  // Green: [120, 165],
  // Teal: [165, 210],
  // Blue: [210, 275],
  // Purple: [275, 330],
  // Magenta: [330, 350],

  // Red: [345, 15],
  // Orange: [15, 50],
  // Yellow: [50, 95],
  // Green: [95, 170],
  // Blue: [170, 273],
  // Purple: [273, 345],
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
  // console.log('rangelength', rangeLength, start, end, percentage, maxVal);
  //const distance = pct * rangeLength;
  const distance = rangeLength / 2;
  return (start + distance) % maxVal;
}

function getColorCategory(hue) {
  // console.log('Getting color category for hue:', hue, 'in color space:', store.getState().colorSpace);
  const ranges = store.getState().colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;

  const normalizedHue = ((hue % 360) + 360) % 360;
  // console.log('Normalized hue:', normalizedHue, ranges.Yellow[0], ranges.Yellow[1]);
  if (normalizedHue >= ranges.Red[0] || normalizedHue < ranges.Red[1]) return 'Red';
  if (normalizedHue >= ranges.Orange[0] && normalizedHue < ranges.Orange[1]) return 'Orange';
  if (normalizedHue >= ranges.Yellow[0] && normalizedHue < ranges.Yellow[1]) return 'Yellow';
  if (normalizedHue >= ranges.Green[0] && normalizedHue < ranges.Green[1]) return 'Green';
  if (normalizedHue >= ranges.Teal[0] && normalizedHue < ranges.Teal[1]) return 'Teal';
  if (normalizedHue >= ranges.Blue[0] && normalizedHue < ranges.Blue[1]) return 'Blue';
  if (normalizedHue >= ranges.Magenta[0] && normalizedHue < ranges.Magenta[1]) return 'Magenta';

  return 'Purple';
}

function buildCategoryCenters(startOffset) {
  const ranges = store.getState().colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;

  return {
    Red: valueAtPercentage(ranges.Red[0], ranges.Red[1], startOffset, 360, true).toFixed(2),
    Orange: valueAtPercentage(ranges.Orange[0], ranges.Orange[1], startOffset, 360, false).toFixed(2),
    Yellow: ((ranges.Yellow[0] + ranges.Yellow[1]) / 2).toFixed(2),
    Green: valueAtPercentage(ranges.Green[0], ranges.Green[1], startOffset, 360, false).toFixed(2),
    Teal: valueAtPercentage(ranges.Teal[0], ranges.Teal[1], startOffset, 360, false).toFixed(2),
    Blue: valueAtPercentage(ranges.Blue[0], ranges.Blue[1], startOffset, 360, false).toFixed(2),
    Magenta: valueAtPercentage(ranges.Magenta[0], ranges.Magenta[1], startOffset, 360, false).toFixed(2),
    Purple: valueAtPercentage(ranges.Purple[0], ranges.Purple[1], startOffset, 360, false).toFixed(2),
  };
}

function calculateVortexHues(startHue) {
  const originalHues = {};
  // for (const num of vortextOrder) {
  //   originalHues[num] = (startHue + vortextOffsets[num]) % 360;
  // }

  const startCategory = getColorCategory(startHue);
  const ranges = store.getState().colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;
  const [startRangeMin, startRangeMax] = ranges[startCategory];
  const startOffset = circularRangePercentage(startRangeMin, startRangeMax, startHue);
  const categoryCenters = buildCategoryCenters(startOffset);
  const availableCats = Object.keys(categoryCenters).filter((cat) => cat !== startCategory);

  // const sortedVortex = vortextOrder
  //   .slice()
  //   .sort((a, b) => {
  //     const distA = Math.min(Math.abs(originalHues[a] - startHue), 360 - Math.abs(originalHues[a] - startHue));
  //     const distB = Math.min(Math.abs(originalHues[b] - startHue), 360 - Math.abs(originalHues[b] - startHue));
  //     return distB - distA;
  //   })
  //   .slice(0, 5);

  const assigned = {};
  availableCats.forEach((cat, i) => {
    // const vortexNum = sortedVortex[i];
    const hue = categoryCenters[cat];
    // console.log(`Assigning vortex ${vortexNum} to category ${cat} with hue ${hue}`);
    assigned[vortexNum] = {
      vortex: vortexNum,
      hue: Math.round(hue * 100) / 100,
      category: cat,
      // originalHue: Math.round(originalHues[vortexNum] * 100) / 100,
    };
  });

  return vortextOrder.filter((num) => assigned[num]).map((num) => assigned[num]);
}

function calculateHues(startHue) {
  const originalHues = {};
  // for (const num of vortextOrder) {
  //   originalHues[num] = (startHue + vortextOffsets[num]) % 360;
  // }

  const startCategory = getColorCategory(startHue);
  const ranges = store.getState().colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;
  const [startRangeMin, startRangeMax] = ranges[startCategory];
  const startOffset = circularRangePercentage(startRangeMin, startRangeMax, startHue);
  const categoryCenters = buildCategoryCenters(startOffset);
  const availableCats = Object.keys(categoryCenters).filter((cat) => cat !== startCategory);
  // console.log('-----------------> availableCats', startCategory, availableCats);
  // const sortedVortex = vortextOrder
  //   .slice()
  //   .sort((a, b) => {
  //     const distA = Math.min(Math.abs(originalHues[a] - startHue), 360 - Math.abs(originalHues[a] - startHue));
  //     const distB = Math.min(Math.abs(originalHues[b] - startHue), 360 - Math.abs(originalHues[b] - startHue));
  //     return distB - distA;
  //   })
  //   .slice(0, 5);

  const assigned = [];
  availableCats.forEach((cat, i) => {
    // const vortexNum = sortedVortex[i];
    const hue = categoryCenters[cat];
    assigned[i] = {
      hue: Math.round(hue * 100) / 100,
      category: cat,
      // originalHue: Math.round(originalHues[vortexNum] * 100) / 100,
    };
  });

  return assigned;
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

function setSampleColorTokens(steps) {
  document.documentElement.style.setProperty(
    '--sample-black',
    steps
      .find((step) => step.colorName === 'Gray')
      .colors[9].getColor()
      .toString({ format: 'hex' })
  );
  document.documentElement.style.setProperty(
    '--sample-white',
    steps
      .find((step) => step.colorName === 'Gray')
      .colors[0].getColor()
      .toString({ format: 'hex' })
  );
  let stepsHtml = '';

  steps.forEach((step) => {
    step.colors.forEach((color, i) => {
      let lightText = step.colors[0].getColor();
      let darkText = step.colors[9].getColor();
      let j = (i + 1) * 10;
      document.documentElement.style.setProperty(`--sample-${step.colorName.toLowerCase()}-${j}`, color.getColor().toString({ format: 'hex' }));
      const colorPreview = color.getColor();
      if (i === 0) {
        let stepColor;
        if (step.colorName === 'Yellow') {
          stepColor = step.colors[2].getColor();
        } else {
          stepColor = step.colors[4].getColor();
        }
      }
    });
  });
}

class PaletteForm extends HTMLElement {
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
    const { pageType } = store.getState();
    // console.log('Initializing PaletteForm for page type:', pageType);
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };

    if (pageType === 'edit') {
      this.colorSpace = store.getState().colorSpace;
      this.previewColor = store.getState().previewColor || null;
      this.workingPalette = store.getState().workingPalette || new ColorPalette({});
    } else if (pageType === 'new') {
      this.colorSpace = 'okhsl';
      const defaultPreviewColor = new ColorModel({
        colorSpace: this.colorSpace,
        hue: 180,
        saturation: 72,
        lightness: lightnessSteps[5],
      });
      store.setState({ previewColor: defaultPreviewColor });
      this.previewColor = defaultPreviewColor;
      this.workingPalette = new ColorPalette({});
    }
  }

  cacheElements() {
    this.paletteName = this.querySelector('#palette-name');
    this.hueInput = this.querySelector('#hue-value');
    this.hueSlider = this.querySelector('#hue-slider');
    this.saturationInput = this.querySelector('#saturation-value');
    this.saturationSlider = this.querySelector('#saturation-slider');
    this.colorPreview = this.querySelector('#color-preview');
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
    if (!this.previewColor || !this.hueSlider || !this.saturationSlider) {
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
    let colorSteps = buildColorSteps(hueCategory, this.previewColor.colorSpace, currentHue, currentSaturation);
    console.log('Built color steps for category:', colorSteps, this.workingPalette.steps);
    const { lockedColors, lockedSteps } = this.querySelector('color-steps-examples').value || {};

    const lockedColorSet = new Set(lockedColors || []);

    let filteredSteps = this.workingPalette.steps.filter((step) => lockedColorSet.has(step.colorName.toLowerCase()));
    // colorSteps = colorSteps.filter((step) => !lockedColorSet.has(step.colorName.toLowerCase()));
    console.log('--------> lockedColors', lockedColorSet, filteredSteps, this.workingPalette.steps);
    this.workingPalette.steps = [];
    filteredSteps.forEach((step) => step.col);
    this.workingPalette.steps.push(...filteredSteps);

    //this.workingPalette.steps = this.workingPalette.steps.concat(colorSteps);

    //console.log('--------> locked', this.querySelector('color-steps-examples').value);
    if (!lockedColorSet.has(colorSteps.colorName.toLowerCase())) {
      this.workingPalette.steps.push(colorSteps);
    }

    // console.log('Built color steps for category:', hueCategory, colorSteps);

    const categoryHues = calculateHues(currentHue);
    // console.log('XXXXXXX HUES', categoryHues);
    // const vortexHues = this.calculateVortexHues(currentHue);
    // console.log('Calculated vortex hues:', vortexHues);
    // vortexHues.forEach((hue) => {
    //   this.workingPalette.steps.push(buildColorSteps(hue.category, this.previewColor.colorSpace, hue.hue, currentSaturation));
    // });

    categoryHues.forEach((hue) => {
      if (!lockedColorSet.has(hue.category.toLowerCase())) {
        // console.log('Adding color steps for category:', hue.category, hue.hue);
        this.workingPalette.steps.push(buildColorSteps(hue.category, this.previewColor.colorSpace, hue.hue, currentSaturation));
      }
    });

    if (!lockedColorSet.has('gray')) {
      this.workingPalette.steps.push(buildColorSteps('Gray', this.previewColor.colorSpace, currentHue, 11));
    }

    this.workingPalette.steps.sort((a, b) => {
      return categoryOrder.indexOf(a.colorName) - categoryOrder.indexOf(b.colorName);
    });
    console.log('Updated working palette:', this.workingPalette);

    setSampleColorTokens(this.workingPalette.steps);
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
      // console.log('edit-color-form Form submitted');
      const paletteCollection = store.getState().paletteCollection || [];
      //store.setState({ paletteCollection: [] });

      // console.log('Current palette collection:', paletteCollection);
      let newPalette = true;
      //return;
      // for (const palette of paletteCollection) {
      //   if (palette.id === this.workingPalette.id) {
      //     this.workingPalette.name = this.paletteName.value || 'Untitled Palette';
      //     this.workingPalette.colorSpace = this.colorSpace;
      //     paletteCollection.splice(paletteCollection.indexOf(palette), 1, this.workingPalette);
      //     console.log('Updated existing palette in collection:', palette);
      //     newPalette = false;
      //     store.setState({ paletteCollection });
      //     return;
      //   }
      // }
      if (newPalette) {
        paletteCollection.push(this.workingPalette);
        console.log('Added new palette to collection:', this.workingPalette);
        return;
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
    const { colorSpace, workingPalette } = store.getState();
    const defaultColor = this.previewColor.getColor();
    // console.log('rendering', workingPalette);
    this.innerHTML = `
      <div class="corn-row corn-margin-bottom">
        <div class="corn-col-12">          
          <div class="corn-row">
            <div class="corn-col-12">
              <div class="corn-header-bar">
              <h2 class="corn-heading">Palette</h2>
              <corn-button-bar class="corn-button-bar corn-button-bar--toolbar">
                <div class="corn-popover--anchor">
                  <button class="corn-button corn-button--xs corn-pop" aria-controls="popover-hex" aria-haspopup="true" type="button">
                    hex
                  </button>
                  <corn-popover position="left" id="popover-hex" class="corn-popover">
                    <hex-preview></hex-preview>
                  </corn-popover>
                </div>
              </corn-button-bar>                
              </div>
            </div>
          </div>
          <form class="corn-form">            
            <div class="corn-row">
              <div class="corn-col-3 corn-form">
                <div class="corn-form--item">
                  <div class="corn-text-input">
                    <input id="palette-name" name="palette-name" placeholder="Palette Name..." value="${store.getState().paletteName}" />
                    <label for="palette-name">Enter Palette Name</label>
                  </div>
                </div>
                <div class="corn-form--item">
                  <fieldset class="corn-toggle-group corn-toggle--md color-space-toggle" aria-labelledby="legend1">
                    <legend id="legend1">Color Space</legend>
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
                      <input type="range" min="${this.saturation.min}" max="${this.saturation.max}" step="${this.saturation.step}" value="${this.previewColor.saturation.toFixed(2)}" id="saturation-slider" name="saturation-slider"/>
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
          <color-steps-examples id="color-preview" class="corn-margin-bottom" name="color-preview"></color-steps-examples>
          <!-- div id="color-steps-container" class="color-steps-container edit-mode"></div -->
        </div>
      </div>
    `;
  }
}

customElements.define('palette-form', PaletteForm);
