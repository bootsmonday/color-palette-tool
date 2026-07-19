import style from '../../assets/tailwind.css?inline';

/**
 * TailwindTemplate is a custom web component that represents a form for account setup. It includes various input fields, toggles, checkboxes, and status messages for success and error states. The component uses Shadow DOM to encapsulate its styles and structure, ensuring that it does not interfere with other elements on the page. The styles are imported from the Tailwind CSS framework and applied to the component's shadow root.
 */
class TailwindTemplate extends HTMLElement {
  /**
   * This is the constructor for the TailwindTemplate component. It initializes the component by attaching a shadow DOM, creating a style element with the imported Tailwind CSS, and appending it to the shadow root. The constructor also sets the innerHTML of the shadow root to include the form structure, input fields, status messages, and other elements that make up the account setup form. This setup ensures that the component is styled according to Tailwind CSS and encapsulated within its own shadow DOM.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const styleElement = document.createElement('style');
    styleElement.textContent = style;
    this.shadowRoot.appendChild(styleElement);

    this.shadowRoot.innerHTML += `
    <style>
    :host {
    --color-green-50: var (--sample-green-10);
    --color-green-100: var(--sample-green-10);
    --color-green-200: var(--sample-green-20);
    --color-green-300: var(--sample-green-30);
    --color-green-400: var(--sample-green-40);
    --color-green-500: var(--sample-green-50);
    --color-green-600: var(--sample-green-60);
    --color-green-700: var(--sample-green-70);
    --color-green-800: var(--sample-green-80);
    --color-green-900: var(--sample-green-90);
    --color-green-950: var(--sample-green-100);

    --color-red-50: var (--sample-red-10);
    --color-red-100: var(--sample-red-10);
    --color-red-200: var(--sample-red-20);
    --color-red-300: var(--sample-red-30);
    --color-red-400: var(--sample-red-40);
    --color-red-500: var(--sample-red-50);
    --color-red-600: var(--sample-red-60);
    --color-red-700: var(--sample-red-70);
    --color-red-800: var(--sample-red-80);
    --color-red-900: var(--sample-red-90);
    --color-red-950: var(--sample-red-100);    

    --color-gray-50: var (--sample-gray-10);
    --color-gray-100: var(--sample-gray-10);
    --color-gray-200: var(--sample-gray-20);
    --color-gray-300: var(--sample-gray-30);
    --color-gray-400: var(--sample-gray-40);
    --color-gray-500: var(--sample-gray-50);
    --color-gray-600: var(--sample-gray-60);
    --color-gray-700: var(--sample-gray-70);
    --color-gray-800: var(--sample-gray-80);
    --color-gray-900: var(--sample-gray-90);
    --color-gray-950: var(--sample-gray-100);    

    --color-blue-50: var (--sample-blue-10);
    --color-blue-100: var(--sample-blue-10);
    --color-blue-200: var(--sample-blue-20);
    --color-blue-300: var(--sample-blue-30);
    --color-blue-400: var(--sample-blue-40);
    --color-blue-500: var(--sample-blue-50);
    --color-blue-600: var(--sample-blue-60);
    --color-blue-700: var(--sample-blue-70);
    --color-blue-800: var(--sample-blue-80);
    --color-blue-900: var(--sample-blue-90);
    --color-blue-950: var(--sample-blue-100); 
    
  }
  </style>


<div class="bg-gray-100 flex flex-col items-center justify-center p-4">

  <div class="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
    
    <!-- Title -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Account Setup</h2>
      <p class="text-sm text-gray-500">Please fill out the details below.</p>
    </div>

    <!-- Success Status Message -->
    <div class="bg-green-100 border-l-4 border-green-500 p-4 rounded-r-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">Success! Your account has been created.</p>
        </div>
      </div>
    </div>

    <!-- Error Status Message -->
    <div class="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">Error: Email address is already in use.</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form class="space-y-4" action="#" method="POST">
      
      <!-- Name Input -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input type="text" id="name" name="name" required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
      </div>

      <!-- Email Input -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input type="email" id="email" name="email" required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
      </div>

      <!-- Dropdown Select
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select id="role" name="role" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          <option>Developer</option>
          <option>Designer</option>
          <option>Manager</option>
        </select>
      </div>

      -->
<div>
  <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
  
  <div class="inline-flex rounded-lg shadow-sm border border-gray-300 bg-white p-1" role="group">
    
    <!-- Developer -->
    <input type="radio" id="role-developer" name="role" value="Developer" class="peer/developer hidden" checked>
    <label for="role-developer"
           class="peer-checked/developer:bg-blue-600 peer-checked/developer:text-white 
                  peer-checked/developer:hover:bg-blue-700 px-5 py-2 text-sm font-medium rounded-md cursor-pointer transition-all
                  text-gray-700 hover:bg-gray-100">
      Developer
    </label>

    <!-- Designer -->
    <input type="radio" id="role-designer" name="role" value="Designer" class="peer/designer hidden">
    <label for="role-designer"
           class="peer-checked/designer:bg-blue-600 peer-checked/designer:text-white 
                  peer-checked/designer:hover:bg-blue-700 px-5 py-2 text-sm font-medium rounded-md cursor-pointer transition-all
                  text-gray-700 hover:bg-gray-100">
      Designer
    </label>

    <!-- Manager -->
    <input type="radio" id="role-manager" name="role" value="Manager" class="peer/manager hidden">
    <label for="role-manager"
           class="peer-checked/manager:bg-blue-600 peer-checked/manager:hover:bg-blue-700 peer-checked/manager:text-white 
                  px-5 py-2 text-sm font-medium rounded-md cursor-pointer transition-all
                  text-gray-700 hover:bg-gray-100">
      Manager
    </label>

  </div>
</div>        

      <!-- Checkbox -->
      <div class="flex items-start">
        <div class="flex items-center h-5">
          <input id="terms" name="terms" type="checkbox" required
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
        </div>
        <div class="ml-3 text-sm">
          <label for="terms" class="font-medium text-gray-700">I agree to the privacy policy</label>
        </div>
      </div>

      <!-- Submit Button -->
      <div>
        <button type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
          Submit Application
        </button>
      </div>

    </form>
  </div>

</div>
    `;
  }
}

customElements.define('tailwind-template', TailwindTemplate);
