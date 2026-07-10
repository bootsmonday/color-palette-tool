import Color from 'colorjs.io';

class ColorModel {
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
  set colorSpace(value) {
    this._colorSpace = value;
  }
  get colorSpace() {
    return this._colorSpace;
  }
  set hue(value) {
    value = +parseFloat(value).toFixed(2);
    this._hue = value;
  }
  get hue() {
    return this._hue;
  }
  get hex() {
    const color = this.getColor();
    return color.toString({ format: 'hex', precision: 0 });
  }
  set hex(value) {
    const color = new Color(value);
    const [hue, saturation, lightness] = color.to(this.colorSpace).coords;
    this.hue = hue;
    this.saturation = this.colorSpace === 'okhsl' ? +(saturation * 100).toFixed(2) : +saturation.toFixed(2);
    this.lightness = this.colorSpace === 'okhsl' ? +(lightness * 100).toFixed(2) : +lightness.toFixed(2);
  }
  set saturation(value) {
    value = +parseFloat(value).toFixed(2);
    this._saturation = value;
  }
  get saturation() {
    return this._saturation;
  }
  set lightness(value) {
    value = +parseFloat(value).toFixed(2);
    this._lightness = value;
  }
  get lightness() {
    return this._lightness;
  }
  get locked() {
    return this._locked;
  }
  set locked(value) {
    this._locked = value;
  }
  format(colorSpace) {
    const color = this.getColor();
    return color.toString({ format: colorSpace });
  }
  getColor() {
    return new Color(this.colorSpace, [this.hue, this.colorSpace === 'okhsl' ? +(this.saturation / 100).toFixed(4) : this.saturation, this.colorSpace === 'okhsl' ? +(this.lightness / 100).toFixed(4) : this.lightness]);
  }
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
