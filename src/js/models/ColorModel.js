import Color from 'colorjs.io';

class ColorModel {
  constructor(modeOrObj, hue = 180, saturation = 50, lightness = 47.5) {
    if (typeof modeOrObj === 'object' && modeOrObj !== null) {
      const source = modeOrObj;
      const colorSpace = source.colorSpace ?? source._colorSpace ?? 'okhsl';
      this.colorSpace = colorSpace;
      this.hue = source.hue ?? source._hue ?? hue;

      const saturationValue = source._saturation ?? source.saturation ?? saturation;
      const lightnessValue = source._lightness ?? source.lightness ?? lightness;

      this.saturation = colorSpace === 'hsluv' ? saturationValue : saturationValue <= 1 ? saturationValue * 100 : saturationValue;
      this.lightness = colorSpace === 'hsluv' ? lightnessValue : lightnessValue <= 1 ? lightnessValue * 100 : lightnessValue;

      this.id = source.id ?? crypto.randomUUID();
    } else {
      this.colorSpace = modeOrObj;
      this.hue = hue;
      this.saturation = saturation;
      this.lightness = lightness;
      this.id = crypto.randomUUID();
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
    };
  }
  set hex(value) {
    this._hex = value;
  }
}

export { ColorModel, ColorModel as default };
