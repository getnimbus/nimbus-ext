<script lang="ts">
  import { LiFiWidget } from "nimbus-swap-widget";
  import ReactAdapter from "~/components/ReactAdapter.svelte";
  import { userPublicAddress, isDarkMode } from "~/store";
  import { currentLang } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";

  export let chain;
  export let address;
  export let showSideTokenSwap;
  export let owner;
  export let triggerFireworkBonus = (data) => {};

  const handleFormatBlockChainId = (chain: string) => {
    switch (chain) {
      case "ETH":
        return 1;
      case "ARB":
        return 42161;
      case "OP":
        return 10;
      case "MATIC":
        return 137;
      case "BNB":
        return 56;
      case "ZKSYNC":
        return 324;
      case "BASE":
        return 8453;
      case "AVAX":
        return 43114;
      case "POLYGON_ZKEVM":
        return 1101;
      case "LINEA":
        return 59144;
      case "XDAI":
        return 100;
      case "FANTOM":
        return 250;
      case "MOVR":
        return 1285;
      case "GLMR":
        return 1284;
      case "AURORA":
        return 1313161554;
      case "SOL":
        return 1151111081099710;
      case "METIS":
        return 1088;
      default:
        return -1;
    }

    return "";
  };

  $: widgetConfig = {
    integrator: "Nimbus",
    variant: "default",
    gmPointCoefficient: "5",
    userNimbusOwner: $userPublicAddress,
    referrerAddress: owner,
    fromToken: address,
    fromChain: handleFormatBlockChainId(chain),
    toChain: handleFormatBlockChainId(chain),
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
