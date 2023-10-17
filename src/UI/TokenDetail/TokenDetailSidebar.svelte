<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { priceSubscribe } from "~/lib/price-ws";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    typeWallet,
    isDarkMode,
    isHidePortfolio,
    wallet,
    user,
  } from "~/store";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let hiddenPortfolio = false;
  isHidePortfolio.subscribe((value) => (hiddenPortfolio = value));

  $: realizedProfit = data?.profit?.realizedProfit
    ? Number(data?.profit?.realizedProfit)
    : 0;
  $: percentRealizedProfit =
    Number(data?.avgCost) === 0
      ? 0
      : realizedProfit / Math.abs(Number(data?.avgCost));

  $: unrealizedProfit =
    Number(data?.profit?.averageCost || 0) === 0
      ? 0
      : Number(data?.amount) *
        (Number(data?.market_price) - Number(data?.profit.averageCost));

  $: percentUnrealizedProfit =
    Number(data?.profit?.averageCost || 0) === 0
      ? 0
      : (Number(data?.market_price) - Number(data?.profit?.averageCost)) /
        Number(data?.profit?.averageCost || 0);

  const handleGetTradeHistory = async () => {
    const response: any = await nimbus.get(
      `/v2/address/${selectedWallet}/token/${data?.contractAddress}/trade-history`
    );
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: queryHistoryTokenDetail = createQuery({
    queryKey: ["trade-history", data, selectedWallet],
    queryFn: () => handleGetTradeHistory(),
    staleTime: Infinity,
    retry: false,
    enabled:
      data !== undefined &&
      Object.keys(data).length !== 0 &&
      selectedWallet.length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (
      !$queryHistoryTokenDetail.isError &&
      $queryHistoryTokenDetail.data !== undefined
    ) {
      console.log("HELLO: ", $queryHistoryTokenDetail.data);
    }
  }
</script>

<ErrorBoundary>
  <div class="flex flex-col justify-between gap-6">
    <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
      <OverviewCard title={"Avg Cost"}>
        <div class="flex justify-end xl:text-3xl text-5xl">
          ${#if hiddenPortfolio}
            ******
          {:else if data?.profit}
            <TooltipNumber
              number={data?.profit?.averageCost}
              type="balance"
              personalValue
            />
          {:else}
            0
          {/if}
        </div>
      </OverviewCard>

      <OverviewCard title={"30D Trx (Buy/Sell)"}>
        <div class="xl:text-3xl text-5xl">0/0</div>
      </OverviewCard>
    </div>

    <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
      <OverviewCard title={"Realized PnL"}>
        <div class="flex flex-col">
          <div
            class={`xl:text-3xl text-5xl ${
              realizedProfit !== 0
                ? realizedProfit >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : ""
            }`}
          >
            <TooltipNumber
              number={Math.abs(realizedProfit)}
              type="value"
              personalValue
            />
          </div>
          <div class="flex items-center gap-1">
            <div
              class={`flex items-center xl:text-lg text-3xl ${
                realizedProfit !== 0
                  ? realizedProfit >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : ""
              }`}
            >
              <TooltipNumber
                number={Math.abs(percentRealizedProfit) * 100}
                type="percent"
              />
              <span>%</span>
            </div>
            {#if realizedProfit !== 0}
              <img
                src={realizedProfit >= 0 ? TrendUp : TrendDown}
                alt="trend"
                class="mb-1"
              />
            {/if}
          </div>
        </div>
      </OverviewCard>

      <OverviewCard title={"Unrealized PnL"}>
        <div class="flex flex-col">
          <div
            class={`xl:text-3xl text-5xl ${
              unrealizedProfit !== 0
                ? percentUnrealizedProfit >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : ""
            }`}
          >
            <TooltipNumber
              number={Math.abs(unrealizedProfit)}
              type="value"
              personalValue
            />
          </div>
          <div class="flex items-center gap-1">
            <div
              class={`flex items-center xl:text-lg text-3xl ${
                unrealizedProfit !== 0
                  ? unrealizedProfit >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : ""
              }`}
            >
              <TooltipNumber
                number={Math.abs(percentUnrealizedProfit) * 100}
                type="percent"
              />
              <span>%</span>
            </div>
            {#if unrealizedProfit !== 0}
              <img
                src={unrealizedProfit >= 0 ? TrendUp : TrendDown}
                alt="trend"
                class="mb-1"
              />
            {/if}
          </div>
        </div>
      </OverviewCard>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
  :global(body) .nft_detail_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .nft_detail_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }
</style>
