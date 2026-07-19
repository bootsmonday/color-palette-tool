import Color from 'colorjs.io';

/**
 * ColorModel is a class that represents a color in a specific color space (either 'okhsl' or 'hsluv'). It provides methods to get and set the color's properties, such as hue, saturation, lightness, and color space. The class also includes methods to convert the color to different formats (e.g., hex) and to serialize/deserialize the color object to/from JSON. The ColorModel class is designed to be used in applications that require color manipulation and representation in various color spaces.
 */
class ColorModel {
  /**
   *
   * @param {*} colorSpaceorObj
   * @param {*} hue
   * @param {*} saturation
   * @param {*} lightness
   * @param {*} locked
   *
   * This is the constructor for the ColorModel class. It initializes a new instance of the ColorModel with specified properties. The constructor can accept either an object containing color properties or individual parameters for color space, hue, saturation, lightness, and locked state. It sets the internal properties of the instance based on the provided values, ensuring that saturation and lightness are appropriately scaled based on the color space. The constructor also generates a unique ID for the color instance and initializes a fixed array of lightness steps for use in color manipulation.
   *
   */
  constructor(colorSpaceorObj, hue = 180, saturation = 50, lightness = 47.5, locked = false) {
    if (typeof colorSpaceorObj === 'object' && colorSpaceorObj !== null) {
      const source = colorSpaceorObj;
      const colorSpaceValue = source.colorSpace ?? source._colorSpace ?? 'okhsl';
      this.colorSpace = colorSpaceValue;
      this.hue = source.hue ?? source._hue ?? hue;

      const saturationValue = source._saturation ?? source.saturation ?? saturation;
      const lightnessValue = source._lightness ?? source.lightness ?? lightness;

      this.saturation = colorSpaceValue === 'hsluv' ? saturationValue : saturationValue <= 1 ? saturationValue * 100 : saturationValue;
      this.lightness = colorSpaceValue === 'hsluv' ? lightnessValue : lightnessValue <= 1 ? lightnessValue * 100 : lightnessValue;

      this.id = source.id ?? 'color-' + crypto.randomUUID().slice(0, 8);
      this.locked = source.locked ?? locked;
    } else {
      this.colorSpace = colorSpaceorObj ?? 'okhsl';
      this.hue = hue;
      this.saturation = colorSpaceorObj === 'hsluv' ? saturation : saturation <= 1 ? saturation * 100 : saturation;
      this.lightness = colorSpaceorObj === 'hsluv' ? lightness : lightness <= 1 ? lightness * 100 : lightness;
      this.locked = locked;
      this.id = 'color-' + crypto.randomUUID().slice(0, 8);
    }
    this.fixedLightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
  }

  /**
   * Sets the color space of the color model.
   */
  set colorSpace(value) {
    this._colorSpace = value;
  }

  /**
   * Gets the color space of the color model.
   */
  get colorSpace() {
    return this._colorSpace;
  }

  /**
   * Sets the hue of the color model.
   */
  set hue(value) {
    value = +parseFloat(value).toFixed(2);
    this._hue = value;
  }

  /**
   * Gets the hue of the color model.
   */
  get hue() {
    return this._hue;
  }

  /**
   * Sets the saturation of the color model.
   */
  get hex() {
    const color = this.getColor();
    return color.toString({ format: 'hex', precision: 0 });
  }

  /**
   * Sets the hex value of the color model. It converts the provided hex value to the appropriate color space and updates the hue, saturation, and lightness properties accordingly. The method uses the Color class from 'colorjs.io' to perform the conversion and ensures that the saturation and lightness values are scaled correctly based on the color space.
   */
  set hex(value) {
    const color = new Color(value);
    const [hue, saturation, lightness] = color.to(this.colorSpace).coords;
    this.hue = hue;
    this.saturation = this.colorSpace === 'okhsl' ? +(saturation * 100).toFixed(2) : +saturation.toFixed(2);
    this.lightness = this.colorSpace === 'okhsl' ? +(lightness * 100).toFixed(2) : +lightness.toFixed(2);
  }

  /**
   * Sets the saturation of the color model. It ensures that the saturation value is a floating-point number rounded to two decimal places and updates the internal _saturation property accordingly.
   */
  set saturation(value) {
    value = +parseFloat(value).toFixed(2);
    this._saturation = value;
  }

  /**
   * Gets the saturation of the color model. It returns the current value of the internal _saturation property, which represents the saturation level of the color in the specified color space.
   */
  get saturation() {
    return this._saturation;
  }

  /**
   * Sets the lightness of the color model. It ensures that the lightness value is a floating-point number rounded to two decimal places and updates the internal _lightness property accordingly.
   */
  set lightness(value) {
    value = +parseFloat(value).toFixed(2);
    this._lightness = value;
  }

  /**
   * Gets the lightness of the color model. It returns the current value of the internal _lightness property, which represents the lightness level of the color in the specified color space.
   */
  get lightness() {
    return this._lightness;
  }

  /**
   * Sets the locked state of the color model. It updates the internal _locked property to indicate whether the color is locked or not.
   */
  set locked(value) {
    this._locked = value;
  }

  /**
   * Gets the locked state of the color model. It returns the current value of the internal _locked property, indicating whether the color is locked or not.
   */
  get locked() {
    return this._locked;
  }

  /**
   * Formats the color in the specified color space and returns it as a string. It uses the getColor method to retrieve the current color and converts it to the desired format.
   * @param {string} colorSpace - The target color space for formatting (e.g., 'okhsl', 'hsluv').
   * @returns {string} The formatted color string in the specified color space.
   */
  format(colorSpace) {
    const color = this.getColor();
    return color.toString({ format: colorSpace });
  }

  /**
   * Retrieves the current color as a Color object based on the internal properties of the ColorModel. It constructs a new Color instance using the specified color space, hue, saturation, and lightness values.
   * @returns {Color} A Color object representing the current color in the specified color space.
   */
  getColor() {
    return new Color(this.colorSpace, [this.hue, this.colorSpace === 'okhsl' ? +(this.saturation / 100).toFixed(4) : this.saturation, this.colorSpace === 'okhsl' ? +(this.lightness / 100).toFixed(4) : this.lightness]);
  }

  /**
   * Get the locked state of the color model. It returns the current value of the internal _locked property, indicating whether the color is locked or not.
   * @returns {boolean} The locked state of the color model.
   */
  get locked() {
    return this._locked;
  }

  /**
   * Set the locked state of the color model. It updates the internal _locked property to indicate whether the color is locked or not.
   */
  set locked(value) {
    this._locked = value;
  }

  /**
   *
   * @param {*} colorSpace
   * @returns
   *  formats the color in the specified color space and returns it as a string. It uses the getColor method to retrieve the current color and converts it to the desired format.
   */
  format(colorSpace) {
    const color = this.getColor();
    return color.toString({ format: colorSpace });
  }

  /**
   *
   * @returns
   * Retrieves the current color as a Color object based on the internal properties of the ColorModel. It constructs a new Color instance using the specified color space, hue, saturation, and lightness values.
   */
  getColor() {
    return new Color(this.colorSpace, [this.hue, this.colorSpace === 'okhsl' ? +(this.saturation / 100).toFixed(4) : this.saturation, this.colorSpace === 'okhsl' ? +(this.lightness / 100).toFixed(4) : this.lightness]);
  }

  /**
   *
   * @returns
   * Serializes the ColorModel instance to a JSON object. It returns an object containing the id, colorSpace, hue, saturation, lightness, and locked properties of the color model. This allows for easy storage and transmission of the color model's state in a structured format.
   */
  toJSON() {
    return {
      id: this.id,
      colorSpace: this._colorSpace,
      hue: this._hue,
      saturation: this._saturation,
      lightness: this._lightness,
      locked: this._locked,
    };
  }

  /**
   *
   * @param {*} json
   * @returns
   * Deserializes a JSON object to populate the ColorModel instance. It takes a JSON object as input and updates the internal properties of the color model based on the values in the JSON. This allows for easy reconstruction of a ColorModel instance from a previously serialized state, enabling persistence and retrieval of color data.
   */
  fromJSON(json) {
    this.id = json.id;
    this._colorSpace = json.colorSpace;
    this._hue = json.hue;
    this._saturation = json.saturation;
    this._lightness = json.lightness;
    this._locked = json.locked;
    return this;
  }
}

export { ColorModel, ColorModel as default };
