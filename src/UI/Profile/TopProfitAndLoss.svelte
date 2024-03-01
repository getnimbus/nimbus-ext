<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import dayjs from "dayjs";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, typeWallet, user } from "~/store";
  import { shorterAddress, shorterName } from "~/utils";

  import Image from "~/components/Image.svelte";
  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import defaultToken from "~/assets/defaultToken.png";
  import OverlaySidebar from "~/components/OverlaySidebar.svelte";
  import Tooltip from "~/components/Tooltip.svelte";
  import { wait } from "~/entries/background/utils";
  import TokenDetailSidebar from "../TokenDetail/TokenDetailSidebar.svelte";
  import { detectedChain } from "~/lib/chains";

  export let selectedAddress;
  export let isSync = false;
  export let enabledFetchAllData = false;

  let showSideTokenDetail = false;
  let selectedTokenDetail;
  let isShowTooltipContractAddress = false;
  let isCopied = false;
  let isShowTooltipSymbol = false;
  let isShowTooltipName = false;

  let topProfitToken = [];
  let topLossToken = [];

  $: isFetch = isSync ? enabledFetchAllData : true;

  const getTradingStats = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/trading-stats`
    );
    return response?.data;
  };

  const formatDataTradingStats = (data) => {
    const formatData = data?.metadata
      .filter(
        (item) => dayjs().subtract(30, "day").valueOf() < item.lastTrade * 1000
      )
      .map((item) => {
        return {
          ...item.holding,
          value:
            Number(item?.holding?.amount || 0) *
            Number(item?.holding?.price?.price || item?.holding?.rate),
        };
      })
      .sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

    let listProfitToken = [];
    let listLossToken = [];

    formatData
      .filter((item) => item?.profit?.realizedProfit)
      .map((item) => {
        return {
          ...item,
          realizedProfit: item?.profit?.realizedProfit,
          percentRealizedProfit:
            (item?.avgCost || 0) === 0
              ? 0
              : (Number(item?.profit?.realizedProfit) /
                  Number(Math.abs(item?.avgCost))) *
                100,
        };
      })
      .map((item) => {
        if (item.realizedProfit < 0) {
          listLossToken.push(item);
        } else {
          listProfitToken.push(item);
        }
      });

    topProfitToken = listProfitToken.sort(
      (a, b) => b.realizedProfit - a.realizedProfit
    );

    topLossToken = listLossToken.sort(
      (a, b) => a.realizedProfit - b.realizedProfit
    );
  };

  $: queryTradingStats = createQuery({
    queryKey: ["trading-stats", selectedAddress],
    queryFn: () => getTradingStats(selectedAddress),
    staleTime: Infinity,
    retry: false,
    enabled: selectedAddress?.length !== 0 && isFetch,
  });

  $: {
    if (
      !$queryTradingStats.isError &&
      $queryTradingStats.data &&
      $queryTradingStats.data !== undefined
    ) {
      formatDataTradingStats($queryTradingStats.data);
    }
  }
</script>

<div class="col-span-4 grid xl:grid-cols-2 grid-cols-1 gap-5">
  <div
    class="flex flex-col justify-between gap-5 border border_0000001a rounded-xl pt-6 pb-2"
  >
    <div class="xl:text-xl text-2xl font-medium px-6">Top Profit (30D)</div>

    <div class="max-h-[280px]">
      {#if $queryTradingStats.isFetching}
        <div class="h-full flex justify-center items-center py-4">
          <Loading />
        </div>
      {:else}
        <div class="h-full overflow-y-auto">
          <div class="h-full flex flex-col">
            {#if topProfitToken.length === 0}
              <div
                class="h-full flex items-center justify-center text-center py-4 px-6"
              >
                There are no closed holding position in the last 30 day
              </div>
            {:else}
              {#each topProfitToken as item}
                <div
                  class={`flex items-center justify-between gap-2 py-2 px-6 cursor-pointer ${
                    $isDarkMode
                      ? "bg-[#131313] hover:bg-[#000]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  on:click={() => {
                    showSideTokenDetail = true;
                    selectedTokenDetail = item;
                  }}
                >
                  <div class="flex-1 flex items-center gap-2">
                    <div class="w-[30px] h-[30px] overflow-hidden rounded-full">
                      <Image logo={item?.logo} defaultLogo={defaultToken} />
                    </div>
                    <span class="flex flex-col">
                      <span class="text-lg xl:text-sm font-medium">
                        {item.name}
                      </span>
                      <span
                        class="text-lg font-medium text_00000080 xl:text-xs"
                      >
                        {#if item.symbol === undefined}
                          N/A
                        {:else}
                          {shorterName(item.symbol, 20)}
                        {/if}
                      </span>
                    </span>
                  </div>
                  <div class="text-[#00A878] xl:text-sm text-lg font-medium">
                    <TooltipNumber number={item.realizedProfit} type="value" />
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div
    class="flex flex-col justify-between gap-5 border border_0000001a rounded-xl pt-6 pb-2"
  >
    <div class="xl:text-xl text-2xl font-medium px-3">Top Loss (30D)</div>

    <div class="max-h-[280px]">
      {#if $queryTradingStats.isLoading}
        <div class="h-full flex justify-center items-center py-4">
          <Loading />
        </div>
      {:else}
        <div class="h-full overflow-y-auto">
          <div class="h-full flex flex-col">
            {#if topLossToken.length === 0}
              <div
                class="h-full flex items-center justify-center text-center py-4 px-6"
              >
                There are no closed holding position in the last 30 day
              </div>
            {:else}
              {#each topLossToken as item}
                <div
                  class={`flex items-center justify-between gap-2 py-2 px-6 cursor-pointer ${
                    $isDarkMode
                      ? "bg-[#131313] hover:bg-[#000]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  on:click={() => {
                    showSideTokenDetail = true;
                    selectedTokenDetail = item;
                  }}
                >
                  <div class="flex-1 flex items-center gap-2">
                    <div class="w-[30px] h-[30px] overflow-hidden rounded-full">
                      <Image logo={item?.logo} defaultLogo={defaultToken} />
                    </div>
                    <span class="flex flex-col">
                      <span class="text-lg xl:text-sm font-medium">
                        {item.name}
                      </span>
                      <span
                        class="text-lg font-medium text_00000080 xl:text-xs"
                      >
                        {#if item.symbol === undefined}
                          N/A
                        {:else}
                          {shorterName(item.symbol, 20)}
                        {/if}
                      </span>
                    </span>
                  </div>
                  <div class="text-red-500 xl:text-sm text-lg font-medium">
                    <TooltipNumber number={item.realizedProfit} type="value" />
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Sidebar Token Detail -->
<OverlaySidebar isOpen={showSideTokenDetail}>
  <div class="flex justify-between items-start">
    <div
      class="xl:text-5xl text-6xl text-gray-500 cursor-pointer"
      on:click|stopPropagation={() => {
        showSideTokenDetail = false;
        selectedTokenDetail = {};
      }}
    >
      &times;
    </div>
    {#if selectedTokenDetail && Object.keys(selectedTokenDetail).length !== 0}
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="rounded-full w-[46px] h-[46px] overflow-hidden">
              <Image
                logo={selectedTokenDetail.logo}
                defaultLogo={defaultToken}
              />
            </div>
            {#if ($typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "BUNDLE") && selectedTokenDetail?.chain !== "CEX"}
              <div class="absolute -top-2 -right-1">
                <img
                  src={detectedChain(selectedTokenDetail?.chain)?.logo}
                  alt=""
                  width="26"
                  height="26"
                  class="rounded-full"
                />
              </div>
            {/if}
          </div>
          <div class="flex flex-col">
            <div class="flex items-start gap-2">
              <div
                class="relative font-medium xl:text-xl text-2xl"
                on:mouseover={() => {
                  isShowTooltipName = true;
                }}
                on:mouseleave={() => (isShowTooltipName = false)}
              >
                {#if selectedTokenDetail.name === undefined}
                  N/A
                {:else}
                  {selectedTokenDetail?.name?.length > 20
                    ? shorterName(selectedTokenDetail.name, 20)
                    : selectedTokenDetail.name}
                {/if}
                {#if isShowTooltipName && selectedTokenDetail?.name?.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={selectedTokenDetail.name} />
                  </div>
                {/if}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div
                class="relative font-medium text_00000080 xl:text-base text-lg"
                on:mouseover={() => {
                  isShowTooltipSymbol = true;
                }}
                on:mouseleave={() => (isShowTooltipSymbol = false)}
              >
                {#if selectedTokenDetail.symbol === undefined}
                  N/A
                {:else}
                  {shorterName(selectedTokenDetail.symbol, 20)}
                {/if}
                {#if isShowTooltipSymbol && selectedTokenDetail.symbol.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={selectedTokenDetail.symbol} />
                  </div>
                {/if}
              </div>
              <CopyToClipboard
                text={selectedTokenDetail?.contractAddress}
                let:copy
                on:copy={async () => {
                  isCopied = true;
                  await wait(1000);
                  isCopied = false;
                }}
              >
                <div
                  class="cursor-pointer relative"
                  on:mouseover={() => {
                    isShowTooltipContractAddress = true;
                  }}
                  on:mouseleave={() => (isShowTooltipContractAddress = false)}
                  on:click={copy}
                >
                  {#if isCopied}
                    <svg
                      width={20}
                      height={20}
                      id="Layer_1"
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 122.88 74.46"
                      fill={$isDarkMode ? "#d1d5db" : "#00000080"}
                      ><path
                        fill-rule="evenodd"
                        d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"
                      /></svg
                    >
                  {:else}
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 12 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.1875 3.3125H10.6875V10.1875H3.8125V7.6875"
                        stroke={$isDarkMode ? "#d1d5db" : "#00000080"}
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
                        stroke={$isDarkMode ? "#d1d5db" : "#00000080"}
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  {/if}

                  {#if isShowTooltipContractAddress}
                    <div
                      class="absolute right-0 -top-8"
                      style="z-index: 2147483648;"
                    >
                      <Tooltip
                        text={shorterAddress(
                          selectedTokenDetail?.contractAddress
                        )}
                      />
                    </div>
                  {/if}
                </div>
              </CopyToClipboard>
            </div>
          </div>
        </div>
        <div class="flex items-center font-medium xl:text-2xl text-3xl">
          $<TooltipNumber
            number={Number(selectedTokenDetail?.price.price)}
            type="balance"
          />
        </div>
      </div>
    {/if}
  </div>
  <TokenDetailSidebar data={selectedTokenDetail} {showSideTokenDetail} />
</OverlaySidebar>

<style windi:preflights:global windi:safelist:global></style>
