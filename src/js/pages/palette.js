import { store } from '../store.js';
/**
 * The PalettePage class represents the palette creation and editing page of the Color Palette Tool application. It is a custom HTML element that displays a form for creating or editing a color palette, along with sample images based on the palette's color steps. The component retrieves the working palette and page type (create or edit) from the application's state store and dynamically updates the page title accordingly. It also subscribes to changes in the relevant state properties to ensure that the displayed information remains up-to-date as users interact with the form and modify the palette.
 */
class PalettePage extends HTMLElement {
  /**
   * This is the constructor for the PalettePage component. It initializes the component by calling the superclass constructor and setting up an unsubscribe property to manage state subscriptions. The unsubscribe property will later be used to clean up any subscriptions when the component is disconnected from the DOM, ensuring that there are no memory leaks or unnecessary updates after the component is removed.
   */
  constructor() {
    super();
    this.unsubscribe = null;
  }

  /**
   * This method is called when the PalettePage element is added to the DOM. It renders the initial HTML structure of the page, including headings, a form for creating or editing a palette, and sample images based on the palette's color steps. The method also subscribes to changes in the 'workingPalette' and 'pageType' properties of the application's state store, allowing the component to update its content dynamically as users interact with the form and modify the palette. The subscription is set up with batching enabled to optimize performance and reduce unnecessary re-renders.
   */
  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribeTo(['workingPalette', 'pageType'], () => this.update(), { batch: true });
  }

  /**
   * This method is called when the PalettePage element is removed from the DOM. It checks if there is an active subscription to the application's state store and, if so, calls the unsubscribe function to clean up the subscription. This ensures that the component does not continue to receive updates or trigger re-renders after it has been removed from the DOM, preventing potential memory leaks and unnecessary processing.
   */
  disconnectedCallback() {
    this.unsubscribe?.();
  }

  /**
   * This method updates the page title based on the current state of the application. It retrieves the 'workingPalette' and 'pageType' properties from the application's state store and updates the text content of the title element accordingly. If the page type is 'edit', it sets the title to "Edit [Palette Name]"; otherwise, it sets it to "Create Palette". This dynamic update ensures that users are provided with accurate context about their current action (creating or editing a palette) while interacting with the form.
   */
  update() {
    const title = this.querySelector('#page-title');
    if (!title) return;

    const { workingPalette, pageType } = store.getState();
    const paletteName = workingPalette?.name || 'Palette';
    title.textContent = pageType === 'edit' ? `Edit ${paletteName}` : 'Create Palette';
  }

  /**
   * This method renders the HTML structure of the PalettePage component. It sets the innerHTML of the component to include headings, a form for creating or editing a palette, and sample images based on the palette's color steps. The method dynamically updates the page title based on the current state of the application, displaying either "Edit [Palette Name]" or "Create Palette" depending on whether the user is editing an existing palette or creating a new one. The rendered content includes a palette form, sample templates, and, if in edit mode, a section for color tokens.
   */
  render() {
    const { workingPalette, pageType } = store.getState();
    const paletteName = workingPalette?.name || 'Palette';

    this.innerHTML = `
      <div class="corn-row">
        <div class="corn-col-12">
          ${pageType === 'edit' ? `<h1 id="page-title">Edit ${paletteName}</h1>` : `<h1 id="page-title">Create Palette</h1>`}
          ${
            pageType === 'edit'
              ? `              <div class="corn-margin-bottom"><a href="#template-samples">Template Samples</a> | <a href="#contrast-checker">Contrast Checker</a> | <a href="#tokens">Tokens</a>
              </div>`
              : ``
          }
        </div>
      </div>
      <div class="corn-row">
        <div class="corn-col-12">
          <div class="corn-panel">
            <palette-form></palette-form>
            <hr />
            <div class="corn-row">
              <div class="corn-col-12">
                <h2 id="template-samples">Template Samples</h2>
              </div>
              <div class="corn-col-6">
                <h3>CornCob Sample</h3>
                <corn-cob-template></corn-cob-template>
              </div>
              <div class="corn-col-6">
                <h3>Tailwind Sample</h3>
                <tailwind-template></tailwind-template>
              </div>              
            </div>
            ${
              pageType === 'edit'
                ? `
              <hr />
              <contrast-checker></contrast-checker>
              <hr />
              <color-tokens></color-tokens>`
                : ``
            }
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('palette-page', PalettePage);
