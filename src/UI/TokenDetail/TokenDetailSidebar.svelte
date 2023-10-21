<script lang="ts">
  import { nimbus } from "~/lib/network";
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
  import Loading from "~/components/Loading.svelte";
  import TokenHistoryItem from "./TokenHistoryItem.svelte";
  import PriceChart from "./PriceChart.svelte";
  import BalanceAvgCostChart from "./BalanceAvgCostChart.svelte";

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
      `/v2/address/${selectedWallet}/token/${data?.contractAddress}/trade-history?chain=${data?.chain}`
    );
    if (response?.status === 403) {
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

  let sellHistoryTradeList = [];
  let buyHistoryTradeList = [];
  let dataHistoryTokenDetail = [];

  $: {
    if (
      !$queryHistoryTokenDetail.isError &&
      $queryHistoryTokenDetail.data !== undefined &&
      $queryHistoryTokenDetail.data.length !== 0
    ) {
      dataHistoryTokenDetail = $queryHistoryTokenDetail.data;
      sellHistoryTradeList = $queryHistoryTokenDetail.data.filter(
        (item) =>
          item?.from_token_address.toLowerCase() ===
          data?.contractAddress.toLowerCase()
      );
      buyHistoryTradeList = $queryHistoryTokenDetail.data.filter(
        (item) =>
          item?.to_token_address.toLowerCase() ===
          data?.contractAddress.toLowerCase()
      );
    }
  }
</script>

<ErrorBoundary>
  <PriceChart
    contractAddress={data?.contractAddress}
    {sellHistoryTradeList}
    {buyHistoryTradeList}
    id={data?.name}
    avgCost={data?.profit?.averageCost}
    chain={data?.chain}
  />

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
        <div class="xl:text-3xl text-5xl">
          {buyHistoryTradeList.length}/{sellHistoryTradeList.length}
        </div>
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

  <div class="flex flex-col gap-6">
    <div
      class={`rounded-[20px] p-6 flex flex-col gap-4 relative ${
        darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      <div class="xl:text-2xl text-4xl font-medium">Balance / Avg Cost</div>
      <BalanceAvgCostChart
        {data}
        id={data?.name}
        avgCost={data?.profit?.averageCost}
      />
      {#if typeWalletAddress !== "EVM" || data?.chain !== "ETH"}
        <div
          class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center gap-3 pt-62 ${
            darkMode ? "bg-[#222222e6]" : "bg-white/90"
          } z-30 backdrop-blur-md`}
        >
          <div class="text-lg">Coming soon 🚀</div>
        </div>
      {/if}
    </div>

    <div
      class={`rounded-[20px] p-6 flex flex-col gap-4 ${
        darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
      }`}
    >
      <div class="xl:text-2xl text-4xl font-medium">History</div>
      <div
        class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
          darkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
        }`}
      >
        <table class="table-auto xl:w-full w-[1400px] h-full">
          <thead>
            <tr class="bg_f4f5f8">
              <th
                class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[100px]"
              >
                <div class="text-left xl:text-xs text-xl uppercase font-medium">
                  Amount
                </div>
              </th>

              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-xl uppercase font-medium"
                >
                  Cost/Gain
                </div>
              </th>

              <th class="py-3">
                <div
                  class="text-right xl:text-xs text-xl uppercase font-medium"
                >
                  Price
                </div>
              </th>

              <th class="py-3 pr-3 rounded-tr-[10px]">
                <div
                  class="text-right xl:text-xs text-xl uppercase font-medium"
                >
                  Time
                </div>
              </th>
            </tr>
          </thead>
          {#if $queryHistoryTokenDetail.isFetching}
            <tbody>
              <tr>
                <td colspan="4">
                  <div
                    class="flex justify-center items-center h-full py-3 px-3"
                  >
                    <Loading />
                  </div>
                </td>
              </tr>
            </tbody>
          {:else}
            <tbody>
              {#if dataHistoryTokenDetail && dataHistoryTokenDetail?.length === 0}
                <tr>
                  <td colspan="4">
                    <div
                      class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                    >
                      Empty
                    </div>
                  </td>
                </tr>
              {:else}
                {#each dataHistoryTokenDetail as data}
                  <TokenHistoryItem {data} />
                {/each}
              {/if}
            </tbody>
          {/if}
        </table>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
