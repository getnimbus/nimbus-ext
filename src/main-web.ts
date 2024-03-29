import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import App from "./entries/newTab/App.svelte";
import "./entries/background/main";
import * as Sentry from "@sentry/svelte";
import WebApp from "@twa-dev/sdk";
import mixpanel from "mixpanel-browser";

mixpanel.init("d56364b743cd70634fe5bea51e1d7e1c", {
  debug: false,
  ignore_dnt: true,
});

WebApp.ready();

Sentry.init({
  dsn: "https://eaa14b85aa9332aadeacfb759857a387@o4505729367801856.ingest.sentry.io/4505729426391040",
  integrations: [new Sentry.BrowserTracing()],
  // debug: true,
  release: "v1.0.0", // TODO: Update version here
  tracePropagationTargets: ["localhost"],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

new App({
  target: document.getElementById("app"),
});
