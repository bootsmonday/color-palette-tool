import { store } from '../store.js';
import { router } from '../router.js';
import { ColorModel } from '../models/ColorModel.js';
import { ColorSteps } from '../models/ColorSteps.js';

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
const categoryOrder = ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Magenta', 'Gray'];

const categoryRangesHSLUV = {
  Red: [355, 20],
  Orange: [20, 75],
  Yellow: [75, 120],
  Green: [120, 160],
  Teal: [160, 190],
  Blue: [190, 255],
  Purple: [255, 305],
  Magenta: [305, 355],
};
const categoryRangesOKHSL = {
  Red: [350, 45],
  Orange: [45, 98],
  Yellow: [98, 120],
  Green: [120, 165],
  Teal: [165, 210],
  Blue: [210, 275],
  Purple: [275, 330],
  Magenta: [330, 350],
};

function getColorCategory(hue) {
  const colorSpace = store.getState().workingPalette?.colorSpace || 'okhsl';
  const ranges = colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;
  const normalizedHue = ((hue % 360) + 360) % 360;

  if (normalizedHue >= ranges.Red[0] || normalizedHue < ranges.Red[1]) return 'Red';
  if (normalizedHue >= ranges.Orange[0] && normalizedHue < ranges.Orange[1]) return 'Orange';
  if (normalizedHue >= ranges.Yellow[0] && normalizedHue < ranges.Yellow[1]) return 'Yellow';
  if (normalizedHue >= ranges.Green[0] && normalizedHue < ranges.Green[1]) return 'Green';
  if (normalizedHue >= ranges.Teal[0] && normalizedHue < ranges.Teal[1]) return 'Teal';
  if (normalizedHue >= ranges.Blue[0] && normalizedHue < ranges.Blue[1]) return 'Blue';
  if (normalizedHue >= ranges.Magenta[0] && normalizedHue < ranges.Magenta[1]) return 'Magenta';

  return 'Purple';
}

function createHueGradientValues(previewColorModel) {
  const previewColor = new ColorModel(previewColorModel).getColor();
  const gradientValues = [];

  for (let i = 0; i < 21; i++) {
    previewColor.h = (18 * i) % 360;
    gradientValues.push(previewColor.toString({ format: 'hex' }));
  }

  return gradientValues;
}

function createSaturationGradientValues(previewColorModel) {
  const previewColor = new ColorModel(previewColorModel).getColor();
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

  return colorSteps.toJSON();
}

function setSampleColorTokens(steps) {
  document.documentElement.style.setProperty(
    '--sample-black',
    steps.find((step) => step.colorName === 'Gray').colors[9].getColor
      ? steps
          .find((step) => step.colorName === 'Gray')
          .colors[9].getColor()
          .toString({ format: 'hex' })
      : new ColorModel(steps.find((step) => step.colorName === 'Gray').colors[9]).getColor().toString({ format: 'hex' })
  );
  document.documentElement.style.setProperty(
    '--sample-white',
    steps.find((step) => step.colorName === 'Gray').colors[0].getColor
      ? steps
          .find((step) => step.colorName === 'Gray')
          .colors[0].getColor()
          .toString({ format: 'hex' })
      : new ColorModel(steps.find((step) => step.colorName === 'Gray').colors[0]).getColor().toString({ format: 'hex' })
  );

  steps.forEach((step) => {
    step.colors.forEach((color, i) => {
      let j = (i + 1) * 10;
      const runtimeColor = color.getColor ? color : new ColorModel(color);
      document.documentElement.style.setProperty(`--sample-${step.colorName.toLowerCase()}-${j}`, runtimeColor.getColor().toString({ format: 'hex' }));
      if (i === 0) {
        // intentionally no-op; retained to avoid changing render timing assumptions
      }
    });
  });
}

class PaletteForm extends HTMLElement {
  constructor() {
    super();
    this.unsubscribe = null;
  }

  getColorCategory(hue) {
    return getColorCategory(hue);
  }

  connectedCallback() {
    this.initialize();
    this.render();
    this.unsubscribe = store.subscribeTo('workingPalette', (_key, _newValue, _oldValue, fullState) => this.update(fullState));
    this.cacheElements();
    this.addEventListeners();
    this.syncLockedControlsFromPalette();
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
    const { pageType, workingPalette } = store.state;
    this.workingPalette = workingPalette;
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };
    if (pageType === 'edit') {
      this.paletteName = this.workingPalette.name || 'Palette Name Goes Here';
      this.colorSpace = this.workingPalette.colorSpace;
      this.userColor = this.workingPalette.userColor || null;
    } else if (pageType === 'new') {
      this.colorSpace = this.workingPalette.colorSpace;
      this.paletteName = this.workingPalette.name;
      this.userColor = this.workingPalette.userColor;
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

  update(newState) {
    this.workingPalette = newState.workingPalette;
    this.userColor = this.workingPalette.userColor;
    this.syncControlsFromPreviewColor(); // keep UI in sync with store
    this.updatePreview();
  }

  updatePreview() {
    this.updateHueSlider();
    this.updateSaturationSlider();
    this.updateColorPreview();
  }

  syncLockedControlsFromPalette() {
    const preview = this.querySelector('color-steps-examples');
    if (!preview) return;

    const lockedColors = (this.workingPalette?.steps || []).filter((step) => step.locked).map((step) => step.colorName.toLowerCase());
    preview.value = { lockedColors, lockedSteps: [] };
  }

  syncControlsFromPreviewColor() {
    if (!this.workingPalette.userColor) return;

    const hue = this.workingPalette.userColor.hue.toFixed(2);
    const saturation = this.workingPalette.userColor.saturation.toFixed(2);

    if (this.hueSlider.value !== hue) this.hueSlider.value = hue;
    if (this.hueInput.value !== hue) this.hueInput.value = hue;

    if (this.saturationSlider.value !== saturation) this.saturationSlider.value = saturation;
    if (this.saturationInput.value !== saturation) this.saturationInput.value = saturation;
  }
  updateColorSpace() {
    this.colorSpace = store.getState().workingPalette?.colorSpace || 'okhsl';
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };
  }

  updateHueSlider() {
    const gradientValues = createHueGradientValues(this.workingPalette.userColor);
    if (this.hueSlider.value !== this.workingPalette.userColor.hue.toFixed(2)) {
      this.hueSlider.value = this.workingPalette.userColor.hue.toFixed(2);
      this.hueInput.value = this.workingPalette.userColor.hue.toFixed(2);
    }
    this.hueSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  updateSaturationSlider() {
    const gradientValues = createSaturationGradientValues(this.workingPalette.userColor);

    if (this.saturationSlider.value !== this.workingPalette.userColor.saturation.toFixed(2)) {
      this.saturationSlider.value = this.workingPalette.userColor.saturation.toFixed(2);
      this.saturationInput.value = this.workingPalette.userColor.saturation.toFixed(2);
    }
    this.saturationSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  getHueAtSameRelativeDistance(hue) {
    const categoryRanges = this.colorSpace === 'hsluv' ? categoryRangesHSLUV : categoryRangesOKHSL;
    // Helper to get center (handles wrapping ranges)
    const getCenter = ([start, end]) => {
      if (start < end) return (start + end) / 2;
      // Wrapping range (like Red)
      return ((start + end + 360) / 2) % 360;
    };

    // Find source category
    let sourceRange = Object.entries(categoryRanges).find(([_, range]) => {
      const [start, end] = range;
      if (start < end) return hue >= start && hue <= end;
      return hue >= start || hue <= end;
    })?.[1];

    const sourceCenter = getCenter(sourceRange);
    const sourceWidth = sourceRange[0] < sourceRange[1] ? sourceRange[1] - sourceRange[0] : 360 - sourceRange[0] + sourceRange[1];
    const offset = hue - sourceCenter;
    const halfWidth = sourceWidth / 2;
    const percentage = offset / halfWidth;

    const results = {};

    Object.entries(categoryRanges).forEach(([name, range]) => {
      const center = getCenter(range);
      const width = range[0] < range[1] ? range[1] - range[0] : 360 - range[0] + range[1];

      const newOffset = percentage * (width / 2);
      let newHue = (center + newOffset + 360) % 360; // normalize

      results[name] = {
        center: Math.round(center * 100) / 100,
        newHue: Math.round(newHue * 100) / 100,
        percentage: Math.round(percentage * 10000) / 100, // e.g. 33.33
      };
    });

    return results;
  }

  applyFilters() {}

  updateColorPreview() {
    const userColor = store.getState().workingPalette.userColor;
    //const previewColor = this.previewColor.getColor();
    const currentHue = Number(this.hueInput.value || 0);
    const currentSaturation = Number(this.saturationInput.value || 0);
    const hueCategory = this.getColorCategory(currentHue);

    const hueDistances = this.getHueAtSameRelativeDistance(currentHue);

    let sampleSteps = [];

    const { lockedColors, lockedSteps } = this.querySelector('color-steps-examples').value || {};

    const lockedColorSet = new Set(lockedColors || []);

    let filteredSteps = this.workingPalette.steps.filter((step) => {
      if (lockedColorSet.has(step.colorName.toLowerCase())) {
        step.locked = true;
        return true;
      } else {
        step.locked = false;
        return false;
      }
    });
    // colorSteps = colorSteps.filter((step) => !lockedColorSet.has(step.colorName.toLowerCase()));
    // Get hues for all categories based on current hue and color space

    Object.entries(hueDistances).forEach(([category, { newHue }]) => {
      sampleSteps.push(buildColorSteps(category, this.userColor.colorSpace, newHue, currentSaturation));
    });

    sampleSteps.push(buildColorSteps('Gray', this.userColor.colorSpace, currentHue, 0));
    sampleSteps = sampleSteps.filter((step) => !lockedColorSet.has(step.colorName.toLowerCase()));
    sampleSteps.push(...filteredSteps);
    sampleSteps.sort((a, b) => {
      return categoryOrder.indexOf(a.colorName) - categoryOrder.indexOf(b.colorName);
    });
    this.workingPalette.steps = sampleSteps;
    // this.workingPalette.steps.sort((a, b) => {
    //   return categoryOrder.indexOf(a.colorName) - categoryOrder.indexOf(b.colorName);
    // });
    this.workingPalette.steps.forEach((step) => {
      step.colorSpace = this.userColor.colorSpace;
      step.colors.forEach((color) => {
        color.colorSpace = this.userColor.colorSpace;
      });
    });
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
      e.preventDefault();
      const { pageType } = store.getState();
      this.updateColorPreview();
      const paletteCollection = store.getState().paletteCollection || [];
      this.workingPalette.name = this.paletteName.value || 'Untitled Palette';
      this.workingPalette.colorSpace = this.colorSpace;

      if (pageType === 'new') {
        paletteCollection.push(this.workingPalette);
        store.setState({ paletteCollection: paletteCollection, workingPalette: this.workingPalette });
        store.persist();
        router.navigate('/edit-palette/' + this.workingPalette.id);
      } else {
        const index = paletteCollection.findIndex((palette) => palette.id === this.workingPalette.id);
        if (index !== -1) {
          paletteCollection[index] = this.workingPalette;
          store.setState({ paletteCollection: paletteCollection, workingPalette: this.workingPalette });
          store.persist();
        }
      }

      return false;
    }
    if (e.type === 'change') {
    }
    if (e.type === 'input') {
      if (e.target.name === 'palette-name') {
        this.workingPalette.name = e.target.value || 'Untitled Palette';
        store.setState({ workingPalette: this.workingPalette });
        return;
      }

      if (e.target.name === 'color-space') {
        e.stopPropagation();
        this.colorSpace = e.target.value;
        this.workingPalette.colorSpace = this.colorSpace;
        // this.userColor.colorSpace = this.colorSpace;
        this.changeColorSpace(e);
        return;
      }
      if (e.target.name === 'hue-slider') {
        this.hueInput.value = e.target.value;
        this.changeHue(e);
      }
      if (e.target.name === 'saturation-slider') {
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
    this.workingPalette.userColor = {
      ...this.workingPalette.userColor,
      ...patch,
    };
    store.setState({ workingPalette: this.workingPalette });
  }

  changeHue(e) {
    this.commitPreviewColor({ hue: parseFloat(e.target.value) });
  }

  changeSaturation(e) {
    this.commitPreviewColor({ saturation: parseFloat(e.target.value) });
  }
  changeColorSpace(e) {
    this.commitPreviewColor({ colorSpace: e.target.value });
  }
  disconnectedCallback() {
    this.removeEventListener('input', this);
    this.removeEventListener('keydown', this);
    this.unsubscribe?.();
  }

  render() {
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
                    <input id="palette-name" name="palette-name" placeholder="Palette Name..." value="${this.paletteName}" />
                    <label for="palette-name">Enter Palette Name</label>
                  </div>
                </div>
                <div class="corn-form--item">
                  <fieldset class="corn-toggle-group corn-toggle--md color-space-toggle" aria-labelledby="legend1">
                    <legend id="legend1">Color Space</legend>
                    <div class="corn-toggles">
                      <div class="corn-toggle">
                        <input type="radio" id="colospace1" name="color-space" value="hsluv" ${this.colorSpace === 'hsluv' ? 'checked' : ''} />
                        <label for="colospace1">hsluv</label>
                      </div>
                      <div class="corn-toggle">
                        <input type="radio" id="colospace2" name="color-space" value="okhsl" ${this.colorSpace === 'okhsl' ? 'checked' : ''} />
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
                        <input id="hue-value" name="hue-value" placeholder="Hue" value="${this.userColor.hue.toFixed(2)}" />
                        <label for="hue-value">Hue Value</label>
                      </div>
                    </div>
                  </div>
                  <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                    <div class="corn-slider ">
                      <label for="hue-slider">Hue:</label>
                      <input type="range" min="0" max="360" step="0.01" value="${this.userColor.hue.toFixed(2)}" id="hue-slider" name="hue-slider"/>
                    </div>
                  </div>
                </div>
                <div class="corn-row">
                  <div class="corn-col-12 corn-col-sm-4 corn-col-md-3 corn-col-xl-2">
                    <div class="corn-form--item">
                      <div class="corn-text-input">
                        <input id="saturation-value" name="saturation-value" placeholder="Saturation" value="${this.userColor.saturation.toFixed(2)}" />
                        <label for="saturation-value">Saturation Value</label>
                      </div>
                    </div>
                  </div>
                  <div class="corn-col-12 corn-col-sm-8 corn-col-md-9 corn-col-xl-10">
                    <div class="corn-slider">
                      <label for="saturation-slider">Saturation:</label>
                      <input type="range" min="${this.saturation.min}" max="${this.saturation.max}" step="${this.saturation.step}" value="${this.userColor.saturation.toFixed(2)}" id="saturation-slider" name="saturation-slider"/>
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
