/**
 * ColorSteps class represents a collection of color steps within a specific color space. It encapsulates properties such as the name of the color, the color space used, an array of colors, and a locked state indicating whether the color steps can be modified. The class provides methods for serialization to JSON format and allows for initialization from either a color name or an object containing the relevant properties. Each instance is assigned a unique identifier for easy reference.
 */

class ColorSteps {
  /**
   *
   * @param {string|object} colorNameOrObj - The name of the color or an object containing color step properties.
   * @param {string} colorSpace - The color space used (default is 'hsluv').
   * @param {Array} colors - An array of colors (default is an empty array).
   * @param {boolean} locked - Indicates whether the color steps are locked (default is false).
   * This constructor initializes a new instance of the ColorSteps class. If an object is provided, it extracts the properties from the object; otherwise, it uses the provided color name, color space, colors array, and locked state. The constructor also generates a unique identifier for the instance. This setup allows for flexible creation of ColorSteps instances, either from existing data or by specifying individual properties.
   */
  constructor(colorNameOrObj, colorSpace = 'hsluv', colors = [], locked = false) {
    if (typeof colorNameOrObj === 'object' && colorNameOrObj !== null) {
      const source = colorNameOrObj;
      this.colorName = source.colorName ?? 'Color Name Goes Here';
      this.colorSpace = source.colorSpace ?? 'hsluv';
      this.colors = source.colors ?? [];
      this.locked = source.locked ?? false;
    } else {
      this.colorName = colorNameOrObj;
      this.colorSpace = colorSpace;
      this.colors = colors;
      this.locked = locked;
    }
    this.id = 'steps-' + crypto.randomUUID().slice(0, 8);
  }

  /**
   * @returns {void} Sets the color space for the color steps.
   */
  set colorSpace(value) {
    this._colorSpace = value;
  }

  /**
   * @returns {string} Gets the color space of the color steps.
   */
  get colorSpace() {
    return this._colorSpace;
  }

  /**
   * @returns {void} Sets the name of the color for the color steps.
   */
  set colorName(value) {
    this._colorName = value;
  }
  /**
   * @returns {string} Gets the name of the color for the color steps.
   */
  get colorName() {
    return this._colorName;
  }
  /**
   * @returns {void} Sets the array of colors for the color steps.
   */
  set colors(value) {
    this._colors = value;
  }
  /**
   * @returns {Array} Gets the array of colors for the color steps.
   */
  get colors() {
    return this._colors;
  }
  /**
   * @returns {boolean} Gets the locked state for the color steps.
   */
  get locked() {
    return this._locked;
  }
  /**
   * Sets the locked state for the color steps.
   * @param {boolean} value - The locked state to set.
   */
  set locked(value) {
    this._locked = value;
  }

  /**
   * @returns {Object} A plain object representation of the color steps.
   */
  toJSON() {
    return {
      id: this.id,
      colorName: this._colorName,
      colorSpace: this._colorSpace,
      colors: this._colors,
      locked: this._locked,
    };
  }
}

export { ColorSteps, ColorSteps as default };
