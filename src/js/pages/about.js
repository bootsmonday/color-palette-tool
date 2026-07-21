import { router } from '../router.js';

/**
 * The AboutPage class renders the About page for the Color Palette Tool application.
 * It explains the accessibility rationale behind the tool and includes guidance for
 * integrating exported palettes into design and development workflows.
 */
class AboutPage extends HTMLElement {
  /**
   * Called when the AboutPage element is added to the DOM. It renders the page
   * content and wires up internal data-link anchors to client-side router navigation.
   */
  connectedCallback() {
    this.render();

    this.querySelectorAll('a[data-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate(link.getAttribute('data-route') || '/');
      });
    });
  }

  /**
   * Renders the About page content, including accessibility background, contrast
   * examples, and integration guidance for supported export formats.
   */
  render() {
    this.innerHTML = `
      <div class="corn-row">
        <div class="corn-col-12">
        <h1>Why Another Color Palette Tool?</h1>
        <div class="corn-panel">
          <h2>Accessible Color Systems</h2>
          <p>There are many color palette tools available, but this one is designed with accessibility in mind. It helps you create color palettes that are not only visually appealing but also accessible to users with visual impairments.</p>
          <p>Many existing tools focus on aesthetics without considering accessibility. This tool aims to fill that gap by providing features that ensure your color choices meet accessibility standards.</p>

          <h2>Consistency</h2>
          <p>Consistency in color usage is crucial for user experience. This tool allows you to create and manage color palettes that can be consistently applied across your projects, ensuring a cohesive look and feel.</p>
          <p>By having consistent naming conventions and color systems, you can maintain a professional and unified design language throughout your work. This allows developers and designers to collaborate more effectively and ensures that the design intent is preserved across different stages of the project.</p>

          <h2>Easier Accessibility Checks</h2>
          <p>This tool simplifies the process of checking color accessibility.</p>
          <p>As long as the colors are in a color space that is perceptually uniform, the contrast ratio can be calculated by using the lightness values of the colors. This allows for quick and easy accessibility checks without the need for complex tools or calculations.</p>
          <p>A designer can easily check the accessibility of their colors by using simple math.</p>
          <p>As long as a color is five or more steps away from another color in the palette, it will pass accessibility checks for normal text. This makes it easy to create accessible color palettes without needing to rely on external tools or resources.</p>
          <p>You could use blue-70 text on a yellow-20 background or a red-20 background with a green-70 text color. As long as the colors are five or more steps away from each other in the palette, they will pass accessibility checks for normal text.</p>

          <div class="about-examples corn-row">
            <div class="corn-col-4 about-example-1 p-3">
              <div>green-40 on green-90</div>
              <div>90 - 40 = 50</div>
              <div>Passes</div>
            </div>
            <div class="corn-col-4 about-example-2 p-3">
              <div>blue-40 on orange-90</div>
              <div>90 - 40 = 50</div>
              <div>Passes</div>
            </div>
            <div class="corn-col-4 about-example-3 p-3">
              <div>green-90 on yellow-50</div>
              <div>90 - 50 = 40</div>
              <div>Fails</div>
            </div>
          </div>
          <hr />
          <h2>How the eyes see contrast</h2>
          <p>The human eye sees contrast differently than a computer. The eye is more sensitive to changes in lightness than changes in hue or saturation. The WCAG 2.1 AA standards for contrast are based on the lightness of colors, which is why we use the lightness value to determine if colors are accessible. By using a consistent naming convention for colors, we can ensure that our color palettes pass automated accessibility checks and are easy to maintain across projects.</p>
          <p>This tool will generate mathematically accessible colors, but you can still have combinations that pass but aren't visually accessible. <a href="https://github.com/w3c/wcag3/issues/192">Contrast Ratio Math and Related Visual Issues (problems with WCAG 2.1)</a></p>
          
          <p>Why HSLUV and OKHSL? These color spaces are perceptually uniform, meaning that the perceived difference between colors is consistent across the color space. This allows for more accurate and reliable accessibility checks, as the contrast ratio can be calculated based on the lightness values of the colors. By using a perceptually uniform color space, we can ensure that our color palettes are not only visually appealing but also accessible to users with visual impairments.</p>
          <p>OKHSL is a newer perceptually uniform color space that works better with the OKLCH color space. OKLCH has an advantage over HSLuv as it has support for <a href="https://www.w3.org/TR/css-color-4/#predefined-display-p3">Display P3</a> which offers a wider gamut support than the sRGB color space which is what HSLuv is based on.</p>

          <ul>
            <li class="corn-margin-bottom"><a href="https://bottosson.github.io/posts/oklab/">A perceptual color space for image processing</a></li>
            <li class="corn-margin-bottom"><a href="https://www.hsluv.org/">HSLuv is a human-friendly alternative to HSL</a></li>
          </ul>

          <hr />


          <h2>Integration with Design Tools</h2>
          <p>Currently this tool supports three color token prefix variable variations, corncob, tailwind and unprefixed.</p>
          <h3>Figma</h3>
          <p>You can export your palettes in Figma .json format for use in your design projects. This allows you to easily integrate your color palettes into your design workflow.</p>
          <p>Open your Figma file, go to your variables, choose a collection, and click the "Import" button. Then select the .json file you exported from this tool. Your colors will be added to your Figma variables collection.</p>
          <h3>CSS</h3>
          <p>You can export your palettes as .css files for use in web development projects. This provides a convenient way to apply your color palettes directly to your website's stylesheets.</p>
          <h3>Tailwind</h3>
          <p>Tailwind variables are limited to 10 colors of the 11 that Tailwind supports. The first color is a duplicate of the second color because Tailwind's color system starts at 50, while this tool's color system starts at 10. This ensures that the exported Tailwind variables are consistent with the other color variable variations and can be used interchangeably in your projects.</p>

          <p>To get started, click on "<a href="${router.toAppPath('/new-palette')}" class="corn-link" data-link data-route="/new-palette">Create New Palette</a>" to design your first color palette.</p>

          <hr />
          <h2>Additional Resources</h2>
          <ul>
          
            <li class="corn-margin-bottom"><a href="https://www.w3.org/TR/WCAG21/#contrast-minimum">WCAG 2.1 AA Contrast Standards</a></li>
            <li class="corn-margin-bottom"><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch">oklch() on MDN</a></li>
            <li class="corn-margin-bottom"><a href="https://www.w3.org/TR/css-color-4/#oklch">W3.org CSS Color Module Level 4</a></li>            
            <li class="corn-margin-bottom"><a href="https://stripe.com/blog/accessible-color-systems">Designing accessible color systems</a></li>
            <li class="corn-margin-bottom"><a href="https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl">OKLCH in CSS: why we moved from RGB and HSL</a></li>
           
          </ul>
        </div>
      </div>
    `;
  }
}

customElements.define('about-page', AboutPage);
