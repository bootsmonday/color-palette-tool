import { store } from '../store.js';
import Color from 'colorjs.io';
import { ColorModel } from '../models/ColorModel.js';
const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
class HexPreview extends HTMLElement {
  constructor() {
    super();
  }
  render() {
    this.innerHTML = `
      <div>

      <form class="corn-form" id="hex-seed-form">
        <div class="corn-row">
          <div class="corn-col-4">
            <div class="corn-form--item" id="hex-seed-item">
              <div class="corn-text-input corn-text-input--xs">
                <input id="hex-seed-input" name="input" placeholder="Hex value" value=""/>
                <label for="hex-seed-input" class="corn-assistive-text">
                  Enter a hex seed value
                </label>
              </div>
              <div class="corn-status"></div>
            </div>
          </div>
          <div class="corn-col-8">
            <div class="corn-button-group">
              <button class="corn-button corn-button--xs" type="submit">check</button>
            </div>
          </div>
        </div>
      </form>
      <div id="hex-ghost-text" class="hex-preview-ghost-text">
        See how a hex value would map to a palette color in HSLuv and OKHSL color spaces. This will show you the closest color that maps to your value and maintains the mathematically accessible contrast ratio with the other color steps.
      </div>
      <div id="hex-preview" style="margin-top: var(--cc-size-0);">

        <form class="corn-form" id="hex-preview-form">
          <div class="corn-row">
            <div class="corn-col-12">
              <p id="base-hex-color" class="hex-preview hex-user">#</p>
            </div>
            <div class="corn-col-6">
              <div id="closest-hsluv-preview" class="hex-preview">
                <p>#</p>
                <button type="submit" class="corn-button corn-button--xs" id="copy-hsluv-hex" value="hsluv">USE HSLUV</button>
              </div>
            </div>
            <div class="corn-col-6">
              <div id="closest-okhsl-preview" class="hex-preview">
                <p>#</p>                    
                <button type="submit" class="corn-button corn-button--xs" id="copy-okhsl-hex" value="okhsl">USE OKHSL</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    `;
  }
  connectedCallback() {
    this.closestHsluvColor = null;
    this.closestOkhslColor = null;
    this.render();
    this.unsubscribe = store.subscribeTo(['paletteName', 'colorSpace'], () => this.update(), { batch: true });
    this.addEventListeners();
  }
  addEventListeners() {
    this.addEventListener('change', this);
    this.addEventListener('submit', this);
    this.addEventListener('click', this);
  }

  handleEvent(event) {
    // console.log('PalettePage event:', event.type, 'target:', event.target);
    // event.stopPropagation();
    // event.preventDefault();
    if (event.type === 'click') {
      console.log('HexPreview.js Click event:', event.target, this);
    }
    if (event.type === 'change') {
      const target = event.target;
      if (target.name === 'color-space') {
        store.setState({ colorSpace: target.value });
      }
    }
    if (event.type === 'submit') {
      console.log('HexPreview.js Form submitted:', event.target.id);
      event.preventDefault();
      event.stopPropagation();
      if (event.target.id === 'hex-preview-form') {
        const colorToCopy = event.submitter.value;
        console.log('Copying color for:', colorToCopy);
        if (colorToCopy === 'hsluv') {
          const color = new ColorModel({ colorSpace: colorToCopy, hue: this.closestHsluvColor.h, saturation: this.closestHsluvColor.s, lightness: this.closestHsluvColor.l });
          store.setState({ previewColor: color, colorSpace: 'hsluv' });
        } else if (colorToCopy === 'okhsl') {
          const color = new ColorModel({ colorSpace: colorToCopy, hue: this.closestOkhslColor.h, saturation: this.closestOkhslColor.s * 100, lightness: this.closestOkhslColor.l * 100 });
          console.log('Color to copy:', color);
          store.setState({ previewColor: color, colorSpace: 'okhsl' });
        }
      }
      if (event.target.id === 'hex-seed-form') {
        const formData = new FormData(event.target);
        let hexSeed = formData.get('input');
        console.log('Hex seed input:', hexSeed);
        if (hexSeed) {
          // Validate hex seed format (basic validation for 3 or 6 hex digits, with optional #)
          const isValidHex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexSeed);
          if (!isValidHex) {
            this.querySelector('#hex-seed-item').classList.add('corn-status--error');
            this.querySelector('#hex-seed-item .corn-status').textContent = 'Invalid hex format.';
            this.querySelector('#hex-preview').style.display = 'none';
            return;
          } else {
            this.querySelector('#hex-seed-item').classList.remove('corn-status--error');
            this.querySelector('#hex-seed-item .corn-status').textContent = '';
            hexSeed.startsWith('#') || (hexSeed = '#' + hexSeed);
            this.calculateClosestColor(hexSeed);
          }
        } else {
          this.querySelector('#hex-ghost-text').style.display = 'block';
          this.querySelector('#hex-preview').style.display = 'none';
        }
        console.log('Hex seed submitted:', hexSeed);
        return false;
      }
    }
  }

  calculateClosestColor(hex) {
    const color = new Color(hex);
    const hsluvColor = color.to('hsluv');
    const okhslColor = color.to('okhsl');
    const hsluvLightness = hsluvColor.l;
    const okhslLightness = okhslColor.l * 100; // Convert to percentage for OKHSL
    const closestHsluvLightness = lightnessSteps.reduce((prev, curr) => (Math.abs(curr - hsluvLightness) < Math.abs(prev - hsluvLightness) ? curr : prev));
    const closestOkhslLightness = lightnessSteps.reduce((prev, curr) => (Math.abs(curr - okhslLightness) < Math.abs(prev - okhslLightness) ? curr : prev));
    this.closestHsluvColor = new Color('hsluv', [hsluvColor.h, hsluvColor.s, closestHsluvLightness]);
    console.log('Closest HSLuv color:', this.closestHsluvColor.toString());
    this.closestOkhslColor = new Color('okhsl', [okhslColor.h, okhslColor.s, closestOkhslLightness / 100]);
    this.querySelector('#hex-ghost-text').style.display = 'none';
    this.querySelector('#hex-preview').style.backgroundColor = color.toString({ format: 'hex' });
    this.querySelector('#hex-preview').style.display = 'block';
    this.querySelector('#hex-preview').classList.remove('islight', 'isdark');
    this.querySelector('#hex-preview').classList.add(hsluvLightness < 50 ? 'isdark' : 'islight');
    this.querySelector('#base-hex-color').innerText = `${color.toString({ format: 'hex' })}`;
    this.querySelector('#closest-hsluv-preview').style.backgroundColor = this.closestHsluvColor.toString({ format: 'hex' });
    this.querySelector('#closest-hsluv-preview p').innerText = `${this.closestHsluvColor.toString({ format: 'hex' })}`;
    this.querySelector('#closest-okhsl-preview p').innerText = `${this.closestOkhslColor.toString({ format: 'hex' })}`;
    this.querySelector('#closest-okhsl-preview').style.backgroundColor = this.closestOkhslColor.toString({ format: 'hex' });

    // console.log(okhslLightness);
    // console.log('Input color in HSLuv:', hsluvColor.toString());
    // console.log('Input color in OKHSL:', okhslColor.toString());
    // console.log('HSLuv Lightness:', hsluvLightness);
    // console.log('OKHSL Lightness:', okhslLightness);
    // console.log('color.toString():', color.to('hsluv').toString());
    // Placeholder for closest color calculation logic
    // In a real implementation, this would compare the hex color to the palette and find the closest match
    return '#ff6000'; // Example closest match (this should be calculated based on the palette)
  }

  removeEventListeners() {
    this.removeEventListener('change', this);
    this.removeEventListener('submit', this);
  }
  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.removeEventListeners();
  }

  update() {
    // const {  colorSpace } = store.getState();
    // console.log('Updating color space display to:', colorSpace);
    // this.querySelectorAll('input[name="color-space"]').forEach((input) => {
    //   input.checked = input.value === colorSpace;
    // });
    // const paletteNameElement = this.querySelector('#palette-name');
    // paletteNameElement.textContent = paletteName;
  }
}

customElements.define('hex-preview', HexPreview);
