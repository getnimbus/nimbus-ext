import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./entries/newTab/App.svelte";
import "./entries/background/main";

new App({
  target: document.getElementById("app"),
});