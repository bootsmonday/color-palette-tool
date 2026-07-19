const STORAGE_KEY = 'ColorPaletteToolState';

const createId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 *
 * @param {string} colorSpace - The color space to use for the new color (default is 'okhsl').
 * @returns {object} A new color object with default values for the specified color space.
 * This function creates a new color object with a unique ID, specified color space, and default values for hue, saturation, lightness, and locked state. The default values are set to represent a neutral color in the specified color space. The returned object can be used as a starting point for creating or manipulating colors within the application.
 * Built to better understand how a store works in the application. Can be replaced with a more robust state management library in the future if needed.
 */
export function createEmptyColor(colorSpace = 'okhsl') {
  return {
    id: createId('color'),
    colorSpace,
    hue: 180,
    saturation: 50,
    lightness: 47.5,
    locked: false,
  };
}

/**
 *
 * @param {object} value - The color object to normalize.
 * @param {string} fallbackColorSpace - The fallback color space to use if the color object does not specify one (default is 'okhsl').
 * @returns {object} The normalized color object with default values for missing properties.
 * This function normalizes a color object by ensuring that it has all the required properties, including a unique ID, color space, hue, saturation, lightness, and locked state. If any of these properties are missing or invalid in the provided color object, the function assigns default values. The fallbackColorSpace parameter allows for specifying a default color space to use if the color object does not provide one. This normalization process ensures consistency and reliability when working with color objects in the application.
 * OKHSL and HSLUV use different ranges for saturation and hues, so this function ensures that the values are appropriately scaled based on the color space. For OKHSL, saturation and lightness are expected to be in the range of 0-100, while for HSLUV, they are expected to be in the range of 0-1. The function adjusts the values accordingly to maintain consistency across different color spaces.
 */
function normalizeColor(value, fallbackColorSpace = 'okhsl') {
  const source = value && typeof value === 'object' ? value : {};
  const colorSpace = source.colorSpace || fallbackColorSpace;

  return {
    id: source.id || createId('color'),
    colorSpace,
    hue: +toNumber(source.hue, 180).toFixed(2),
    saturation: +toNumber(source.saturation, 50).toFixed(2),
    lightness: +toNumber(source.lightness, 47.5).toFixed(2),
    locked: Boolean(source.locked),
  };
}

/**
 * Normalizes a step object by ensuring it has all the required properties, including a unique ID, color name, color space, an array of colors, and locked state. If any of these properties are missing or invalid in the provided step object, the function assigns default values.
 *
 * @param {object} value - The step object to normalize.
 * @param {string} fallbackColorSpace - The fallback color space to use if the step object does not specify one (default is 'okhsl').
 * @returns {object} The normalized step object with default values for missing properties.
 */
function normalizeStep(value, fallbackColorSpace = 'okhsl') {
  const source = value && typeof value === 'object' ? value : {};
  const colorSpace = source.colorSpace || fallbackColorSpace;

  return {
    id: source.id || createId('steps'),
    colorName: source.colorName || 'Color Name Goes Here',
    colorSpace,
    colors: Array.isArray(source.colors) ? source.colors.map((color) => normalizeColor(color, colorSpace)) : [],
    locked: Boolean(source.locked),
  };
}

/**
 * Normalizes a palette object by ensuring it has all the required properties, including a unique ID, name, color space, creation date, user color, and an array of steps. If any of these properties are missing or invalid in the provided palette object, the function assigns default values.
 *
 * @param {object} value - The palette object to normalize.
 * @returns {object} The normalized palette object with default values for missing properties.
 */
function normalizePalette(value) {
  const source = value && typeof value === 'object' ? value : {};
  const colorSpace = source.colorSpace || 'okhsl';

  return {
    id: source.id || createId('palette'),
    name: source.name || 'Palette Name Goes Here',
    colorSpace,
    createdAt: source.createdAt || new Date().toISOString(),
    userColor: normalizeColor(source.userColor, colorSpace),
    steps: Array.isArray(source.steps) ? source.steps.map((step) => normalizeStep(step, colorSpace)) : [],
  };
}

/**
 *  Creates a new empty palette object with default values for all properties. The palette has a unique ID, a default name, a specified color space, the current date and time as the creation date, a default user color, and an empty array of steps.
 * @returns
 */
export function createEmptyPalette() {
  return normalizePalette({});
}

const toPaletteCollection = (value) => (Array.isArray(value) ? value.map((palette) => normalizePalette(palette)) : []);

/**
 * Simple reactive store for managing the application's state, including the working palette, palette collection, current route, page type, and editing palette ID. Provides methods for getting and setting state, subscribing to state changes, and persisting state to local storage.
 * Can be replaced with a more robust state management library in the future if needed.
 */
export const store = {
  state: {
    workingPalette: createEmptyPalette(),
    paletteCollection: [],
    currentRoute: '/',
    pageType: 'home',
    editingPaletteId: null,
  },

  listeners: new Set(),
  keyedListeners: new Map(),

  /**
   * Gets the current state of the store.
   *
   * @returns {object} The current state object.
   */
  getState() {
    return structuredClone(this.state);
  },

  /**
   * Sets the state of the store by merging the provided partial state with the current state.
   *
   * @param {object} partial - The partial state to merge with the current state.
   */
  setState(partial) {
    if (!partial || typeof partial !== 'object') return;

    const oldState = { ...this.state };
    const changedKeys = Object.keys(partial);

    if (changedKeys.length === 0) return;

    let newState = { ...this.state, ...partial };

    if (partial.editingPaletteId !== undefined) {
      const matchedPalette = newState.paletteCollection.find((p) => p?.id === partial.editingPaletteId);
      if (matchedPalette) {
        newState.workingPalette = normalizePalette(matchedPalette);
      }
    }

    if ('workingPalette' in partial) {
      newState.workingPalette = normalizePalette(newState.workingPalette);
    }

    if ('paletteCollection' in partial) {
      newState.paletteCollection = toPaletteCollection(newState.paletteCollection);
    }

    this.state = newState;
    this.listeners.forEach((listener) => listener(this.state, changedKeys));

    changedKeys.forEach((key) => {
      this.keyedListeners.get(key)?.forEach((listener) => {
        listener(key, this.state[key], oldState[key], this.state);
      });
    });
  },

  /**
   * Saves the current state of the store to local storage.
   */
  saveState() {
    this.saveToStorage();
  },

  /**
   *
   * @param {function} listener - The listener function to subscribe to state changes.
   * @returns {function} A function to unsubscribe the listener.
   * This method allows components or other parts of the application to subscribe to changes in the store's state. When the state changes, the provided listener function will be called with the new state and the keys that have changed. The method returns a function that can be called to unsubscribe the listener, preventing it from receiving further updates.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  /**
   *
   * @param {string|string[]} keys - The key or array of keys to subscribe to.
   * @param {function} listener - The listener function to subscribe to changes for the specified keys.
   * @returns {function} A function to unsubscribe the listener from the specified keys.
   * This method allows components or other parts of the application to subscribe to changes in specific keys of the store's state. When any of the specified keys change, the provided listener function will be called with the key, new value, old value, and the entire state. The method returns a function that can be called to unsubscribe the listener from the specified keys, preventing it from receiving further updates for those keys.
   */
  subscribeTo(keys, listener) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const unsubs = keyArray.map((key) => {
      if (!this.keyedListeners.has(key)) this.keyedListeners.set(key, new Set());
      this.keyedListeners.get(key).add(listener);

      return () => {
        const set = this.keyedListeners.get(key);
        set?.delete(listener);
        if (set?.size === 0) this.keyedListeners.delete(key);
      };
    });

    return () => unsubs.forEach((unsub) => unsub());
  },

  /**
   * Loads the state of the store from local storage.
   * @returns {void}
   */
  loadFromStorage() {
    if (typeof localStorage === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;
      const parsed = JSON.parse(saved);
      const newState = { ...this.state, ...parsed };

      if ('workingPalette' in parsed) {
        newState.workingPalette = normalizePalette(newState.workingPalette);
      }
      if ('paletteCollection' in parsed) {
        newState.paletteCollection = toPaletteCollection(newState.paletteCollection);
      }

      this.state = newState;
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
  },

  /**
   * Saves the current state of the store to local storage. If local storage is not available, the method does nothing. It attempts to serialize the state to a JSON string and store it under the specified STORAGE_KEY. If an error occurs during this process, it logs a warning to the console. This method allows for persisting the application's state across page reloads or browser sessions.
   */
  saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  },

  persist: () => store.saveToStorage(),
};

// Initialize
store.loadFromStorage();

export default store;
