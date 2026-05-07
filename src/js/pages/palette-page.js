import { store } from '../store.js';
import bootstrapIconsSprite from 'bootstrap-icons/bootstrap-icons.svg';
class PalettePage extends HTMLElement {
  connectedCallback() {
    this.render();
    // this.unsubscribe = store.subscribeTo('colorSpace', () => this.render());
    this.addEventListeners();
  }
  addEventListeners() {
    this.addEventListener('change', this);
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
  }
  removeEventListeners() {
    this.removeEventListener('change', this);
  }
  disconnectedCallback() {
    // if (this.unsubscribe) {
    //   this.unsubscribe();
    // }
    this.removeEventListeners();
  }
  render() {
    console.log('Rendering PalettePage');
    const { colorSpace } = store.getState();
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
            
            <h3>Palette Preview</h3>
            <div>Palette preview will go here</div>
          </div>          
        </div>
      </div>
    `;
  }
}

customElements.define('palette-page', PalettePage);
