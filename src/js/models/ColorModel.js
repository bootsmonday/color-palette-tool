class ColorModel {
  constructor(modeOrObj, hue = 180, saturation = 50, lightness = 47.5) {
    if (typeof modeOrObj === 'object' && modeOrObj !== null) {
      Object.assign(this, modeOrObj);
    } else {
      this.colorSpace = modeOrObj;
      this.hue = hue;
      this.saturation = saturation;
      this.lightness = lightness;
    }
    this.fixedLightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
    this.id = crypto.randomUUID();
  }
  set colorSpace(value) {
    this._colorSpace = value;
  }
  get colorSpace() {
    return this._colorSpace;
  }
  set hue(value) {
    this._hue = value;
  }
  get hue() {
    return this._hue;
  }
  set saturation(value) {
    this._saturation = value;
  }
  get saturation() {
    return this._colorSpace === 'hsluv' ? this._saturation : this._saturation / 100;
  }
  set lightness(value) {
    this._lightness = value;
  }
  get lightness() {
    return this._colorSpace === 'hsluv' ? this._lightness : this._lightness / 100;
  }
  set hex(value) {
    this._hex = value;
    this.color = new Color(value);
  }
  toHex() {
    return this.color.toString({ format: 'hex' });
  }
  toHSLuv() {
    return this.color.to('hsluv');
  }
  toOKHSL() {
    return this.color.to('okhsl');
  }
}

export { ColorModel, ColorModel as default };
