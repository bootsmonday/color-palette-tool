import ColorModel from './ColorModel.js';
import ColorSteps from './ColorSteps.js';

/**
 * The ColorPalette class represents a color palette that contains a user-defined color, a name, a color space, and an array of color steps. It provides methods to serialize and deserialize the palette to and from JSON format. The constructor can accept either a name and color space or an object containing the palette properties. The class ensures that the palette has a unique ID, a creation timestamp, and properly initializes its properties based on the provided input.
 */
class ColorPalette {
  /**
   * Creates an instance of ColorPalette.
   * @param {string|object} nameOrObj - The name of the palette or an object containing palette properties.
   * @param {string} colorSpace - The color space of the palette (default is 'okhsl').
   * @param {Array} steps - An array of ColorSteps instances (default is an empty array).
   * This constructor initializes a new ColorPalette instance. If an object is provided, it extracts the properties from the object; otherwise, it uses the provided name, color space, and steps. It also generates a unique ID for the palette and sets the creation timestamp. The userColor property is initialized as a new ColorModel instance.
   * The steps property is populated with instances of ColorSteps based on the provided steps array.
   * The constructor ensures that the palette is properly set up for use in applications that require color manipulation and representation.
   * @example
   * const palette = new ColorPalette('My Palette', 'okhsl', [new ColorSteps(), new ColorSteps()]);
   * const paletteFromObj = new ColorPalette({ name: 'My Palette', colorSpace: 'okhsl', steps: [new ColorSteps()] });
   */
  constructor(nameOrObj = 'Palette Name Goes Here', colorSpace = 'okhsl', steps = []) {
    if (typeof nameOrObj === 'object' && nameOrObj !== null) {
      const source = nameOrObj;
      this.userColor = new ColorModel(source.userColor) ?? new ColorModel();
      this.id = source.id ?? 'palette-' + crypto.randomUUID().slice(0, 8);
      this.name = source.name ?? 'Palette Name Goes Here';
      this.colorSpace = source.colorSpace ?? 'okhsl';
      this.steps = Array.isArray(source.steps) ? source.steps.map((step) => new ColorSteps(step)) : [];
      this.createdAt = source.createdAt ?? new Date().toISOString();
    } else {
      this.userColor = new ColorModel();
      this.id = 'palette-' + crypto.randomUUID().slice(0, 8);
      this.name = nameOrObj;
      this.colorSpace = colorSpace;
      this.steps = Array.isArray(steps) ? steps.map((step) => new ColorSteps(step)) : [];
      this.createdAt = new Date().toISOString();
    }
  }

  /**
   *
   * @returns {object} A JSON representation of the ColorPalette instance.
   * This method serializes the ColorPalette instance into a JSON object. It includes the palette's unique ID, user-defined color, name, color space, creation timestamp, and an array of color steps. The userColor is represented as a ColorModel instance, and the steps are represented as an array of ColorSteps instances. This JSON representation can be used for storage, transmission, or further processing in applications that require color palette management.
   */
  toJSON() {
    return {
      id: this.id,
      userColor: this.userColor,
      name: this.name,
      colorSpace: this.colorSpace,
      createdAt: this.createdAt,
      steps: this.steps,
    };
  }

  /**
   *
   * @param {object} json - A JSON object representing a ColorPalette instance.
   * @returns {ColorPalette} The ColorPalette instance with properties set from the JSON object.
   * This method deserializes a JSON object into a ColorPalette instance. It extracts the properties from the provided JSON object and sets them on the current instance. The userColor is initialized as a new ColorModel instance, and the steps are populated with instances of ColorSteps based on the provided steps array. This allows for easy reconstruction of a ColorPalette instance from its JSON representation, enabling seamless data exchange and persistence in applications that manage color palettes.
   */
  fromJSON(json) {
    this.id = json.id;
    this.userColor = new ColorModel(json.userColor);
    this.name = json.name;
    this.colorSpace = json.colorSpace;
    this.createdAt = json.createdAt;
    this.steps = Array.isArray(json.steps) ? json.steps.map((step) => new ColorSteps(step)) : [];
    return this;
  }
}

export { ColorPalette, ColorPalette as default };
