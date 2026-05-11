class ColorPalette {
  constructor(name = 'My Awesome Palette', colorSpace = 'okhsl', steps = []) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.colorSpace = colorSpace;
    this.createdAt = new Date();
    this.steps = steps;
  }
  set name(value) {
    this._name = value;
  }
  get name() {
    return this._name;
  }
  set steps(value) {
    this._steps = value;
  }
  get steps() {
    return this._steps;
  }
  toJSON() {
    return {
      id: this.id,
      name: this._name,
      colorSpace: this.colorSpace,
      createdAt: this.createdAt,
      steps: this._steps,
    };
  }
}

export { ColorPalette, ColorPalette as default };
