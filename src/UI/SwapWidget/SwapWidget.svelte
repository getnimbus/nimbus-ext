<script lang="ts">
  import { LiFiWidget } from "nimbus-swap-widget";
  import ReactAdapter from "./ReactAdapter.svelte";
  import { handleFormatBlockChainId } from "~/lib/price-mobulaWs";

  export let chain;
  export let address;

  $: widgetConfig = {
    integrator: "Nimbus",
    variant: "default",
    gmPoints: "1000",
    fromToken: address,
    fromChain: Number(handleFormatBlockChainId(chain)),
  };
</script>

<ReactAdapter
  element={LiFiWidget}
  config={widgetConfig}
  integrator="svelte-example"
/>

<style>
</style>
