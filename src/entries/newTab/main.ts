// import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./App.svelte";
import * as bg from "../background/main";

// customElements.define("my-element", App);

new App({
  target: document.getElementById("app"),
});
