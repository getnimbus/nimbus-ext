<script lang="ts">
  import { LiFiWidget } from "nimbus-swap-widget";
  import ReactAdapter from "~/components/ReactAdapter.svelte";
  import { wallet, userPublicAddress, isDarkMode } from "~/store";
  import { currentLang } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import mixpanel from "mixpanel-browser";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { handleFormatIdBlockChain } from "~/utils";

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
  };

  const queryClient = useQueryClient();

  $: widgetConfig = {
    // integrator: "nimbus", // NOTICE: Temp disable swap fee
    variant: "default",
    gmPointCoefficient: "5",
    userNimbusOwner: $userPublicAddress,
    referrerAddress: owner,
    fromToken: address,
    fromChain: handleFormatBlockChainId(chain),
    toChain: handleFormatBlockChainId(chain),
    toToken: "0x0000000000000000000000000000000000000000",
    chains: {
      deny: [1151111081099710],
    },
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

  const getHoldingToken = async (address, chain) => {
    try {
      await nimbus.get(
        `/v2/address/${address}/holding?chain=${chain}&force_refresh=${true}`
      );
    } catch (e) {
      console.error(e);
    }
  };

  const updateBalanceToken = async (data) => {
    try {
      const payload = [
        {
          chain: handleFormatIdBlockChain(data.from_token_chain),
          owner: $userPublicAddress,
          contract_address: data.from_token_ca,
        },
        {
          chain: handleFormatIdBlockChain(data.to_token_chain),
          owner: $userPublicAddress,
          contract_address: data.to_token_ca,
        },
      ];
      await nimbus.post("/v2/holding-realtime", payload);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwapBonus = async (data) => {
    try {
      const response = await nimbus.post(`/swap/${data?.address}/bonus`, {
        point: data?.point,
        txHash: data?.txHash,
      });
      if (response && response?.data) {
        mixpanel.track("user_swap_completed");
        getHoldingToken($wallet, chain);
        updateBalanceToken(data);
        queryClient.invalidateQueries(["token-holding"]);
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
