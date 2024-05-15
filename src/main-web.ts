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
  dsn: "https://314310ebdb5bff4a14a386f1eb6d47b2@o4505729367801856.ingest.us.sentry.io/4506455493246976",
  integrations: [Sentry.browserTracingIntegration()],
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
