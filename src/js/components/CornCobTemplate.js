import style from '@bootsmonday/corncob-design-language/style.css?inline';

class CornCobTemplate extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const styleElement = document.createElement('style');
    let cssText = style;
    styleElement.textContent = cssText;

    this.shadowRoot.appendChild(styleElement);

    this.shadowRoot.innerHTML += `
    <style>
    .corn-form {
      gap: var(--cc-size-2);
    }
    :host, :root {
    --cc-green-10: var(--sample-green-10);
    --cc-green-20: var(--sample-green-20);
    --cc-green-30: var(--sample-green-30);
    --cc-green-40: var(--sample-green-40);
    --cc-green-50: var(--sample-green-50);
    --cc-green-60: var(--sample-green-60);
    --cc-green-70: var(--sample-green-70);
    --cc-green-80: var(--sample-green-80);
    --cc-green-90: var(--sample-green-90);
    --cc-green-100: var(--sample-green-100);

    --cc-red-10: var(--sample-red-10);
    --cc-red-20: var(--sample-red-20);
    --cc-red-30: var(--sample-red-30);
    --cc-red-40: var(--sample-red-40);
    --cc-red-50: var(--sample-red-50);
    --cc-red-60: var(--sample-red-60);
    --cc-red-70: var(--sample-red-70);
    --cc-red-80: var(--sample-red-80);
    --cc-red-90: var(--sample-red-90);
    --cc-red-100: var(--sample-red-100);    

    --cc-gray-10: var(--sample-gray-10);
    --cc-gray-20: var(--sample-gray-20);
    --cc-gray-30: var(--sample-gray-30);
    --cc-gray-40: var(--sample-gray-40);
    --cc-gray-50: var(--sample-gray-50);
    --cc-gray-60: var(--sample-gray-60);
    --cc-gray-70: var(--sample-gray-70);
    --cc-gray-80: var(--sample-gray-80);
    --cc-gray-90: var(--sample-gray-90);
    --cc-gray-100: var(--sample-gray-100);    

    --cc-blue-10: var(--sample-blue-10);
    --cc-blue-20: var(--sample-blue-20);
    --cc-blue-30: var(--sample-blue-30);
    --cc-blue-40: var(--sample-blue-40);
    --cc-blue-50: var(--sample-blue-50);
    --cc-blue-60: var(--sample-blue-60);
    --cc-blue-70: var(--sample-blue-70);
    --cc-blue-80: var(--sample-blue-80);
    --cc-blue-90: var(--sample-blue-90);
    --cc-blue-100: var(--sample-blue-100); 

  }
  </style>
  <div class="corn-body">
    <div class="corn-panel">
      <!-- Title -->
      <h2>Account Setup</h2>
      <p>Please fill out the details below.</p>
      <div>
      
      <!-- Form -->
      <form class="corn-form color-example-form" action="#" method="POST">

        <!-- Success Status Message -->
        <div class="corn-message corn-message--success">
          <div class="corn-message--status">
              <svg class="corn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          </div>
          <div class="corn-message--content">
            <p class="corn-message--title">Success! Your account has been created.</p>
          </div>
        </div>    
        
        <!-- Error Status Message -->
        <div class="corn-message corn-message--error">
          <div class="corn-message--status">
                <svg class="corn-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
          </div>
          <div class="corn-message--content">
            <p class="corn-message--title">Error: Email address is already in use.</p>
          </div>
        </div>        
          
        <!-- Name Input -->
        <div class="corn-form--item">
          <div class="corn-text-input">
            <input id="input--md--default" name="input" placeholder="Enter Full Name..." />
            <label for="input--md--default">What is your name?</label>
          </div>
        </div>

        <!-- Email Input -->
        <div class="corn-form--item">
          <div class="corn-text-input">
            <input type="email" id="email" name="email" placeholder="Enter Email Address..." required />
            <label for="email">What is your email address?</label>
          </div>
        </div>

        <!-- Toggles -->
        <fieldset class="corn-form--item corn-toggle-group corn-toggle--md" aria-labelledby="role-legend">
          <legend id="role-legend">Role</legend>
          <div class="corn-toggles">
            <div class="corn-toggle">
              <input type="radio" id="example-developer" name="example-role" value="developer" checked />
              <label for="example-developer">Developer</label>
            </div>
            <div class="corn-toggle">
              <input type="radio" id="example-designer" name="example-role" value="designer" />
              <label for="example-designer">Designer</label>
            </div>
            <div class="corn-toggle">
              <input type="radio" id="example-manager" name="example-role" value="manager" />
              <label for="example-manager">Manager</label>
            </div>
          </div>
        </fieldset>

        <!-- Checkbox -->
        <fieldset class="corn-form--item corn-checkbox-group">
          <div class="corn-checkbox">
            <input type="checkbox" id="cc-privacy-policy" name="cc-privacy-policy" />
            <label for="cc-privacy-policy">I agree to the privacy policy</label>
          </div>
        </fieldset>

        <!-- Submit Button -->
        <div class="corn-button-group">
          <button class="corn-button corn-button--md">Submit Application</button>
        </div>
      </form>
    </div>
  </div>
</div>
    `;
    this.shadowRoot.host.offsetHeight;
  }
}

customElements.define('corn-cob-template', CornCobTemplate);
