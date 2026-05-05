import { store } from "../store.js";
import corncobStyles from "@bootsmonday/corncob-design-language/style.css?inline";

class TodoPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribe(() => this.render());

    this.shadowRoot.addEventListener("click", (e) => {
      if (e.target.id === "add") {
        const input = this.shadowRoot.getElementById("todo-input");
        if (input.value.trim()) {
          const newTodos = [
            ...store.getState().todos,
            {
              id: Date.now(),
              text: input.value.trim(),
            },
          ];
          store.setState({ todos: newTodos });
          input.value = "";
        }
      }
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    const { todos } = store.getState();
    this.shadowRoot.innerHTML = `
      <style>
        ${corncobStyles}
      </style>
      <h2>Todos (${todos.length})</h2>
      <div class="corn-form--row">
        <div class="corn-form--item">
          <div class="corn-text-input">
            <input id="todo-input" name="todo" placeholder="New todo..." />
            <label for="todo-input">New todo</label>
          </div>
        </div>
        <div class="corn-form--item">
          <button id="add" class="corn-button corn-button--primary">Add</button>
        </div>
      </div>
      
      
      <ul>
        ${todos.map((todo) => `<li>${todo.text}</li>`).join("")}
      </ul>
    `;
  }
}

customElements.define("todo-page", TodoPage);
