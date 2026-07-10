import ColorModel from '../models/ColorModel.js';
class SampleImage extends HTMLElement {
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'palette-steps') {
      try {
        const parseSteps = (value) => {
          try {
            return JSON.parse(decodeURIComponent(value));
          } catch {
            return JSON.parse(value);
          }
        };
        const steps = parseSteps(newValue);
        this.paletteSteps = steps;
        this.updateColorVariables();
      } catch (error) {
        console.error('Failed to parse palette-steps:', error);
      }
    }
  }

  static get observedAttributes() {
    return ['palette-steps'];
  }

  updateColorVariables() {
    if (!this.paletteSteps || !Array.isArray(this.paletteSteps)) return;
    console.log('Updating color variables with palette steps:', this.paletteSteps);
    this.setColorVariables(this.paletteSteps);
  }
  constructor() {
    super();
    this.paletteSteps = [];

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: transparent;   /* default */
        }

        .sample-colors {
          display: flex;
          justify-content: center;
          background: var(--primary-color);
          padding: var(--size);
          color: white;
          svg {
            margin: 0 auto;
         }
        }
      </style>
<div class="sample-colors">
<svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 1800 1200" version="1.1"  style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
<title>Sample Colors</title>
  <defs>
    <style>
      :host {
        --color-1: var(--sample-gray-30); /* light gray */
        --color-2: var(--sample-red-50); /* hot pink */
        --color-3: var(--sample-orange-20); /* orange */
        --color-4: var(--sample-yellow-20); /* bright yellow */
        --color-5: var(--sample-green-50); /* lime green */
        --color-6: var(--sample-blue-40); /* cyan */
        --color-7: var(--sample-yellow-20); 
        --color-8: var(--sample-red-100); /* magenta */
        --color-9: var(--sample-blue-60); /* cyan */
        --color-10: var(--sample-blue-70); /* lime green */
        --color-11: var(--sample-blue-80); /* bright yellow */
        --color-12: var(--sample-blue-90); /* orange */







        // --retro-3: #FFEB3B; /* bright yellow */
        // --retro-4: #00E676; /* lime green */
        // --retro-5: #00B8D4; /* cyan */
        // --retro-6: #7C4DFF; /* purple */
        // --retro-7: #FF4081; /* magenta */
      }

      .wave {
        fill: none;
        stroke-width: 85;
        stroke-opacity: 0.85;
      }
    </style>
  </defs>
    <path d="M1869,1194L1803,837.263M1647.913,-1L1595,-287" style="fill:none;"/>
    <path d="M860,-200L1004.039,-1M1803,1102.817L1869,1194" style="fill:none;"/>
    <path d="M-151,-154L78.273,-1M1803,1149.956L1869,1194" style="fill:none;"/>
    <path d="M-192,513L1,576.771M1803,1172.192L1869,1194" style="fill:none;"/>
    <path d="M1803,1172.192L1840,1233L-74,1252L1,576.771L1803,1172.192Z" style="fill:var(--color-5);"/>
    <path d="M78.273,-1L1004.039,-1L1803,1102.817L1803,1149.956L78.273,-1Z" style="fill:var(--color-5);"/>
    <g transform="matrix(1,0,0,1,60,117)">
        <path d="M2535,671C2535,671 1029.667,1107 847,1009C664.333,911 1538,181 1439,83C1340,-15 395,499.833 253,421C149.059,363.296 291.225,86.305 437.126,-153.745C490.549,-241.643 587,-390 587,-390L129,-117C129,-117 -347,615.167 -205,694C-63,772.833 882,258 981,356C1080,454 206.333,1184 389,1282C571.667,1380 2077,944 2077,944L2535,671Z" style="fill:var(--color-8);"/>
    </g>
    <path d="M1647.913,-1L1803,-1L1803,837.263L1647.913,-1Z" style="fill:var(--color-5);"/>
    <path d="M1004.039,-1L1647.913,-1L1803,837.263L1803,1102.817L1004.039,-1Z" style="fill:var(--color-4);"/>
    <g transform="matrix(1.106299,0,0,1.106299,-219.562992,-15.783465)">
        <circle cx="1661" cy="172" r="127" style="fill:var(--color-8);"/>
    </g>
    <g transform="matrix(0.586614,0,0,0.586614,-432.366142,167.602362)">
        <circle cx="1661" cy="172" r="127" style="fill:var(--color-8);"/>
    </g>
    <path d="M 0 576.771 L 0 -1 L 77.273 -1 L 1802 1149.96 L 1802 1172.19 L 0 576.771 Z" style="fill:var(--color-7);"/>
    <g transform="matrix(0.814961,0,0,0.814961,-793.649606,632.326772)">
        <circle cx="1661" cy="172" r="127" style="fill:var(--color-8);"/>
    </g>
    <g transform="matrix(1,0,0,1,-59,53)">
        <g transform="matrix(1,0,0,1,-18,40)">
            <path d="M1131,948.5C1131,1011.142 1080.142,1062 1017.5,1062L238.5,1062C175.858,1062 125,1011.142 125,948.5C125,885.858 175.858,835 238.5,835L1017.5,835C1080.142,835 1131,885.858 1131,948.5Z" style="fill:var(--color-1);"/>
        </g>
        <g xmlns="http://www.w3.org/2000/svg" transform="matrix(0.736953,0,0,0.259912,147.193684,741.973568)">
          <circle xmlns="http://www.w3.org/2000/svg" cx="100" cy="332" r="127" style="transform: scaleY(2.85);fill:var(--color-9);"/>
          <circle xmlns="http://www.w3.org/2000/svg" cx="440" cy="332" r="127" style="transform: scaleY(2.85);fill:var(--color-10);"/>
          <circle xmlns="http://www.w3.org/2000/svg" cx="794" cy="332" r="127" style="transform: scaleY(2.85);fill:var(--color-11);"/>
          <circle xmlns="http://www.w3.org/2000/svg" cx="1155" cy="332" r="127" style="transform: scaleY(2.85);fill:var(--color-12);"/>
        </g>
    </g>
</svg>
      </div>
    `;
  }

  // Public method to update variables
  setColor(color) {
    const colorModel = new ColorModel(color);
    this.style.setProperty('--primary-color', colorModel.hex);
  }

  setSize(size) {
    this.style.setProperty('--size', size);
  }

  setColorVariables(variables) {
    variables.forEach((step, index) => {
      const cssVariableName = `--sample-${step.colorName.toLowerCase()}`;
      step.colors.forEach((color, colorIndex) => {
        const colorVariableName = `${cssVariableName}-${(colorIndex + 1) * 10}`;
        const colorModel = new ColorModel(color);
        console.log(`Setting CSS variable ${colorVariableName} to ${colorModel.hex}`, colorModel);
        this.style.setProperty(colorVariableName, colorModel.hex);
      });
    });
  }
}

customElements.define('sample-image', SampleImage);

// --retro-1: #FF4D94; /* hot pink */
// --retro-2: #FF8C00; /* orange */
// --retro-3: #FFEB3B; /* bright yellow */
// --retro-4: #00E676; /* lime green */
// --retro-5: #00B8D4; /* cyan */
// --retro-6: #7C4DFF; /* purple */
// --retro-7: #FF4081; /* magenta */
