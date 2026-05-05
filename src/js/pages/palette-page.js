import { store } from "../store.js";
import bootstrapIconsSprite from "bootstrap-icons/bootstrap-icons.svg";
class PalettePage extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="corn-row">
        <div class="corn-col-12">
          <h1>Palette Page</h1>
        </div>
      </div>
      <div class="corn-row">
        <div class="corn-col-4">
          <div class="corn-panel">
          <p>Detail</p>
          <p>My awesome palette</p>          
            <corn-expandable class="corn-expandable">
              <details slot="details">
                <summary class="corn-expandable-button">
                  Validate Hex Value
                  <svg class="corn-icon" aria-hidden="true">
                    <use href="${bootstrapIconsSprite}#chevron-right"></use>
                  </svg>
                </summary>
                <div class="corn-expandable--content">
                  <div>
                    <p>If you want to start with a specific hex value, enter it here. The closest color is determined by finding the color with the closest lightness value to the input hex color.</p>
                    <div>content</div>
                  </div>
                </div>
              </details>
            </corn-expandable>
          </div>      
        </div>
        <div class="corn-col-8">
          
          <div class="corn-panel">
          <color-form>test</color-form>
            <div class="corn-accordion">
              <corn-expandable class="corn-expandable">
                <details slot="details">
                  <summary class="corn-expandable-button">
                    New Color
                    <svg class="corn-icon" aria-hidden="true">
                      <use href="${bootstrapIconsSprite}#chevron-right"></use>
                    </svg>
                  </summary>
                  <div class="corn-expandable--content">
                    <div class="corn-row">
                      <div class="corn-col-8">
                    <div class="corn-form--item">
                      <div class="corn-text-input">
                        <input id="color-name" name="color-name" placeholder="Enter Color Name..." />
                        <label for="color-name">Color Name</label>
                      </div>
                    </div>
                    <div class="corn-slider corn-slider--sm">
                      <label for="hue">Hue:</label>
                      <input type="range" min="0" max="100" value="50" id="hue" name="hue"/>
                    </div>
                    <div class="corn-slider corn-slider--sm">
                      <label for="saturation">Saturation:</label>
                      <input type="range" min="0" max="100" value="50" id="saturation" name="saturation"/>
                    </div>    

                        
              
                  </div>
                </details>
              </corn-expandable>
              <corn-expandable class="corn-expandable">
                <details slot="details">
                  <summary class="corn-expandable-button">
                    Edit Color
                    <svg class="corn-icon" aria-hidden="true">
                      <use href="${bootstrapIconsSprite}#chevron-right"></use>
                    </svg>
                  </summary>
                  <div class="corn-expandable--content">Choose a color to edit</div>
                </details>
              </corn-expandable>
            </div>
            <h3>Palette Preview</h3>
            <div>Palette preview will go here</div>
          </div>          
        </div>
      </div>
    `;
  }
}

customElements.define("palette-page", PalettePage);
