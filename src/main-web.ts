import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./entries/newTab/App.svelte";
import "./entries/background/main";
import mixpanel from 'mixpanel-browser';

mixpanel.init("d56364b743cd70634fe5bea51e1d7e1c");

new App({
  target: document.getElementById("app"),
});