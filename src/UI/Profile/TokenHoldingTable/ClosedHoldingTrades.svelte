<script lang="ts">
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { timeFrame } from "~/utils";
  import VirtualList from "svelte-tiny-virtual-list";
  import { typeWallet, isDarkMode } from "~/store";
  import { detectedChain } from "~/lib/chains";
  import { shorterAddress, shorterName } from "~/utils";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { wait } from "~/entries/background/utils";

  import Loading from "~/components/Loading.svelte";
  import "~/components/Tooltip.custom.svelte";
  import Image from "~/components/Image.svelte";
  import Tooltip from "~/components/Tooltip.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TokenDetailSidebar from "~/UI/TokenDetail/TokenDetailSidebar.svelte";
  import OverlaySidebar from "~/components/OverlaySidebar.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import defaultToken from "~/assets/defaultToken.png";

  export let holdingTokenData;
  export let isLoading;

  let sortTypeROI = "default";
  let sortTypeLastActivity = "asc";
  let selectedTimeFrame: "7D" | "30D" | "3M" | "1Y" | "ALL" = "30D";

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;

  let showSideTokenDetail = false;
  let selectedTokenDetail = {};
  let isCopied = false;
  let isShowTooltipContractAddress = false;

  $: formatData = holdingTokenData
    .map((item) => {
      return {
        ...item,
        realizedProfit: item?.profit?.realizedProfit
          ? Number(item?.profit?.realizedProfit)
          : 0,
      };
    })
    .sort(
      (a, b) =>
        dayjs(b?.profit?.latestTrade).valueOf() -
        dayjs(a?.profit?.latestTrade).valueOf()
    )
    .filter((element) => {
      switch (selectedTimeFrame) {
        case "7D":
          return (
            element?.profit &&
            dayjs().subtract(8, "day").valueOf() <
              dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "30D":
          return (
            element?.profit &&
            dayjs().subtract(1, "month").valueOf() <
              dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "3M":
          return (
            element?.profit &&
            dayjs().subtract(3, "month").valueOf() <
              dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "1Y":
          return (
            element?.profit &&
            dayjs().subtract(1, "year").valueOf() <
              dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "ALL":
          return element;
      }
    });

  const toggleSortROI = () => {
    sortTypeLastActivity = "default";
    switch (sortTypeROI) {
      case "desc":
        sortTypeROI = "asc";
        break;
      case "asc":
        sortTypeROI = "desc";
        break;
      case "default":
        sortTypeROI = "asc";
        break;
    }

    if (sortTypeROI === "asc") {
      formatData = formatData.sort(
        (a, b) => b.realizedProfit - a.realizedProfit
      );
    }
    if (sortTypeROI === "desc") {
      formatData = formatData.sort(
        (a, b) => a.realizedProfit - b.realizedProfit
      );
    }
  };

  const toggleSortLastActivity = () => {
    sortTypeROI = "default";
    switch (sortTypeLastActivity) {
      case "desc":
        sortTypeLastActivity = "asc";
        break;
      case "asc":
        sortTypeLastActivity = "desc";
        break;
      case "default":
        sortTypeLastActivity = "asc";
        break;
    }

    if (sortTypeLastActivity === "asc") {
      formatData = formatData.sort(
        (a, b) =>
          dayjs(b?.profit?.latestTrade).valueOf() -
          dayjs(a?.profit?.latestTrade).valueOf()
      );
    }
    if (sortTypeLastActivity === "desc") {
      formatData = formatData.sort(
        (a, b) =>
          dayjs(a?.profit?.latestTrade).valueOf() -
          dayjs(b?.profit?.latestTrade).valueOf()
      );
    }
  };

  $: sortIcon = (sortType) => {
    return `<svg
                    height="0.9rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0" /><g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M16.0686 15H7.9313C7.32548 15 7.02257 15 6.88231 15.1198C6.76061 15.2238 6.69602 15.3797 6.70858 15.5393C6.72305 15.7232 6.93724 15.9374 7.36561 16.3657L11.4342 20.4344C11.6323 20.6324 11.7313 20.7314 11.8454 20.7685C11.9458 20.8011 12.054 20.8011 12.1544 20.7685C12.2686 20.7314 12.3676 20.6324 12.5656 20.4344L16.6342 16.3657C17.0626 15.9374 17.2768 15.7232 17.2913 15.5393C17.3038 15.3797 17.2392 15.2238 17.1175 15.1198C16.9773 15 16.6744 15 16.0686 15Z"
                        stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "desc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.9313 9.00005H16.0686C16.6744 9.00005 16.9773 9.00005 17.1175 8.88025C17.2393 8.7763 17.3038 8.62038 17.2913 8.46082C17.2768 8.27693 17.0626 8.06274 16.6342 7.63436L12.5656 3.56573C12.3676 3.36772 12.2686 3.26872 12.1544 3.23163C12.054 3.199 11.9458 3.199 11.8454 3.23163C11.7313 3.26872 11.6323 3.36772 11.4342 3.56573L7.36561 7.63436C6.93724 8.06273 6.72305 8.27693 6.70858 8.46082C6.69602 8.62038 6.76061 8.7763 6.88231 8.88025C7.02257 9.00005 7.32548 9.00005 7.9313 9.00005Z"
                         stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "asc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                  </svg>`;
  };

  const handlePercentRealizedProfit = (data) => {
    return Number(data?.avgCost) === 0
      ? 0
      : data.realizedProfit / Math.abs(Number(data?.avgCost));
  };

  const formatTime = (date: Date) => {
    if (dayjs().diff(date, "days") >= 1) {
      return dayjs(date).format("YYYY-MM-DD");
    }
    return dayjs(date).fromNow();
  };

  const closeSideBar = (event) => {
    if (event.key === "Escape") {
      showSideTokenDetail = false;
      selectedTokenDetail = {};
    }
  };
</script>

<svelte:window on:keydown={closeSideBar} />

<div
  class="col-span-4 border border_0000001a rounded-xl flex flex-col gap-3 p-6"
>
  <div class="flex justify-between text-3xl font-medium xl:text-xl">
    <div class="text-3xl font-medium xl:text-xl">Closed Trades</div>
    <div class="flex justify-between">
      <AnimateSharedLayout>
        {#each timeFrame as type}
          <div
            class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
            on:click={() => {
              selectedTimeFrame = type.value;
            }}
          >
            <div
              class={`relative z-2 ${
                type.value === selectedTimeFrame && "text-white"
              }`}
            >
              {type.label}
            </div>
            {#if type.value === selectedTimeFrame}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class="absolute inset-0 rounded-full z-1 bg-[#1E96FC]"
                  use:motion
                />
              </Motion>
            {/if}
          </div>
        {/each}
      </AnimateSharedLayout>
    </div>
  </div>

  <div
    class={`rounded-[10px] overflow-hidden w-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <div class="bg_f4f5f8 grid grid-cols-5 sticky top-0 z-9">
      <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
        <div class="text-left xl:text-xs text-xl uppercase font-medium">
          Assets
        </div>
      </div>

      <div class="py-3">
        <div class="text-right xl:text-xs text-xl uppercase font-medium">
          Avg Cost
        </div>
      </div>

      <div class="py-3">
        <div
          class="flex items-center justify-end gap-2 cursor-pointer"
          on:click={toggleSortROI}
        >
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            ROI
          </div>
          <div>
            {@html sortIcon(sortTypeROI)}
          </div>
        </div>
      </div>

      <div class="py-3 pr-3 rounded-tr-[10px]">
        <div
          class="flex items-center justify-end gap-2 cursor-pointer"
          on:click={toggleSortLastActivity}
        >
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            Last activity
          </div>
          <div>
            {@html sortIcon(sortTypeLastActivity)}
          </div>
        </div>
      </div>
    </div>

    {#if ((holdingTokenData && holdingTokenData.length === 0) || (formatData && formatData.length === 0)) && !isLoading}
      <div class="grid grid-cols-5">
        <div
          class="col-span-full flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
        >
          Empty
        </div>
      </div>
    {:else}
      <VirtualList
        scrollDirection="vertical"
        width="100%"
        height={formatData.length < 10 ? formatData.length * 75 : 405}
        itemCount={formatData.length}
        itemSize={75}
      >
        <div
          class="grid grid-cols-5 group transition-all cursor-pointer"
          slot="item"
          let:index
          let:style
          {style}
          on:click={() => {
            showSideTokenDetail = true;
            selectedTokenDetail = formatData[index];
          }}
        >
          <div
            class={`col-spans-2 pl-3 py-3 ${
              $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
            }`}
          >
            <div class="relative flex items-center gap-3 text-left">
              <div class="relative">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image
                    logo={formatData[index].logo}
                    defaultLogo={defaultToken}
                  />
                </div>
                {#if ($typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "BUNDLE") && formatData[index]?.chain !== "CEX"}
                  <div class="absolute -top-2 -right-1">
                    <img
                      src={detectedChain(formatData[index]?.chain)?.logo}
                      alt=""
                      width="15"
                      height="15"
                      class="rounded-full"
                    />
                  </div>
                {/if}
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex items-start gap-2">
                  <div
                    class="relative text-2xl font-medium xl:text-sm"
                    on:mouseover={() => {
                      isShowTooltipName = true;
                    }}
                    on:mouseleave={() => (isShowTooltipName = false)}
                  >
                    {#if formatData[index].name === undefined}
                      N/A
                    {:else}
                      <div class="flex">
                        {formatData[index]?.name?.length > 20
                          ? shorterName(formatData[index].name, 20)
                          : formatData[index].name}
                      </div>
                    {/if}
                    {#if isShowTooltipName && formatData[index]?.name?.length > 20}
                      <div
                        class="absolute left-0 -top-8"
                        style="z-index: 2147483648;"
                      >
                        <Tooltip text={formatData[index].name} />
                      </div>
                    {/if}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <div
                    class="relative text-lg font-medium text_00000080 xl:text-xs"
                    on:mouseover={() => {
                      isShowTooltipSymbol = true;
                    }}
                    on:mouseleave={() => (isShowTooltipSymbol = false)}
                  >
                    {#if formatData[index].symbol === undefined}
                      N/A
                    {:else}
                      {shorterName(formatData[index].symbol, 20)}
                    {/if}
                    {#if isShowTooltipSymbol && formatData[index].symbol.length > 20}
                      <div
                        class="absolute left-0 -top-8"
                        style="z-index: 2147483648;"
                      >
                        <Tooltip text={formatData[index].symbol} />
                      </div>
                    {/if}
                  </div>

                  {#if formatData[index]?.positionType === "ERC_404"}
                    <span
                      class="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-100 px-1 py-0.5 text-[10px] font-medium text-yellow-800"
                    >
                      <svg
                        class="h-1.5 w-1.5 fill-yellow-500"
                        viewBox="0 0 6 6"
                        aria-hidden="true"
                      >
                        <circle cx={3} cy={3} r={3} />
                      </svg>
                      ERC 404
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <div
            class={`py-3 ${
              $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
            }`}
          >
            <div
              class="h-full flex items-center justify-end text-2xl font-medium xl:text-sm text_00000099"
            >
              $<TooltipNumber
                number={formatData[index].profit.averageCost}
                type="balance"
              />
            </div>
          </div>

          <div
            class={`py-3 ${
              $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
            }`}
          >
            <div
              class="flex items-center justify-end gap-1 text-2xl font-medium xl:text-sm view-token-detail1"
            >
              {#if ["BTC"].includes($typeWallet)}
                N/A
              {:else}
                <div class="flex flex-col">
                  <div
                    class={`flex justify-end ${
                      formatData[index].realizedProfit !== 0
                        ? formatData[index].realizedProfit >= 0
                          ? "text-[#00A878]"
                          : "text-red-500"
                        : "text_00000099"
                    }`}
                  >
                    <TooltipNumber
                      number={Math.abs(formatData[index].realizedProfit)}
                      type="value"
                      personalValue
                    />
                  </div>
                  <div class="flex items-center justify-end gap-1">
                    <div
                      class={`flex items-center ${
                        formatData[index].realizedProfit !== 0
                          ? formatData[index].realizedProfit >= 0
                            ? "text-[#00A878]"
                            : "text-red-500"
                          : "text_00000099"
                      }`}
                    >
                      <TooltipNumber
                        number={Math.abs(
                          handlePercentRealizedProfit(formatData[index])
                        ) * 100}
                        type="percent"
                      />
                      <span>%</span>
                    </div>
                    {#if formatData[index].realizedProfit !== 0}
                      <img
                        src={formatData[index].realizedProfit >= 0
                          ? TrendUp
                          : TrendDown}
                        alt="trend"
                        class="mb-1"
                      />
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <div
            class={`py-3 pr-3 ${$isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"}`}
          >
            <div
              class="h-full flex items-center justify-end text-2xl font-medium xl:text-sm text_00000099"
            >
              {#if formatData[index]?.profit?.latestTrade}
                {formatTime(formatData[index]?.profit?.latestTrade)}
              {/if}
            </div>
          </div>
        </div>
      </VirtualList>
    {/if}

    {#if isLoading}
      <div class="w-full h-full grid grid-cols-5">
        <div
          class="col-span-full flex justify-center items-center h-full py-3 px-3"
        >
          <Loading />
        </div>
      </div>
    {/if}
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
                logo={selectedTokenDetail?.logo}
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
                {#if selectedTokenDetail?.name === undefined}
                  N/A
                {:else}
                  {selectedTokenDetail?.name?.length > 20
                    ? shorterName(selectedTokenDetail?.name, 20)
                    : selectedTokenDetail?.name}
                {/if}
                {#if isShowTooltipName && selectedTokenDetail?.name?.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={selectedTokenDetail?.name} />
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
                {#if selectedTokenDetail?.symbol === undefined}
                  N/A
                {:else}
                  {shorterName(selectedTokenDetail?.symbol, 20)}
                {/if}
                {#if isShowTooltipSymbol && selectedTokenDetail?.symbol.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={selectedTokenDetail?.symbol} />
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

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
</style>
