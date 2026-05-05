import { store } from "../store.js";

class CounterPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribe(() => this.render());

    this.shadowRoot.addEventListener("click", (e) => {
      if (e.target.id === "increment") {
        store.setState({ count: store.getState().count + 1 });
      }
      if (e.target.id === "decrement") {
        store.setState({ count: store.getState().count - 1 });
      }
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    const { count } = store.getState();
    this.shadowRoot.innerHTML = `
      <style>
        button { font-size: 1.2rem; margin: 0 10px; padding: 10px 20px; }
      </style>
      <h2>Counter</h2>
      <p style="font-size: 3rem; font-weight: bold;">${count}</p>
      <button id="decrement">-</button>
      <button id="increment">+</button>
    `;
  }
}

customElements.define("counter-page", CounterPage);
