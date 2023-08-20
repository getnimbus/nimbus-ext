// import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./App.svelte";
// import * as bg from "../background/main";
import * as browser from "webextension-polyfill";
import * as Sentry from "@sentry/svelte";

Sentry.init({
  dsn: "https://eaa14b85aa9332aadeacfb759857a387@o4505729367801856.ingest.sentry.io/4505729426391040",
  integrations: [
    new Sentry.BrowserTracing()
  ],
  release: "nimbus",
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

browser.storage.sync.get("options").then(async (res) => {
  const defaultnewtab = await browser.storage.sync.get('defaultnewtab');
  if (!defaultnewtab?.defaultnewtab && !window.location.hash.includes('normal')) {
    // Ignore render when default new tab = false
    console.log("Going to change tab", window.location);
    browser.tabs.update({
      url: "chrome-search://local-ntp/local-ntp.html"
    })
    return;
  }

  window.document.title = 'Your personalize Web3 portfolio'

  new App({
    target: document.getElementById("app"),
  });
})
