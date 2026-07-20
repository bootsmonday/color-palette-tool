import { store } from '../store.js';
import { router } from '../router.js';
import { ColorModel } from '../models/ColorModel.js';
import { ColorSteps } from '../models/ColorSteps.js';

const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
const categoryOrder = ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Magenta', 'Gray'];

/**
 * Hue ranges for color categories in HSLuv and OKHSL color spaces. Each category is defined by a start and end hue value, which are used to determine the color category based on the hue of a given color. The ranges are used in the getColorCategory function to classify colors into their respective categories.
 */
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

/**
 *
 * @param {number} hue - The hue value of the color.
 * @returns {string} - The name of the color category.
 * This function determines the color category based on the provided hue value. It uses predefined hue ranges for different color categories in either the HSLuv or OKHSL color space, depending on the current working palette's color space. The function normalizes the hue value to ensure it falls within the 0-360 range and checks which category range it falls into, returning the corresponding category name. If no category matches, it defaults to 'Purple'.
 */
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

/**
 *
 * @param {Object} previewColorModel - The color model object used to generate the hue gradient values.
 * @returns {string[]} - An array of hex color strings representing the hue gradient.
 * This function generates an array of hex color strings representing a gradient of hues based on the provided color model. It iterates through 21 steps, calculating the hue for each step by multiplying the index by 18 and taking the modulus with 360 to ensure it wraps around the color wheel. The resulting colors are converted to hex format and returned as an array, which can be used to create a visual representation of the hue gradient in the UI slider.
 */
function createHueGradientValues(previewColorModel) {
  const previewColor = new ColorModel(previewColorModel).getColor();
  const gradientValues = [];

  for (let i = 0; i < 21; i++) {
    previewColor.h = (18 * i) % 360;
    gradientValues.push(previewColor.toString({ format: 'hex' }));
  }

  return gradientValues;
}

/**
 *
 * @param {Object} previewColorModel - The color model object used to generate the saturation gradient values.
 * @returns {string[]} - An array of hex color strings representing the saturation gradient.
 * This function generates an array of hex color strings representing a gradient of saturation levels based on the provided color model. It iterates through 11 steps, calculating the saturation for each step by multiplying the index by 10 and adjusting the value based on the color space. The resulting colors are converted to hex format and returned as an array, which can be used to create a visual representation of the saturation gradient in the UI slider.
 */
function createSaturationGradientValues(previewColorModel) {
  const previewColor = new ColorModel(previewColorModel).getColor();
  const gradientValues = [];

  for (let i = 0; i <= 100; i += 10) {
    previewColor.s = previewColorModel.colorSpace === 'okhsl' ? i / 100 : i;
    gradientValues.push(previewColor.toString({ format: 'hex' }));
  }

  return gradientValues;
}

/**
 *
 * @param {string} colorName - The name of the color.
 * @param {string} colorSpace - The color space of the color (e.g., 'hsluv', 'okhsl').
 * @param {number} hue - The hue value of the color.
 * @param {number} saturation - The saturation value of the color.
 * @returns {Object} - An object representing the color steps.
 * This function builds a color steps object for a given color name, color space, hue, and saturation. It creates an instance of the ColorSteps class and populates it with ColorModel instances for each lightness step defined in the lightnessSteps array. Each ColorModel is created with the specified color space, hue, saturation, and lightness value. The resulting ColorSteps object is then converted to JSON format and returned, providing a structured representation of the color steps for use in the application.
 */
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

/**
 *
 * @param {Object[]} steps - An array of color step objects.
 * This function sets CSS custom properties (variables) for sample color tokens based on the provided color steps. It iterates through the steps and their associated colors, generating CSS variables for each color in the format `--sample-{colorName}-{lightness}`. The function also sets specific variables for black and white colors based on the gray color step. These CSS variables can be used throughout the application to maintain consistent color theming and styling. Used int the CornCobTemplate.js and TailWindTemplate.js component to set the sample color tokens for the palette preview as well as any future template examples.
 */
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

/**
 * PaletteForm is a custom HTML element that represents a form for editing a color palette.
 * It provides methods for initializing, rendering, and updating the form based on the application's state. The component interacts with a global store to manage the working palette and responds to user input for changing hue, saturation, and color space. It also handles form submission to save the palette and navigate to the appropriate page. The component uses event listeners to handle user interactions and updates the UI accordingly.
 */
class PaletteForm extends HTMLElement {
  /**
   * Initializes a new instance of the PaletteForm component. It sets up the initial state and prepares the component for interaction with the global store. The constructor does not take any parameters and does not return any value. It is called automatically when a new instance of the component is created.
   */
  constructor() {
    super();
    this.unsubscribe = null;
  }

  /**
   *
   * @param {number} hue - The hue value for which to determine the color category.
   * @returns {string} - The color category corresponding to the given hue.
   */
  getColorCategory(hue) {
    return getColorCategory(hue);
  }

  /**
   * Called when the PaletteForm component is added to the DOM. This method initializes the component, renders its content, subscribes to changes in the working palette state, caches references to important elements, adds event listeners for user interactions, synchronizes locked controls from the palette, and updates the color preview. It ensures that the component is fully set up and ready to respond to user input and state changes.
   */
  connectedCallback() {
    this.initialize();
    this.render();
    this.unsubscribe = store.subscribeTo('workingPalette', (_key, _newValue, _oldValue, fullState) => this.update(fullState));
    this.cacheElements();
    this.addEventListeners();
    this.syncLockedControlsFromPalette();
    this.updatePreview();
  }

  /**
   *
   * @param {*} name
   * @param {*} oldValue
   * @param {*} newValue
   * Called when an observed attribute is added, removed, or changed. This method allows the component to respond to changes in its attributes and update its internal state or UI accordingly.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'type' && oldValue !== newValue) {
      this.render();
      this.cacheElements();
      this.updatePreview();
    }
  }

  /**
   * Initializes the PaletteForm component. It sets up the initial state based on the current page type and the working palette from the global store. It determines the palette name, color space, and user color based on whether the page is for editing an existing palette or creating a new one. The method also defines the saturation range and step size for the saturation slider. This setup ensures that the component is ready to display and manipulate the color palette as intended.
   */
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

  /**
   * Caches references to important elements within the PaletteForm component. This method queries the DOM for specific input fields, sliders, and preview elements, storing references to them for later use. Caching these elements improves performance by avoiding repeated DOM queries and allows the component to easily access and manipulate these elements in response to user interactions or state changes.
   */
  cacheElements() {
    this.paletteName = this.querySelector('#palette-name');
    this.hueInput = this.querySelector('#hue-value');
    this.hueSlider = this.querySelector('#hue-slider');
    this.saturationInput = this.querySelector('#saturation-value');
    this.saturationSlider = this.querySelector('#saturation-slider');
    this.colorPreview = this.querySelector('#color-preview');
  }

  /**
   * 
   * @param {*} newState
   * This method is called when the working palette state in the global store changes. It updates the component's internal state with the new working palette and user color, synchronizes the UI controls with the updated preview color, and refreshes the color preview display. The method ensures that the PaletteForm component remains in sync with the application's state and reflects any changes made to the working palette.

   */
  update(newState) {
    this.workingPalette = newState.workingPalette;
    this.userColor = this.workingPalette.userColor;
    this.syncControlsFromPreviewColor(); // keep UI in sync with store
    this.updatePreview();
  }

  /**
   * This method updates the color preview display based on the current state of the PaletteForm component. It refreshes the hue and saturation sliders to reflect the current user color, and it updates the color preview element to show the resulting color based on the selected hue and saturation values. The method ensures that the visual representation of the color palette remains accurate and responsive to user input.
   */
  updatePreview() {
    this.updateHueSlider();
    this.updateSaturationSlider();
    this.updateColorPreview();
  }

  /**
   * This method synchronizes the locked controls in the PaletteForm component with the current state of the working palette. It retrieves the locked colors from the working palette's steps and updates the corresponding preview element to reflect these locked colors. The method ensures that the UI accurately represents which colors are locked, allowing users to see and manage their locked color selections effectively.
   */
  syncLockedControlsFromPalette() {
    const preview = this.querySelector('color-steps-examples');
    if (!preview) return;

    const lockedColors = (this.workingPalette?.steps || []).filter((step) => step.locked).map((step) => step.colorName.toLowerCase());
    const lockedSteps = [];

    (this.workingPalette?.steps || []).forEach((step) => {
      step.colors?.forEach((color, index) => {
        if (color?.locked) {
          lockedSteps.push(`${step.colorName.toLowerCase()}:${(index + 1) * 10}`);
        }
      });
    });

    preview.value = { lockedColors, lockedSteps };
  }

  /**
   * This method synchronizes the UI controls in the PaletteForm component with the current preview color from the working palette. It updates the hue and saturation input fields and sliders to match the hue and saturation values of the user color in the working palette. The method ensures that the UI accurately reflects the current state of the color palette, allowing users to see and adjust the hue and saturation values as needed.
   */
  syncControlsFromPreviewColor() {
    if (!this.workingPalette.userColor) return;

    const hue = this.workingPalette.userColor.hue.toFixed(2);
    const saturation = this.workingPalette.userColor.saturation.toFixed(2);

    if (this.hueSlider.value !== hue) this.hueSlider.value = hue;
    if (this.hueInput.value !== hue) this.hueInput.value = hue;

    if (this.saturationSlider.value !== saturation) this.saturationSlider.value = saturation;
    if (this.saturationInput.value !== saturation) this.saturationInput.value = saturation;
  }

  /**
   * This method updates the color space used in the PaletteForm component based on the current working palette. It retrieves the color space from the working palette's state and sets it as the component's color space. Additionally, it defines the saturation range and step size for the saturation slider, ensuring that the component is configured correctly for the selected color space. This method is called whenever the working palette's color space changes, allowing the component to adapt to different color spaces as needed.
   */
  updateColorSpace() {
    this.colorSpace = store.getState().workingPalette?.colorSpace || 'okhsl';
    this.saturation = {
      min: 0,
      max: 100,
      step: 0.01,
      default: 50,
    };
  }

  /**
   * This method updates the hue slider in the PaletteForm component based on the current user color in the working palette. It generates a gradient of hue values and applies it as the background of the hue slider. The method also synchronizes the hue input field with the slider's value, ensuring that both controls reflect the current hue of the user color. This provides a visual representation of the hue range and allows users to adjust the hue effectively.
   */
  updateHueSlider() {
    const gradientValues = createHueGradientValues(this.workingPalette.userColor);
    if (this.hueSlider.value !== this.workingPalette.userColor.hue.toFixed(2)) {
      this.hueSlider.value = this.workingPalette.userColor.hue.toFixed(2);
      this.hueInput.value = this.workingPalette.userColor.hue.toFixed(2);
    }
    this.hueSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  /**
   * This method updates the saturation slider in the PaletteForm component based on the current user color in the working palette. It generates a gradient of saturation values and applies it as the background of the saturation slider. The method also synchronizes the saturation input field with the slider's value, ensuring that both controls reflect the current saturation of the user color. This provides a visual representation of the saturation range and allows users to adjust the saturation effectively.
   */
  updateSaturationSlider() {
    const gradientValues = createSaturationGradientValues(this.workingPalette.userColor);

    if (this.saturationSlider.value !== this.workingPalette.userColor.saturation.toFixed(2)) {
      this.saturationSlider.value = this.workingPalette.userColor.saturation.toFixed(2);
      this.saturationInput.value = this.workingPalette.userColor.saturation.toFixed(2);
    }
    this.saturationSlider.style.setProperty('background', `linear-gradient(to right, ${gradientValues.join(',')})`);
  }

  /**
   *
   * @param {number} hue - The hue value to find at the same relative distance.
   * @returns {Object} An object containing the new hue values for each color category, along with the center and percentage offset.
   * This method calculates the new hue values for each color category based on the provided hue value. It determines the source category and its center, calculates the offset and percentage relative to the source category's width, and then applies this percentage to each target category's width to find the new hue values. The results are returned as an object containing the new hue values, centers, and percentage offsets for each color category. This allows for consistent color adjustments across different categories while maintaining relative distances in hue.
   */
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

  /**
   * This method updates the color preview in the PaletteForm component based on the current user color, hue, and saturation values. It retrieves the user color from the working palette, calculates the new hue values for each color category at the same relative distance, and builds color steps for each category. The method also filters out locked colors and sorts the resulting color steps according to a predefined category order. Finally, it updates the working palette's steps and sets sample color tokens for use in the application. This ensures that the color preview accurately reflects the user's selections and any locked colors.
   */
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
    const lockedStepSet = new Set((lockedSteps || []).map((value) => String(value)));
    const existingStepsByColor = new Map((this.workingPalette.steps || []).map((step) => [step.colorName, step]));
    const isStepLocked = (colorName, stepName) => {
      const scopedKey = `${colorName.toLowerCase()}:${stepName}`;
      // Keep backward compatibility for prior global step locks (e.g. "10").
      return lockedStepSet.has(scopedKey) || lockedStepSet.has(stepName);
    };

    let filteredSteps = this.workingPalette.steps.filter((step) => {
      if (lockedColorSet.has(step.colorName.toLowerCase())) {
        step.locked = true;
        return true;
      } else {
        step.locked = false;
        return false;
      }
    });

    Object.entries(hueDistances).forEach(([category, { newHue }]) => {
      sampleSteps.push(buildColorSteps(category, this.userColor.colorSpace, newHue, currentSaturation));
    });

    sampleSteps.push(buildColorSteps('Gray', this.userColor.colorSpace, currentHue, 0));

    sampleSteps = sampleSteps.map((step) => {
      const existingStep = existingStepsByColor.get(step.colorName);
      step.colors = step.colors.map((color, index) => {
        const stepName = String((index + 1) * 10);
        const shouldLockStep = isStepLocked(step.colorName, stepName);
        const previousColor = existingStep?.colors?.[index];

        if (shouldLockStep && previousColor) {
          previousColor.locked = true;
          return previousColor;
        }

        color.locked = shouldLockStep;
        return color;
      });

      return step;
    });

    filteredSteps.forEach((step) => {
      step.colors = step.colors.map((color, index) => {
        color.locked = isStepLocked(step.colorName, String((index + 1) * 10));
        return color;
      });
    });

    sampleSteps = sampleSteps.filter((step) => !lockedColorSet.has(step.colorName.toLowerCase()));
    sampleSteps.push(...filteredSteps);
    sampleSteps.sort((a, b) => {
      return categoryOrder.indexOf(a.colorName) - categoryOrder.indexOf(b.colorName);
    });
    this.workingPalette.steps = sampleSteps;
    this.workingPalette.steps.forEach((step) => {
      step.colorSpace = this.userColor.colorSpace;
      step.colors.forEach((color) => {
        color.colorSpace = this.userColor.colorSpace;
      });
    });
    setSampleColorTokens(this.workingPalette.steps);
  }

  /**
   * This method adds event listeners to the PaletteForm component for handling user interactions. It listens for 'submit', 'input', 'keydown', and 'change' events, allowing the component to respond to form submissions, input changes, key presses, and other changes in the form. The event listeners are bound to the component itself, enabling it to handle events and update its state or UI accordingly. This setup ensures that the component can effectively manage user input and maintain synchronization with the application's state.
   */
  addEventListeners() {
    const form = this.querySelector('form');
    this.addEventListener('submit', this);
    this.addEventListener('input', this);
    this.addEventListener('keydown', this);
    this.addEventListener('change', this);
  }

  /**
   *
   * @param {*} e
   * @returns
   * This method handles various events triggered within the PaletteForm component, including form submissions, input changes, key presses, and other changes. It processes the events based on their type and updates the working palette, user color, and UI controls accordingly. For form submissions, it prevents the default behavior, updates the color preview, and saves the palette to the global store. For input events, it updates the working palette's name, color space, hue, and saturation values based on user input. For keydown events, it handles specific keys like Enter, Backspace, Delete, ArrowUp, and ArrowDown to adjust hue and saturation values. The method ensures that the component responds appropriately to user interactions and maintains synchronization with the application's state.
   */
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
      if (e.target.name === 'lock-color' || e.target.name === 'lock-step') {
        this.updateColorPreview();
        store.setState({ workingPalette: this.workingPalette });
      }
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

  /**
   *
   * @param {*} patch
   * This method updates the working palette's user color with the provided patch object, merging it with the existing user color properties. It then updates the global store's state with the modified working palette, ensuring that any changes to the user color are reflected in the application's state and UI. This allows for real-time updates to the color preview and other dependent components when the user adjusts hue, saturation, or other color properties.
   */
  commitPreviewColor(patch) {
    this.workingPalette.userColor = {
      ...this.workingPalette.userColor,
      ...patch,
    };
    store.setState({ workingPalette: this.workingPalette });
  }

  /**
   *
   * @param {Event} e - The event object representing the user interaction.
   * This method handles changes to the hue value based on user input. It retrieves the new hue value from the event target, parses it as a float, and calls the commitPreviewColor method to update the working palette's user color with the new hue. This allows for real-time updates to the color preview and other dependent components when the user adjusts the hue value.
   */
  changeHue(e) {
    this.commitPreviewColor({ hue: parseFloat(e.target.value) });
  }

  /**
   *
   * @param {*} e
   * This method handles changes to the saturation value based on user input. It retrieves the new saturation value from the event target, parses it as a float, and calls the commitPreviewColor method to update the working palette's user color with the new saturation. This allows for real-time updates to the color preview and other dependent components when the user adjusts the saturation value.
   */
  changeSaturation(e) {
    this.commitPreviewColor({ saturation: parseFloat(e.target.value) });
  }

  /**
   *
   * @param {Event} e - The event object representing the user interaction.
   * This method handles changes to the color space based on user input. It retrieves the new color space value from the event target and calls the commitPreviewColor method to update the working palette's user color with the new color space. This allows for real-time updates to the color preview and other dependent components when the user selects a different color space.
   */
  changeColorSpace(e) {
    this.commitPreviewColor({ colorSpace: e.target.value });
  }

  /**
   * This method is called when the PaletteForm component is removed from the DOM. It removes event listeners for 'input' and 'keydown' events, and unsubscribes from the global store's working palette state changes. This cleanup ensures that the component does not continue to listen for events or state changes after it has been disconnected, preventing memory leaks and unintended behavior.
   */
  disconnectedCallback() {
    this.removeEventListener('input', this);
    this.removeEventListener('keydown', this);
    this.unsubscribe?.();
  }

  /**
   * This method renders the HTML content of the PaletteForm component. It sets the innerHTML of the component to a structured layout that includes input fields for palette name, hue, and saturation, as well as sliders for adjusting hue and saturation values. The rendered content also includes a color preview section that displays the resulting colors based on user input. The method uses template literals to dynamically insert values from the component's state, ensuring that the UI reflects the current working palette and user color settings.
   */
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
