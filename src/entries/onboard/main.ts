import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./App.svelte";
import * as browser from "webextension-polyfill";

const moduleLoader = Promise.resolve(true);

moduleLoader.then((res) => {
  browser.storage.sync.get("options").then((res) => {
    new App({
      target: document.getElementById("app"),
    });
  })
})
