import { store } from '../store.js';
import bootstrapIconsSprite from 'bootstrap-icons/bootstrap-icons.svg';
import Color from 'colorjs.io';
import { ColorModel } from '../models/ColorModel.js';
const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];
class PalettePage extends HTMLElement {
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
  }

  handleEvent(event) {
    // console.log('PalettePage event:', event.type, 'target:', event.target);
    // event.stopPropagation();
    // event.preventDefault();
    if (event.type === 'change') {
      const target = event.target;
      if (target.name === 'color-space') {
        store.setState({ colorSpace: target.value });
      }
    }
    if (event.type === 'submit') {
      event.preventDefault();
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
        }
        console.log('Hex seed submitted:', hexSeed);
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
    console.log('PalettePage update called');
    const { paletteName, colorSpace } = store.getState();
    console.log('Updating color space display to:', colorSpace);
    console.log('Updating palette name display to:', paletteName);
    this.querySelectorAll('input[name="color-space"]').forEach((input) => {
      input.checked = input.value === colorSpace;
    });
    const paletteNameElement = this.querySelector('#palette-name');
    paletteNameElement.textContent = paletteName;
  }
  render() {
    const { colorSpace, paletteName } = store.getState();
    this.innerHTML = `
      <div class="corn-row">
        <div class="corn-col-12">
          <h1>New Palette Page</h1>
        </div>
      </div>
      <div class="corn-row">
        <div class="corn-col-4">
          <div class="corn-panel">
          <h2>Details</h2>
          <p id="palette-name">${paletteName}</p>
          
            <fieldset class="corn-form--item corn-toggle-group corn-toggle--xs color-space-toggle" aria-labelledby="legend1">
              <legend id="legend1">Choose Color Space</legend>
              <div class="corn-toggles">
                <div class="corn-toggle">
                  <input type="radio" id="colospace1" name="color-space" value="hsluv" ${colorSpace === 'hsluv' ? 'checked' : ''} />
                  <label for="colospace1">hsluv</label>
                </div>
                <div class="corn-toggle">
                  <input type="radio" id="colospace2" name="color-space" value="okhsl" ${colorSpace === 'okhsl' ? 'checked' : ''} />
                  <label for="colospace2">okhsl</label>
                </div>
              </div>
            </fieldset>        
            <p>If you would like to generate a palette based on a hex seed, enter the value below.</p>
            <form class="corn-form" id="hex-seed-form">
              <div class="corn-form--item" id="hex-seed-item">
                <div class="corn-text-input corn-text-input--sm">
                  <input id="hex-seed-input" name="input" placeholder="Hex Seed" value="#b840a0"/>
                  <label for="hex-seed-input" class="corn-assistive-text">
                    Enter a hex seed value
                  </label>
                </div>
                <div class="corn-status"></div>
              </div>
              <div class="corn-button-group">
                <button class="corn-button corn-button--sm" type="submit">Validate</button>
              </div>
            </form>
            <div id="hex-preview" style="margin-top: var(--cc-size-0);">
              <form class="corn-form" id="hex-preview-form">
                <div class="corn-row">
                  <div class="corn-col-12">
                    <div id="base-hex-color" class="hex-preview"></div>
                  </div>
                  <div class="corn-col-6">
                    <div id="closest-hsluv-preview" class="hex-preview">
                      <p></p>
                      <button type="submit" class="corn-button corn-button--xs" id="copy-hsluv-hex" value="hsluv">HSLUV</button>
                    </div>
                  </div>
                  <div class="corn-col-6">
                    <div id="closest-okhsl-preview" class="hex-preview">
                      <p></p>                    
                      <button type="submit" class="corn-button corn-button--xs" id="copy-okhsl-hex" value="okhsl">OKHSL</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>      
        </div>
        <div class="corn-col-8"> 
          <div class="corn-panel">
          <color-form>test</color-form>
            
            <h3>Palette Details</h3>
            <div>Palette preview will go here</div>
          </div>          
        </div>
      </div>
    `;
  }
}

customElements.define('palette-page', PalettePage);
