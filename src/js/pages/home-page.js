import { store } from '../store.js';

/**
 * The HomePage class represents the home page of the Color Palette Tool application. It is a custom HTML element that displays a list of saved color palettes and provides links to create new palettes or edit existing ones. The component retrieves the palette collection from the application's state store and dynamically generates HTML elements to display each palette's name and a sample image based on its color steps. The sample images are rendered using the SampleImage custom element, which takes the palette steps as an attribute. The HomePage component also includes introductory text and instructions for users on how to use the tool.
 */
class HomePage extends HTMLElement {
  /**
   * This method is called when the HomePage element is added to the DOM. It renders the initial HTML structure of the home page, including headings, introductory text, and a link to create a new palette. It then iterates over the palette collection from the application's state store and creates a div element for each palette, displaying its name and a sample image. The sample image is generated using the SampleImage custom element, which receives the palette steps as an attribute. This setup allows users to view their saved palettes and navigate to edit them.
   */
  connectedCallback() {
    this.render();

    store.getState().paletteCollection.forEach((palette, index) => {
      const paletteElement = document.createElement('div');
      paletteElement.classList.add('corn-palette');
      paletteElement.innerHTML = `
        <h3 ${index !== 0 ? 'style="margin-top: var(--cc-size-4)"' : ''}>${palette.name}</h3>
        <div class="palette-sample-image">
          <a href="/edit-palette/${palette.id}" class="corn-link"><sample-image palette-steps='${encodeURIComponent(JSON.stringify(palette.steps))}'></sample-image></a>
        </div>
      `;
      this.querySelector('.corn-panel').appendChild(paletteElement);
    });
  }

  /**
   * This method renders the HTML structure of the HomePage component. It sets the innerHTML of the component to include headings, introductory text, and a link to create a new palette. It also checks if there are any saved palettes in the application's state store and displays a message if there are none. The method is called when the component is connected to the DOM, ensuring that the home page is properly displayed to users when they visit the application.
   */
  render() {
    this.innerHTML = `
      <div class="corn-row">
        <div class="corn-col-12">
        <h1>Color Palette Tool</h1>
        <div class="corn-panel">
            <a href="/new-palette" class="corn-link" style="margin-bottom: var(--cc-size-4);display: inline-block;">Create New Palette</a>
            <p>This tool allows you to create and manage color palettes. You can create a new palette, edit existing ones, and view sample images based on your palettes.</p>
            <p>Palette data is stored in your browser's local storage, so it will persist across sessions. You can also export your palettes for use in other applications.</p>
            <p>To get started, click on "Create New Palette" to design your first color palette.</p>
            <h2>Current Palettes</h2>
            <a href="/new-palette" class="corn-link" style="margin-bottom: var(--cc-size-4);display: inline-block;">Create New Palette</a>
            ${store.getState().paletteCollection.length === 0 ? `<p>No palettes saved yet. Create a new palette to get started!</p>` : ''}
          

        </div>
      </div>
    `;
  }
}

customElements.define('home-page', HomePage);
