import { store } from '../store.js';
import Color from 'colorjs.io';
import { ColorModel } from '../models/ColorModel.js';
const lightnessSteps = [97, 90, 82, 72, 59.04, 47.5, 37, 28, 20, 13];

/**
 * HexPreview is a custom web component that provides a user interface for previewing and interacting with hex color values. It allows users to input a hex color, validates the input, and calculates the closest matching colors in HSLuv and OKHSL color spaces. The component displays the original hex color along with the closest matches, and provides buttons to use these colors in the working palette. It also manages event listeners for user interactions and updates its display based on changes in the application state.
 */
class HexPreview extends HTMLElement {
  constructor() {
    super();
  }

  /**
   * This method renders the HTML structure of the HexPreview component. It creates a form for users to input a hex color value, displays instructions for how the hex value maps to palette colors in HSLuv and OKHSL color spaces, and shows the closest matching colors along with buttons to use these colors. The method sets up the necessary HTML elements and classes for styling and functionality, ensuring that the component is ready for user interaction.
   */
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

  /**
   * This method is called when the HexPreview component is added to the DOM. It initializes the component's state, renders its HTML structure, subscribes to changes in the working palette from the store, and sets up event listeners for user interactions. The method ensures that the component is ready to respond to user input and updates its display based on changes in the application state.
   */
  connectedCallback() {
    this.closestHsluvColor = null;
    this.closestOkhslColor = null;
    this.render();
    // this.unsubscribe = store.subscribeTo('workingPalette', () => this.update());
    this.addEventListeners();
  }

  /**
   * This method adds event listeners to the HexPreview component for handling user interactions. It listens for 'change', 'submit', and 'click' events, allowing the component to respond to input changes, form submissions, and button clicks. The event listeners are bound to the component itself, enabling it to handle events and update its state or UI accordingly. This setup ensures that the component can effectively manage user input and maintain synchronization with the application's state.
   */
  addEventListeners() {
    this.addEventListener('change', this);
    this.addEventListener('submit', this);
    this.addEventListener('click', this);
  }

  /**
   *
   * @param {Event} event
   * @returns {void}
   * This method handles various events triggered within the HexPreview component. It processes 'click', 'change', and 'submit' events, allowing the component to respond to user interactions. For 'change' events, it updates the working palette's color space based on user selection. For 'submit' events, it validates hex input, calculates the closest matching colors in HSLuv and OKHSL color spaces, and updates the working palette accordingly. The method ensures that the component's state and display are updated in response to user actions.
   */
  handleEvent(event) {
    if (event.type === 'click') {
    }
    if (event.type === 'change') {
      const target = event.target;
      if (target.name === 'color-space') {
        const workingPalette = store.getState().workingPalette;
        workingPalette.colorSpace = target.value;
        if (workingPalette.userColor) {
          workingPalette.userColor.colorSpace = target.value;
        }
        store.setState({ workingPalette });
      }
    }
    if (event.type === 'submit') {
      event.preventDefault();
      event.stopPropagation();
      if (event.target.id === 'hex-preview-form') {
        const colorToCopy = event.submitter.value;
        const workingPalette = store.getState().workingPalette;
        if (colorToCopy === 'hsluv') {
          const color = new ColorModel({ colorSpace: colorToCopy, hue: this.closestHsluvColor.h, saturation: this.closestHsluvColor.s, lightness: this.closestHsluvColor.l });
          workingPalette.userColor = color.toJSON();
          workingPalette.colorSpace = 'hsluv';
          store.setState({ workingPalette });
        } else if (colorToCopy === 'okhsl') {
          const color = new ColorModel({ colorSpace: colorToCopy, hue: this.closestOkhslColor.h, saturation: this.closestOkhslColor.s * 100, lightness: this.closestOkhslColor.l * 100 });
          workingPalette.userColor = color.toJSON();
          workingPalette.colorSpace = 'okhsl';
          store.setState({ workingPalette });
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
        } else {
          this.querySelector('#hex-ghost-text').style.display = 'block';
          this.querySelector('#hex-preview').style.display = 'none';
        }
        return false;
      }
    }
  }

  /**
   *
   * @param {string} hex - The hex color code to find the closest matching colors for.
   * @returns {string} - The hex code of the closest matching color (example implementation).
   * This method calculates the closest matching colors in HSLuv and OKHSL color spaces for a given hex color code. It converts the hex color to HSLuv and OKHSL formats, determines the closest lightness values from predefined steps, and creates new Color instances for the closest matches. The method updates the component's display to show the original hex color and the closest matches, along with their respective hex codes. It also hides the ghost text and displays the color previews. The method returns an example closest match hex code (this should be calculated based on the palette in a real implementation).
   */
  calculateClosestColor(hex) {
    const color = new Color(hex);
    const hsluvColor = color.to('hsluv');
    const okhslColor = color.to('okhsl');
    const hsluvLightness = hsluvColor.l;
    const okhslLightness = okhslColor.l * 100; // Convert to percentage for OKHSL
    const closestHsluvLightness = lightnessSteps.reduce((prev, curr) => (Math.abs(curr - hsluvLightness) < Math.abs(prev - hsluvLightness) ? curr : prev));
    const closestOkhslLightness = lightnessSteps.reduce((prev, curr) => (Math.abs(curr - okhslLightness) < Math.abs(prev - okhslLightness) ? curr : prev));
    this.closestHsluvColor = new Color('hsluv', [hsluvColor.h, hsluvColor.s, closestHsluvLightness]);
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
    // Placeholder for closest color calculation logic
    // In a real implementation, this would compare the hex color to the palette and find the closest match
    return '#ff6000'; // Example closest match (this should be calculated based on the palette)
  }

  /**
   * This method removes event listeners from the HexPreview component. It is typically called when the component is disconnected from the DOM to prevent memory leaks and ensure that the component no longer responds to events after it has been removed. The method removes 'change' and 'submit' event listeners that were previously added to the component.
   */
  removeEventListeners() {
    this.removeEventListener('change', this);
    this.removeEventListener('submit', this);
  }

  /**
   * This method is called when the HexPreview component is removed from the DOM. It unsubscribes from any store subscriptions to prevent memory leaks and removes event listeners that were added during the component's lifecycle. This ensures that the component cleans up its resources and does not continue to respond to events or state changes after it has been disconnected from the DOM.
   */
  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.removeEventListeners();
  }

  update() {}
}

customElements.define('hex-preview', HexPreview);
