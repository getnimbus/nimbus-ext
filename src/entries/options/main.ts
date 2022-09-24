import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./App.normal.svelte";

// customElements.define("my-element", App);

new App({
  target: document.getElementById("app"),
});
