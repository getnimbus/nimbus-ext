<script lang="ts">
  import { LiFiWidget } from "nimbus-swap-widget";
  import ReactAdapter from "~/components/ReactAdapter.svelte";
  import { handleFormatBlockChainId } from "~/lib/price-mobulaWs";
  import { userPublicAddress, isDarkMode } from "~/store";
  import { currentLang } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";

  export let chain;
  export let address;
  export let showSideTokenSwap;
  export let owner;
  export let triggerFireworkBonus = (data) => {};

  $: widgetConfig = {
    integrator: "Nimbus",
    variant: "default",
    gmPointCoefficient: "5",
    userNimbusOwner: $userPublicAddress,
    referrerAddress: owner,
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
    onTriggerBonusSwap: (data: any) => {
      handleSwapBonus(data);
    },
  };

  const handleSwapBonus = async (data) => {
    try {
      const response = await nimbus.post(`/swap/${data?.address}/bonus`, {
        point: data?.point,
        txHash: data?.txHash,
      });
      if (response && response?.data) {
        mixpanel.track("user_swap_completed");
        triggerFireworkBonus(response?.data?.point);
      }
    } catch (e) {
      console.error(e);
    }
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
