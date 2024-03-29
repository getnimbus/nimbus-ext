<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    typeWallet,
    isDarkMode,
    isHidePortfolio,
    wallet,
    user,
    selectedPackage,
  } from "~/store";
  import { linkExplorer, listSupported } from "~/lib/chains";
  import { filterAvgCostType, shorterAddress } from "~/utils";
  import { useNavigate } from "svelte-navigator";
  import dayjs from "dayjs";

  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import Loading from "~/components/Loading.svelte";
  import TokenHistoryItem from "./TokenHistoryItem.svelte";
  import PriceChart from "./PriceChart.svelte";
  import BalanceAvgCostChart from "./BalanceAvgCostChart.svelte";
  import Select from "~/components/Select.svelte";
  import Button from "~/components/Button.svelte";
  import HistoryCsvExport from "./HistoryCSVExport.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let showSideTokenDetail;

  const navigate = useNavigate();

  $: realizedProfit = data?.profit?.realizedProfit
    ? Number(data?.profit?.realizedProfit)
    : 0;

  $: percentRealizedProfit =
    Number(data?.avgCost) === 0
      ? 0
      : realizedProfit / Math.abs(Number(data?.avgCost));

  $: pnl = data?.pnl
    ? Number(data?.pnl)
    : Number(data?.balance || 0) * Number(data?.market_price || 0) +
      Number(data?.profit?.totalGain || 0) -
      Number(data?.profit?.cost || 0);

  $: unrealizedProfit =
    Number(data?.avgCost) === 0 ? 0 : Number(pnl) - realizedProfit;

  $: percentUnrealizedProfit =
    Number(data?.avgCost) === 0
      ? 0
      : unrealizedProfit / Math.abs(Number(data?.avgCost));

  const handleGetTradeHistory = async (address) => {
    const response: any = await nimbus.get(
      `/v2/address/${address}/token/${data?.contractAddress}/trade-history?chain=${data?.chain}`
    );
    return response?.data;
  };

  let exportCSV = false;
  let isLoading = false;

  const handleGetTokenTradeHistory = async (address) => {
    try {
      isLoading = true;
      const response: any = await nimbus.get(
        `/tokens/${address}/trade-history`,
        {
          params: {
            chain: data?.chain,
            token: data?.contractAddress,
          },
        }
      );
      if (response?.data && response?.data.length !== 0) {
        handleFormatDataCSV(response?.data, data?.contractAddress);
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  };

  $: {
    if (
      data !== undefined &&
      Object.keys(data).length !== 0 &&
      $wallet &&
      $wallet?.length !== 0 &&
      $selectedPackage !== "FREE" &&
      exportCSV
    ) {
      handleGetTokenTradeHistory($wallet);
    }
  }

  $: queryHistoryTokenDetail = createQuery({
    queryKey: ["trade-history", data, $wallet],
    queryFn: () => handleGetTradeHistory($wallet),
    staleTime: Infinity,
    retry: false,
    enabled:
      data !== undefined &&
      Object.keys(data).length !== 0 &&
      $wallet &&
      $wallet?.length !== 0,
  });

  let sellHistoryTradeList = [];
  let buyHistoryTradeList = [];
  let buyAmounts = 0;
  let sellAmounts = 0;
  let dataHistoryTokenDetail = [];
  let dataCSV = [];

  let filterType = {
    label: "ALL",
    value: "all",
  };

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
      buyAmounts = (buyHistoryTradeList || []).reduce(
        (prev, item) => prev + Number(item.quantity_out),
        0
      );
      sellAmounts = (sellHistoryTradeList || []).reduce(
        (prev, item) => prev + Number(item.quantity_in),
        0
      );
    }
  }

  $: totalFee = dataHistoryTokenDetail?.reduce(
    (total, item) => total + Number(item?.fee),
    0
  );

  $: avgFee =
    totalFee /
    (Number(buyHistoryTradeList.length) + Number(sellHistoryTradeList.length));

  $: colspan =
    listSupported.filter((item) => item !== "CEX").includes($typeWallet) &&
    dataHistoryTokenDetail.find((item) => item.chain !== "CEX") !== undefined
      ? 6
      : 5;

  const triggerExportCSV = () => {
    exportCSV = !exportCSV;
  };

  $: {
    if (!showSideTokenDetail) {
      exportCSV = false;
    }
  }

  const handleFormatDataCSV = (dataHistory, address) => {
    dataCSV = dataHistory.map((item) => {
      return {
        trx_hash: item.transaction_hash,
        trx_link:
          item.transaction_hash && item.chain !== "CEX"
            ? linkExplorer(item.chain, item.transaction_hash).trx
            : "",
        value: `$${Number(item?.amount_usd)}`,
        time: dayjs(item?.created_at * 1000).format("YYYY-MM-DD HH:mm:ss"),
        fee: `$${Number(item?.fee)}`,
        amount_in: Number(item?.quantity_in),
        token_address_in: item.from_token_address,
        token_in_symbol:
          item?.from_token_address?.toLowerCase() === address?.toLowerCase()
            ? data?.symbol
            : "",
        amount_out: Number(item?.quantity_out),
        token_address_out: item?.to_token_address,
        token_out_symbol:
          item?.to_token_address?.toLowerCase() === address?.toLowerCase()
            ? data?.symbol
            : "",
      };
    });
  };
</script>

<ErrorBoundary>
  {#if showSideTokenDetail}
    <PriceChart
      contractAddress={data?.contractAddress}
      cgId={data?.cg_id}
      {sellHistoryTradeList}
      {buyHistoryTradeList}
      id={data?.name}
      symbol={data?.symbol}
      avgCost={data?.profit?.averageCost}
      chain={data?.chain}
      price={Number(data?.market_price || 0)}
    />
  {/if}

  <div class="flex flex-col justify-between gap-6">
    <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
      <OverviewCard title={"Avg Cost"}>
        <div class="flex justify-end text-3xl">
          ${#if data?.profit}
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
        <div class="text-3xl">
          {buyHistoryTradeList.length}/{sellHistoryTradeList.length}
        </div>
      </OverviewCard>
    </div>

    <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
      <OverviewCard title={"Realized PnL"}>
        <div class="flex flex-col">
          <div
            class={`text-3xl ${
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
              class={`flex items-center text-lg ${
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
            class={`text-3xl ${
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
              class={`flex items-center text-lg ${
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

    <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
      <OverviewCard title={"Total Fee"}>
        <div class="flex justify-end text-3xl">
          ${#if $isHidePortfolio}
            ******
          {:else if totalFee}
            <TooltipNumber number={totalFee} type="balance" personalValue />
          {:else}
            0
          {/if}
        </div>
      </OverviewCard>

      <OverviewCard title={"Avg Fee"}>
        <div class="flex justify-end text-3xl">
          ${#if $isHidePortfolio}
            ******
          {:else if avgFee}
            <TooltipNumber number={avgFee} type="balance" personalValue />
          {:else}
            0
          {/if}
        </div>
      </OverviewCard>
    </div>
  </div>

  <div class="flex flex-col gap-6">
    {#if $typeWallet !== "CEX"}
      <div
        class={`rounded-[20px] flex flex-col gap-4 relative py-4 px-3 ${
          $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
        }`}
      >
        <div class="flex justify-between items-center">
          <div class="text-2xl font-medium">Avg Cost distribution</div>
          <Select
            type="lang"
            positionSelectList="right-0"
            listSelect={filterAvgCostType}
            bind:selected={filterType}
          />
        </div>

        <BalanceAvgCostChart
          {data}
          id={data?.name}
          avgCost={data?.profit?.averageCost || 0}
          {filterType}
        />

        {#if $typeWallet !== "EVM" && $typeWallet !== "MOVE" && $typeWallet !== "BUNDLE"}
          <div
            class={`absolute top-0 left-0 xl:rounded-[20px] w-full h-full flex flex-col items-center gap-3 pt-62 z-7 backdrop-blur-md ${
              $isDarkMode ? "bg-black/90" : "bg-white/95"
            }`}
          >
            <div class="text-lg">Coming soon 🚀</div>
          </div>
        {/if}

        {#if $selectedPackage === "FREE"}
          <div
            class={`absolute top-0 left-0 xl:rounded-[20px] w-full h-full flex flex-col items-center justify-center gap-3 z-7 backdrop-blur-md ${
              $isDarkMode ? "bg-black/90" : "bg-white/95"
            }`}
          >
            <div class="flex flex-col items-center gap-1">
              <div class="text-lg font-medium">
                Use Nimbus at its full potential
              </div>
              <div class="text-base text-gray-500">
                Upgrade to Premium to access Compare feature
              </div>
            </div>
            <div class="mt-2 w-max">
              <Button variant="premium" on:click={() => navigate("/upgrade")}
                >Upgrade Plan</Button
              >
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <div
      class={`rounded-[20px] flex flex-col gap-4 py-4 px-3 ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
      }`}
    >
      <div class="flex justify-between items-center gap-6">
        {#if sellAmounts > buyAmounts}
          <TooltipTitle
            tooltipText="Unusual trade. Total sell amount > total buy amount"
            type="warning"
          >
            <div class="text-2xl font-medium">History</div>
          </TooltipTitle>
        {:else}
          <div class="text-2xl font-medium">History</div>
        {/if}
        <HistoryCsvExport
          data={dataCSV}
          name={`${shorterAddress($wallet)}_${data?.symbol}_Trades`}
          {triggerExportCSV}
          {isLoading}
          isDisabled={dataHistoryTokenDetail &&
            dataHistoryTokenDetail.length === 0}
        />
      </div>

      <div
        class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
          $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
        }`}
      >
        <table class="table-auto xl:w-full w-[1400px] h-full">
          <thead>
            <tr class="bg_f4f5f8">
              <th
                class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[100px]"
              >
                <div class="text-left text-sm uppercase font-medium">
                  Amount
                </div>
              </th>

              <th class="py-3">
                <div class="text-right text-sm uppercase font-medium">
                  Cost/Gain
                </div>
              </th>

              <th class="py-3">
                <div class="text-right text-sm uppercase font-medium">
                  Price
                </div>
              </th>

              <th class="py-3">
                <div class="text-right text-sm uppercase font-medium">Fee</div>
              </th>

              <th
                class={`py-3 rounded-tr-[10px] ${
                  listSupported
                    .filter((item) => item !== "CEX")
                    .includes($typeWallet) &&
                  dataHistoryTokenDetail.find(
                    (item) => item.chain !== "CEX"
                  ) !== undefined
                    ? ""
                    : "pr-3"
                }`}
              >
                <div class="text-right text-sm uppercase font-medium">Time</div>
              </th>

              {#if listSupported
                .filter((item) => item !== "CEX")
                .includes($typeWallet) && dataHistoryTokenDetail.find((item) => item.chain !== "CEX") !== undefined}
                <th class="py-3 w-10" />
              {/if}
            </tr>
          </thead>
          {#if $queryHistoryTokenDetail.isFetching}
            <tbody>
              <tr>
                <td {colspan}>
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
                  <td {colspan}>
                    <div
                      class="flex justify-center items-center h-full py-3 px-3 text-base text-gray-400"
                    >
                      Empty
                    </div>
                  </td>
                </tr>
              {:else}
                {#each dataHistoryTokenDetail as item}
                  <TokenHistoryItem
                    data={item}
                    contractAddress={data?.contractAddress}
                  />
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
