class ColorSteps {
  constructor(colorName, colorSpace = 'hsluv', colors = []) {
    this.colorName = colorName;
    this.colorSpace = colorSpace;
    this.colors = colors;
    this.id = crypto.randomUUID();
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
  toJSON() {
    return {
      id: this.id,
      colorName: this._colorName,
      colorSpace: this._colorSpace,
      colors: this._colors,
    };
  }
}

export { ColorSteps, ColorSteps as default };
