import { ColorModel } from './models/ColorModel.js';

export const store = {
  state: {
    colorSpace: 'okhsl',
    workingPalette: null,
    paletteCollection: [],
    paletteName: '',
    colorCollectionId: null,
    userColor: null,
    previewColor: null,
    currentRoute: '/',
    STORAGE_KEY: 'ColorPaletteToolState',
  },

  listeners: new Set(), // global listeners
  keyedListeners: new Map(), // single-key listeners
  groupListeners: new Map(), // multi-key batch listeners

  getState() {
    return { ...this.state };
  },

  setState(newPartialState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newPartialState };

    const changedKeys = Object.keys(newPartialState);

    if (changedKeys.length === 0) return;
    // 1. Save to LocalStorage after update
    this.saveToStorage();

    // 2. Notify global listeners
    this.notify(changedKeys);

    // 3. Notify single-key listeners (called per changed key)
    changedKeys.forEach((key) => {
      if (this.keyedListeners.has(key)) {
        this.keyedListeners.get(key).forEach((listener) => {
          console.log(`Notifying listener for key: ${key}`);
          listener(
            key, // changed key
            this.state[key], // new value
            oldState[key], // old value
            this.state // full state
          );
        });
      }
    });

    // 4. Notify multi-key group listeners (called ONCE per setState)
    this.groupListeners.forEach((listenerSet, watchedKeys) => {
      const relevantChanges = changedKeys.filter((k) => watchedKeys.includes(k));

      if (relevantChanges.length > 0) {
        const changes = {};
        relevantChanges.forEach((key) => {
          changes[key] = {
            newValue: this.state[key],
            oldValue: oldState[key],
          };
        });

        listenerSet.forEach((listener) => {
          listener(changes, this.state, oldState);
        });
      }
    });
  },

  // Subscribe to ALL changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  // Subscribe to one or multiple keys
  subscribeTo(keys, listener, options = {}) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const { batch = false } = options; // batch: true = group mode

    if (batch && keyArray.length > 1) {
      // === Multi-key batch mode (fires once per setState) ===
      const keySet = JSON.stringify(keyArray.sort()); // stable key for Map

      if (!this.groupListeners.has(keySet)) {
        this.groupListeners.set(keySet, new Set());
      }
      this.groupListeners.get(keySet).add(listener);

      return () => {
        const set = this.groupListeners.get(keySet);
        if (set) {
          set.delete(listener);
          if (set.size === 0) this.groupListeners.delete(keySet);
        }
      };
    } else {
      // === Original per-key mode ===
      const unsubscribers = keyArray.map((key) => {
        if (!this.keyedListeners.has(key)) {
          this.keyedListeners.set(key, new Set());
        }
        this.keyedListeners.get(key).add(listener);

        return () => {
          const set = this.keyedListeners.get(key);
          if (set) {
            set.delete(listener);
            if (set.size === 0) this.keyedListeners.delete(key);
          }
        };
      });

      return () => unsubscribers.forEach((unsub) => unsub());
    }
  },

  notify(changedKeys) {
    this.listeners.forEach((listener) => listener(this.state, changedKeys));
  },

  // Load from LocalStorage
  loadFromStorage() {
    console.log('Loading state from LocalStorage...');
    if (typeof localStorage === 'undefined') return;
    // localStorage.removeItem(this.STORAGE_KEY); // Clear storage for testing
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded state from LocalStorage:', parsed);
        if (parsed.previewColor) {
          parsed.previewColor = new ColorModel(parsed.previewColor);
        }
        if (parsed.userColor) {
          parsed.userColor = new ColorModel(parsed.userColor);
        }

        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from LocalStorage:', e);
    }
  },

  // Save to LocalStorage
  saveToStorage() {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state to LocalStorage:', e);
    }
  },
};
store.loadFromStorage();
export default store;

/***
// 1. Single key 
store.subscribeTo('count', (newVal, oldVal, state) => {
  console.log(`Count changed: ${oldVal} → ${newVal}`);
});

// 2. Multiple keys - BATCH mode (recommended for groups)
const unsubscribeGroup = store.subscribeTo(
  ['count', 'currentRoute', 'user'],
  (changes, newState, oldState) => {
    console.log('Batch update - one of these changed:', Object.keys(changes));

    if (changes.count) {
      console.log('Count:', changes.count.oldValue, '→', changes.count.newValue);
    }
    if (changes.currentRoute) {
      console.log('Route changed to:', changes.currentRoute.newValue);
    }
  },
  { batch: true }          // ← This enables batch mode
);

// 3. Multiple keys without batch (still fires per key)
store.subscribeTo(['todos', 'colorSpace'], (newVal, oldVal) => {
  console.log('Individual notification');
}, { batch: false });
 */
