import { store } from '../store.js';
import Color from 'colorjs.io';
import { ColorModel } from '../models/ColorModel.js';

class ColorTokens extends HTMLElement {
  constructor() {
    super();
  }
  render() {
    this.innerHTML += `
      <div class="corn-row">
        <div class="corn-col-12">
          <h2>Tokens</h2>
            <fieldset class="corn-form--item corn-toggle-group corn-toggle--sm" aria-labelledby="token-format">
              <legend id="token-format">Token Format</legend>
              <div class="corn-toggles">
                <div class="corn-toggle">
                  <input type="radio" id="corncob-tokens" name="token-type" value="corncob" checked />
                  <label for="corncob-tokens">Corncob</label>
                </div>
                <div class="corn-toggle">
                  <input type="radio" id="tailwind-tokens" name="token-type" value="tailwind" />
                  <label for="tailwind-tokens">Tailwind</label>
                </div>
                <div class="corn-toggle">
                  <input type="radio" id="generic-tokens" name="token-type" value="generic" />
                  <label for="generic-tokens">Generic</label>
                </div>                              
              </div>
            </fieldset>
            <fieldset class="corn-form--item corn-toggle-group corn-toggle--sm" aria-labelledby="color-space">
              <legend id="color-space">CSS Color Space:</legend>
              <div class="corn-toggles">
                <div class="corn-toggle">
                  <input type="radio" id="hex-color-space" name="color-space" value="hex" checked />
                  <label for="hex-color-space">Hex</label>
                </div>
                <div class="corn-toggle">
                  <input type="radio" id="oklch-color-space" name="color-space" value="oklch" />
                  <label for="oklch-color-space">OKLCH</label>
                </div>                         
              </div>
            </fieldset>
            <fieldset class="corn-form--item corn-toggle-group corn-toggle--sm" aria-labelledby="color-scheme-support">
              <legend id="color-scheme-support">Color Scheme:</legend>
              <div class="corn-toggles">
                <div class="corn-toggle">
                  <input type="radio" id="default-mode" name="color-scheme-token" value="default" checked />
                  <label for="default-mode">default</label>
                </div>
                <div class="corn-toggle">
                  <input type="radio" id="light-dark-scheme" name="color-scheme-token" value="light-dark" />
                  <label for="light-dark-scheme">light dark</label>
                </div>                         
              </div>
            </fieldset>                             
          <xmp id="color-tokens">tokens will go here</xmp>
        </div>
      </div>
      `;
  }

  computeTokens(style, palette) {}
  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribeTo('workingPalette', () => this.update());
    this.addEventListeners();
    this.update();
  }
  addEventListeners() {
    // Add event listeners here
    const tokenTypeInputs = this.querySelectorAll('input[name="token-type"]');
    tokenTypeInputs.forEach((input) => {
      input.addEventListener('change', () => this.update());
    });

    const colorSpaceInputs = this.querySelectorAll('input[name="color-space"]');
    colorSpaceInputs.forEach((input) => {
      input.addEventListener('change', () => this.update());
    });

    const colorSchemeInputs = this.querySelectorAll('input[name="color-scheme-token"]');
    colorSchemeInputs.forEach((input) => {
      input.addEventListener('change', () => this.update());
    });
  }
  update() {
    const { workingPalette } = store.getState();
    const tokenContainer = this.querySelector('#color-tokens');
    const cssColorSpace = this.querySelector('input[name="color-space"]:checked')?.value || 'hex';
    if (!tokenContainer) return;
    let tokenType, tokenPrefix, stepMultiplier, colorScheme;
    tokenType = this.querySelector('input[name="token-type"]:checked')?.value || 'generic';
    colorScheme = this.querySelector('input[name="color-scheme-token"]:checked')?.value || 'default';

    if (tokenType === 'corncob') {
      tokenPrefix = '--cc';
      stepMultiplier = 10;
    } else if (tokenType === 'tailwind') {
      tokenPrefix = '--color';
      stepMultiplier = 100;
    } else {
      tokenPrefix = '-';
      stepMultiplier = 10;
    }

    // Clear existing tokens
    tokenContainer.innerHTML = '';

    if (workingPalette && workingPalette.steps) {
      tokenContainer.innerHTML += `/* Color Tokens for Palette: ${workingPalette.name} */\n`;
      tokenContainer.innerHTML += `/* Color Space: ${cssColorSpace} */\n`;
      tokenContainer.innerHTML += `/* Design System: ${tokenType} */\n\n`;
      tokenContainer.innerHTML += `:root, :host {\n`;
      if (colorScheme === 'light-dark') {
        tokenContainer.innerHTML += `\n\tcolor-scheme: light dark;\n`;
      }
      workingPalette.steps.forEach((step, index) => {
        tokenContainer.innerHTML += `\n\t/* ${step.colorName} */\n`;
        const colorCount = step.colors.length;
        step.colors.forEach((color, colorIndex, colors) => {
          const colorModel = new ColorModel(color);
          let colorValue = colorModel.format(cssColorSpace);

          if (colorScheme === 'light-dark') {
            const oppositeIndex = colors.length - 1 - colorIndex;
            const oppositeColor = colors[oppositeIndex];
            const oppositeColorModel = new ColorModel(oppositeColor);
            const oppositeColorValue = oppositeColorModel.format(cssColorSpace);
            colorValue = `light-dark(${colorValue}, ${oppositeColorValue})`;
          }
          if (tokenType === 'tailwind' && colorIndex === 0) {
            tokenContainer.innerHTML += `\t${tokenPrefix}-${step.colorName.toLowerCase()}-${((colorIndex + 1) * stepMultiplier) / 2}: ${colorValue};\n`;
          }
          if (tokenType === 'tailwind' && colorIndex === step.colors.length - 1) {
            tokenContainer.innerHTML += `\t${tokenPrefix}-${step.colorName.toLowerCase()}-${(colorIndex + 1) * stepMultiplier - 50}: ${colorValue};\n`;
          } else {
            tokenContainer.innerHTML += `\t${tokenPrefix}-${step.colorName.toLowerCase()}-${(colorIndex + 1) * stepMultiplier}: ${colorValue};\n`;
          }
        });
      });
      tokenContainer.innerHTML += `}\n`;
      tokenContainer.innerHTML += `\n/* End of Color Tokens */\n`;
      tokenContainer.innerHTML += `/* Thanks BootsMonday! */\n`;
    }
  }
}

customElements.define('color-tokens', ColorTokens);
