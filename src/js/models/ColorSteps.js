class ColorSteps {
  constructor(colorName, colorSpace = 'hsluv', colors = [], locked = false) {
    this.colorName = colorName;
    this.colorSpace = colorSpace;
    this.colors = colors;
    this.locked = locked;
    this.id = 'steps-' + crypto.randomUUID().slice(0, 8);
  }

  set colorSpace(value) {
    this._colorSpace = value;
  }
  get colorSpace() {
    return this._colorSpace;
  }
  set colorName(value) {
    this._colorName = value;
  }
  get colorName() {
    return this._colorName;
  }
  set colors(value) {
    this._colors = value;
  }
  get colors() {
    return this._colors;
  }
  get locked() {
    return this._locked;
  }
  set locked(value) {
    this._locked = value;
  }
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
