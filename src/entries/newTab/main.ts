// import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./App.svelte";
import * as bg from "../background/main";
import * as browser from "webextension-polyfill";

browser.storage.sync.get("options").then(async (res) => {
  const defaultnewtab = await browser.storage.sync.get('defaultnewtab');
  if (!defaultnewtab?.defaultnewtab) {
    // Ignore render when default new tab = false
    return;
  }

  window.document.title = 'Your personalize Web3 portfolio'

  new App({
    target: document.getElementById("app"),
  });
})
