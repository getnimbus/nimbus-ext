<script lang="ts">
  import { LiFiWidget, WidgetConfig } from "nimbus-swap-widget";
  import ReactAdapter from "./ReactAdapter.svelte";

  const widgetConfig: WidgetConfig = {
    integrator: "Nimbus",
    variant: "default",
    gmPoints: "1000",
  };
</script>

<ReactAdapter
  element={LiFiWidget}
  config={widgetConfig}
  integrator="svelte-example"
/>

<style>
</style>
