const STORAGE_KEY = 'ColorPaletteToolState';

const createId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

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

export function createEmptyPalette() {
  return normalizePalette({});
}

const toPaletteCollection = (value) => (Array.isArray(value) ? value.map((palette) => normalizePalette(palette)) : []);

// Simple reactive store
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

  getState() {
    return structuredClone(this.state);
  },

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

  saveState() {
    this.saveToStorage();
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

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

  saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      console.log('State saved to localStorage:', this.state);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  },

  persist: () => store.saveToStorage(),
};

// Initialize
store.loadFromStorage();

export default store;
