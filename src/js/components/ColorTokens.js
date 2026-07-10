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
          <div class="corn-form">
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
            <fieldset class="corn-form--item corn-toggle-group corn-toggle--sm" aria-labelledby="token-output-format">
              <legend id="token-output-format">Token Format:</legend>
              <div class="corn-toggles">
                <div class="corn-toggle">
                  <input type="radio" id="css-mode" name="token-format" value="css" checked />
                  <label for="css-mode">CSS</label>
                </div>
                <div class="corn-toggle">
                  <input type="radio" id="figma-mode" name="token-format" value="figma" />
                  <label for="figma-mode">Figma</label>
                </div>                         
              </div>
            </fieldset> 
              <div class="corn-button--group">
                <corn-copy-button class="corn-copy-button" copyselector="#copy-tokens-container xmp" copysuccess="Tokens copied to clipboard"
                  copyfailure="Failed to copy">
                  <button type="button" class="corn-button corn-button--xs" aria-controls="color-tokens" aria-label="Copy tokens to clipboard">
                    copy
                  </button>
                  <div role="status" aria-live="polite" class="corn-copy-button--message corn-assistive-text"></div>
                </corn-copy-button>
                <button type="button" class="corn-button corn-button--xs" id="download-tokens" aria-controls="color-tokens" aria-label="Download tokens as a file">
                  download
                </button>
              </div>                        
            <div id="copy-tokens-container" class="corn-form--item">

              <xmp id="color-tokens" class="palette-tokens">tokens will go here</xmp>
            </div>
            
                       
          </div>
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
    const tokenFormatInputs = this.querySelectorAll('input[name="token-format"]');
    tokenFormatInputs.forEach((input) => {
      input.addEventListener('change', () => this.update());
    });
    const downloadButton = this.querySelector('#download-tokens');
    downloadButton.addEventListener('click', () => {
      const { workingPalette } = store.getState();
      const tokensCode = this.querySelector('#color-tokens').textContent;
      const fileType = this.querySelector('input[name="token-format"]:checked')?.value === 'figma' ? 'application/json' : 'text/css';
      const blob = new Blob([tokensCode], { type: fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workingPalette.name.replace(/\s+/g, '-').toLowerCase()}-tokens.${fileType.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      downloadButton.classList.add('corn-copied');
      setTimeout(() => {
        downloadButton.classList.remove('corn-copied');
      }, 500);
    });
  }
  update() {
    const { workingPalette } = store.getState();
    const tokenContainer = this.querySelector('#color-tokens');
    const tokenFormat = this.querySelector('input[name="token-format"]:checked')?.value || 'css';
    let cssColorSpace = this.querySelector('input[name="color-space"]:checked')?.value || 'hex';
    if (tokenFormat === 'figma') {
      // Figma only support hex and RGB, so we will default to hex for figma tokens
      cssColorSpace = 'hex';
    }
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
    console.log('Updating tokens with:', { tokenType, tokenPrefix, stepMultiplier, colorScheme, cssColorSpace, tokenFormat });
    // Clear existing tokens
    tokenContainer.innerHTML = '';
    let tokensCode = '';
    console.log('Generating tokens...', tokenFormat === 'figma' ? 'Figma format' : 'CSS format');
    if (tokenFormat === 'css') {
      if (workingPalette && workingPalette.steps) {
        tokensCode += `/* Color Tokens for Palette: ${workingPalette.name} */\n`;
        tokensCode += `/* Color Space: ${cssColorSpace} */\n`;
        tokensCode += `/* Design System: ${tokenType} */\n\n`;
        tokensCode += `:root, :host {\n`;
        if (colorScheme === 'light-dark') {
          tokensCode += `\n\tcolor-scheme: light dark;\n`;
        }
        workingPalette.steps.forEach((step, index) => {
          tokensCode += `\n\t/* ${step.colorName} */\n`;
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
              tokensCode += `\t${tokenPrefix}-${step.colorName.toLowerCase()}-${((colorIndex + 1) * stepMultiplier) / 2}: ${colorValue};\n`;
            }
            if (tokenType === 'tailwind' && colorIndex === step.colors.length - 1) {
              tokensCode += `\t${tokenPrefix}-${step.colorName.toLowerCase()}-${(colorIndex + 1) * stepMultiplier - 50}: ${colorValue};\n`;
            } else {
              tokensCode += `\t${tokenPrefix}-${step.colorName.toLowerCase()}-${(colorIndex + 1) * stepMultiplier}: ${colorValue};\n`;
            }
          });
        });
        tokensCode += `}\n`;
        tokensCode += `\n/* End of Color Tokens */\n`;
        tokensCode += `/* Thanks BootsMonday! */\n`;
      }
    } else if (tokenFormat === 'figma') {
      console.log('Generating Figma tokens...');
      tokensCode += `{\n`;
      tokensCode += `  "${workingPalette.name}": {\n`;
      workingPalette.steps.forEach((step, index) => {
        let figmaVariablePrefix = tokenType === 'corncob' ? 'cc-' : tokenType === 'tailwind' ? 'color-' : '';
        step.colors.forEach((color, colorIndex) => {
          const colorModel = new ColorModel(color);
          const srgbColor = colorModel.getColor().to('srgb');
          srgbColor.coords = srgbColor.coords.map((c) => Math.min(Math.max(c, 0), 1)); // Clamp values between 0 and 1
          const hexColor = colorModel.format('hex');
          tokensCode += `    "${figmaVariablePrefix}${step.colorName.toLowerCase()}-${(colorIndex + 1) * stepMultiplier}": {\n`;
          tokensCode += `      "$type": "color",\n`;
          tokensCode += `      "$value": {\n`;
          tokensCode += `        "colorSpace": "srgb",\n`;
          tokensCode += `        "components": [${srgbColor.coords[0]}, ${srgbColor.coords[1]}, ${srgbColor.coords[2]}],\n`;
          tokensCode += `        "alpha": 1,\n`;
          tokensCode += `        "hex": "${hexColor}"\n`;
          tokensCode += `      }\n`;
          if (colorIndex < step.colors.length - 1) {
            tokensCode += `    },\n`;
          } else if (index < workingPalette.steps.length - 1) {
            tokensCode += `    },\n`;
          } else {
            tokensCode += `    }\n`;
          }
          // let colorValue = colorModel.format(cssColorSpace);
          // if (colorScheme === 'light-dark') {
          //   const oppositeIndex = step.colors.length - 1 - colorIndex;
          //   const oppositeColor = step.colors[oppositeIndex];
          //   const oppositeColorModel = new ColorModel(oppositeColor);
          //   const oppositeColorValue = oppositeColorModel.format(cssColorSpace);
          //   colorValue = `light-dark(${colorValue}, ${oppositeColorValue})`;
          // }
          // tokensCode += `        "${colorValue}"${colorIndex < step.colors.length - 1 ? ',' : ''}\n`;
        });
      });
      tokensCode += `  }\n`;
      tokensCode += `}\n`;
    }
    tokenContainer.textContent = tokensCode;
  }
}

customElements.define('color-tokens', ColorTokens);
