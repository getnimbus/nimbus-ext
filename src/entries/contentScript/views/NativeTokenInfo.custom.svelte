<svelte:options tag="native-token-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import numeral from "numeral";
  import { sendMessage } from "webext-bridge";
  import {
    formatCurrency,
    exponentialToDecimal,
    getLocalImg,
    add3Dots,
    shorterAddress,
  } from "~/utils";

  import type { TokenInfoData } from "~/types/TokenInfoData";

  import "~/components/ResetStyle.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";
  import "~/components/Tooltip.custom.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";

  import More from "../../../assets/more.svg";

  export let name;
  export let id;
  export let loaded;
  export let isSidebarSearch = true;
  export let address = "";

  let isLoading = false;
  let price = 0;
  let priceChange = 0;
  let openShowCategoryList = false;
  let showTooltip = false;
  let numberTooltip = false;
  let showTooltipGotoDetailToken = false;
  let moreElement;

  let min = 0;
  let max = 0;
  let currentMarketcap = 0;
  let percent = 0;

  let coinInfo = {
    symbol: "",
    name: "",
    logo_url: "",
    categories: [],
    cmc_slug: "",
    cmc_rank: -1,
  };

  const getTokeInfo = async () => {
    isLoading = true;
    try {
      const data: TokenInfoData = await sendMessage("tokenInfoData", {
        id: id,
      });

      priceChange = data?.price?.usd_24h_change;

      currentMarketcap = data?.marketcap?.current;
      min = data?.marketcap?.min;
      max = data?.marketcap?.max;

      price = data?.price?.usd;

      coinInfo = {
        symbol: data?.symbol,
        name: data?.name,
        logo_url: data?.logo_url,
        categories: data?.categories || [],
        cmc_slug: data?.cmc_slug || "",
        cmc_rank: data?.cmc_rank || -1,
      };
    } catch (e) {
      console.log(e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    getTokeInfo();
  });

  $: {
    if (currentMarketcap === max) {
      percent = 100;
    } else if (currentMarketcap === min) {
      percent = 0;
    } else {
      percent = ((currentMarketcap - min) / (max - min)) * 100;
    }
  }
</script>

<reset-style>
  <div class="p-4 rounded-[10px] bg-white">
    {#if isLoading}
      <div class="w-full h-[120px] flex justify-center items-center">
        <loading-icon />
      </div>
    {:else}
      <div class="max-h-[600px] w-full">
        {#if coinInfo}
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <img
                class="w-[40px] h-[40px] rounded-full"
                src={coinInfo.logo_url}
                alt={name}
              />
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <div
                      class="text-sm font-medium text-black flex-1"
                      on:mouseenter={() => (showTooltip = true)}
                      on:mouseleave={() => (showTooltip = false)}
                    >
                      {coinInfo?.name
                        ? isSidebarSearch
                          ? coinInfo?.name
                          : add3Dots(coinInfo?.name, 10)
                        : "-"}
                    </div>
                    {#if showTooltip && coinInfo?.name.length >= 10 && !isSidebarSearch}
                      <div
                        class="absolute -top-7 -left-1"
                        style="z-index: 2147483646;"
                      >
                        <tooltip-detail text={coinInfo?.name} />
                      </div>
                    {/if}
                  </div>
                  <a
                    href={`https://www.coingecko.com/en/coins/${id}`}
                    target="_blank"
                    class="h-4 w-4 -mt-2 relative"
                    on:mouseenter={() => (showTooltipGotoDetailToken = true)}
                    on:mouseleave={() => (showTooltipGotoDetailToken = false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="w-full h-full object-contain text-[#212121]"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                        clip-rule="evenodd"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {#if showTooltipGotoDetailToken}
                      <div
                        class="absolute -top-6 left-1/2 transform -translate-x-1/2"
                        style="z-index: 2147483648;"
                      >
                        <tooltip-detail text={"Go to token detail"} />
                      </div>
                    {/if}
                  </a>
                  {#if coinInfo.cmc_slug !== ""}
                    <a
                      href={`https://coinmarketcap.com/currencies/${coinInfo.cmc_slug}`}
                      target="_blank"
                      class="h-4 w-4 -mt-2"
                    >
                      <svg
                        viewBox="0 0 76.52 77.67"
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-full h-full object-contain text-[#212121]"
                        ><path
                          d="m66.54 46.41a4.09 4.09 0 0 1 -4.17.28c-1.54-.87-2.37-2.91-2.37-5.69v-8.52c0-4.09-1.62-7-4.33-7.79-4.58-1.34-8 4.27-9.32 6.38l-8.1 13.11v-16c-.09-3.69-1.29-5.9-3.56-6.56-1.5-.44-3.75-.26-5.94 3.08l-18.11 29.07a32 32 0 0 1 -3.64-14.94c0-17.52 14-31.77 31.25-31.77s31.3 14.25 31.3 31.77v.09s0 .06 0 .09c.17 3.39-.93 6.09-3 7.4zm10-7.57v-.17c-.14-21.35-17.26-38.67-38.29-38.67s-38.25 17.42-38.25 38.83 17.16 38.84 38.25 38.84a37.81 37.81 0 0 0 26-10.36 3.56 3.56 0 0 0 .18-5 3.43 3.43 0 0 0 -4.86-.23 30.93 30.93 0 0 1 -44.57-2.08l16.3-26.2v12.09c0 5.81 2.25 7.69 4.14 8.24s4.78.17 7.81-4.75l9-14.57c.28-.47.55-.87.79-1.22v7.41c0 5.43 2.18 9.77 6 11.91a11 11 0 0 0 11.21-.45c4.2-2.73 6.49-7.67 6.25-13.62z"
                          fill="#17181b"
                        /></svg
                      >
                    </a>
                  {/if}
                </div>
                {#if address}
                  <CopyToClipboard
                    iconSize={12}
                    {address}
                    isShorten
                    iconColor="#212121"
                    color="#00000099"
                  />
                {:else}
                  <div
                    class="text-[11px] text-[#00000099] font-normal py-[2px] px-1 rounded bg-[#E9EBF1] w-max"
                  >
                    {name}
                  </div>
                {/if}
              </div>
            </div>
            <div class="flex items-start gap-1">
              <div class="flex flex-col items-end gap-1">
                <div class="relative">
                  <div
                    class="text-base font-medium text-black"
                    on:mouseenter={() => (numberTooltip = true)}
                    on:mouseleave={() => (numberTooltip = false)}
                  >
                    {price ? `$${formatCurrency(price)}` : "--"}
                  </div>
                  {#if numberTooltip && numeral(price).format("0,0.00") === "NaN"}
                    <div
                      class="absolute -top-7 right-0"
                      style="z-index: 2147483646;"
                    >
                      <tooltip-detail text={exponentialToDecimal(price)} />
                    </div>
                  {/if}
                </div>
                {#if priceChange}
                  <div class="flex items-center gap-1">
                    <div
                      class={`text-[13px] font-medium ${
                        priceChange < 0 ? "text-[#EF4444]" : "text-[#00A878]"
                      }`}
                    >
                      {#if priceChange < 0}
                        ↓
                      {:else}
                        ↑
                      {/if}
                      {numeral(Math.abs(priceChange)).format("0,0.00")}%
                    </div>
                    <div class="text-[#00000066] text-xs font-medium">24h</div>
                  </div>
                {/if}
              </div>
              <!-- <div class="cursor-pointer -mt-[2px]">
                <img src={getLocalImg(More)} alt="more" />
              </div> -->
            </div>
          </div>

          <div class="flex gap-1 flex-wrap mt-3 mx-auto">
            {#each coinInfo.categories.slice(0, 3) as category}
              <div
                class="w-max px-1 py-[2px] text-[#27326F] text-[11px] font-normal bg-[#6AC7F533] rounded-[5px]"
              >
                {category}
              </div>
            {/each}
            {#if coinInfo.categories.length > 3}
              <div class="relative">
                <div
                  class="w-max px-1 py-[2px] text-[#27326F] text-[11px] font-normal bg-[#6AC7F533] rounded-[5px] flex items-center gap-1 cursor-pointer"
                  bind:this={moreElement}
                  on:click={() =>
                    (openShowCategoryList = !openShowCategoryList)}
                >
                  More...
                </div>
                {#if openShowCategoryList}
                  <div
                    class={`content ${
                      moreElement &&
                      moreElement.getBoundingClientRect().left > 1300
                        ? "right-0"
                        : "left-0"
                    }`}
                  >
                    {#each coinInfo.categories.slice(3) as category}
                      <div class="content_item" id={category.value}>
                        {category}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          <div class="mt-4">
            <div class="flex justify-between mb-[6px]">
              <div class="flex items-center gap-2">
                <div class="text-xs text-[#000000B2] font-normal">
                  Marketcap
                </div>
                {#if coinInfo.cmc_rank !== -1}
                  <div class="text-sm text-black font-medium">
                    Rank #{coinInfo.cmc_rank}
                  </div>
                {/if}
              </div>

              <div class="text-xs text-[#000000B2] font-medium uppercase">
                ${numeral(currentMarketcap).format("0,0.00 a")}
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="h-[6px] rounded-[5px] bg-[#27326F1A] relative">
                <div
                  style="left: {percent}%"
                  class={`absolute top-0 w-1 h-[6px] bg-[#4D4D4D]`}
                />
              </div>
              <div class="flex justify-between">
                <div class="text-[#000000B2] text-xs font-medium uppercase">
                  ${numeral(min).format("0,0.00 a")}
                </div>
                <div class="text-[#000000B2] text-xs font-medium uppercase">
                  ${numeral(max).format("0,0.00 a")}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-2">
            <coin-chart symbol={id} {loaded} />
          </div>

          {#if price}
            <price-convert symbol={name} {price} />
          {:else}
            <div class="text-xs">Empty price</div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</reset-style>

<style>
  .btn-border {
    border: 1px solid #0ea5e9;
  }

  .content {
    min-width: 120px;
    width: 120px;
    max-height: 400px;
    overflow-y: overlay;
    position: absolute;
    margin-top: 6px;
    z-index: 2147483646;
    background: #ffffff;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .content::-webkit-scrollbar {
    display: none;
  }

  .content .content_item {
    padding: 1px 4px;
    border-radius: 5px;
    background: #6ac7f533;
    color: #27326f;
    font-size: 11px;
    line-height: 20px;
    font-weight: 400;
  }
</style>
