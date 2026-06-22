class ColorPalette {
  constructor(nameOrObj = 'Palette Name Goes Here', colorSpace = 'okhsl', steps = []) {
    if (typeof nameOrObj === 'object' && nameOrObj !== null) {
      const source = nameOrObj;
      this.id = source.id ?? 'palette-' + crypto.randomUUID().slice(0, 8);
      this.name = source.name ?? 'Palette Name Goes Here';
      this.colorSpace = source.colorSpace ?? 'okhsl';
      this.steps = source.steps ?? [];
      this.createdAt = source.createdAt ?? new Date().toISOString();
    } else {
      this.id = 'palette-' + crypto.randomUUID().slice(0, 8);
      this.name = nameOrObj;
      this.colorSpace = colorSpace;
      this.steps = steps;
      this.createdAt = new Date().toISOString();
    }
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
