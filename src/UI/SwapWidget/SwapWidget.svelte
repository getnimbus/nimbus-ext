<script lang="ts">
  import { LiFiWidget } from "nimbus-swap-widget";
  import ReactAdapter from "./ReactAdapter.svelte";
  import { handleFormatBlockChainId } from "~/lib/price-mobulaWs";
  import { userPublicAddress, isDarkMode, wallet } from "~/store";
  import { currentLang } from "~/lib/i18n";

  export let chain;
  export let address;
  export let showSideTokenSwap;

  $: widgetConfig = {
    integrator: "Nimbus",
    variant: "default",
    gmPointCoefficient: "5",
    userNimbusOwner: $userPublicAddress,
    referrerAddress: $wallet,
    fromToken: address,
    fromChain: Number(handleFormatBlockChainId(chain)),
    toChain: Number(handleFormatBlockChainId(chain)),
    toToken: "0x0000000000000000000000000000000000000000",
    appearance: $isDarkMode ? "dark" : "light",
    theme: {
      palette: {
        primary: {
          main: "#1e96fc",
        },
      },
    },
    languages: {
      default: currentLang,
    },
  };
</script>

{#if showSideTokenSwap}
  <ReactAdapter
    element={LiFiWidget}
    config={widgetConfig}
    integrator="svelte-example"
  />
{/if}

<style>
</style>
