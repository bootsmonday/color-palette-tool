import ColorModel from './ColorModel.js';
import ColorSteps from './ColorSteps.js';
class ColorPalette {
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
