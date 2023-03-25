<svelte:options tag="native-token-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import { coinGeko } from "~/lib/network";
  import numeral from "numeral";
  import { sendMessage } from "webext-bridge";
  import {
    formatCurrency,
    exponentialToDecimal,
    getCgLogo,
    getLocalImg,
    add3Dots,
  } from "~/utils";

  import "~/components/ResetStyle.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";
  import "~/components/Tooltip.custom.svelte";

  import More from "../../../assets/more.svg";

  export let name;
  export let id;
  export let loaded = true;

  let isLoading = false;
  let price = 0;
  let priceChange = 0;
  let openShowCategoryList = false;
  let showTooltip = false;
  let numberTooltip = false;

  let min = 0;
  let max = 0;
  let currentMarketcap = 0;
  let percent = 0;

  let coinInfo = {
    symbol: "",
    name: "",
    logo_url: "",
    categories: [],
  };

  const loadSymbolInfo = async () => {
    isLoading = true;
    try {
      const data = (await sendMessage("tokenInfoData", { id: id })) as any;

      priceChange = data?.price?.usd_24h_change;

      currentMarketcap = data?.marketcap?.current;
      min = data?.marketcap?.min;
      max = data?.marketcap?.max;

      price = data?.price?.usd;
      coinInfo = {
        symbol: data?.symbol,
        name: data?.name,
        logo_url: data?.image?.large,
        categories: data?.categories || [],
      };
    } catch (e) {
      console.log(e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    loadSymbolInfo();
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
      <div class="max-w-sm max-h-[600px]">
        {#if coinInfo}
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <img
                class="w-[40px] h-[40px] rounded-full"
                src={getCgLogo(id)}
                alt={name}
              />
              <a
                href={`https://www.coingecko.com/en/coins/${id}`}
                target="_blank"
                class="no-underline flex flex-col gap-1"
              >
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <div
                      class="text-sm font-medium text-black flex-1"
                      on:mouseenter={() => (showTooltip = true)}
                      on:mouseleave={() => (showTooltip = false)}
                    >
                      {coinInfo?.name ? add3Dots(coinInfo?.name, 10) : "-"}
                    </div>
                    {#if showTooltip && coinInfo?.name.length >= 10}
                      <div
                        class="absolute -top-7 -left-1"
                        style="z-index: 2147483646;"
                      >
                        <tooltip-detail address={coinInfo?.name} />
                      </div>
                    {/if}
                  </div>
                  <div class="h-4 w-4 -mt-2">
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
                  </div>
                </div>
                <div
                  class="text-[11px] text-[#00000099] font-normal py-[2px] px-1 rounded bg-[#E9EBF1] w-max"
                >
                  {name}
                </div>
              </a>
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
                      <tooltip-detail address={exponentialToDecimal(price)} />
                    </div>
                  {/if}
                </div>

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
                  on:click={() =>
                    (openShowCategoryList = !openShowCategoryList)}
                >
                  More...
                </div>
                {#if openShowCategoryList}
                  <div class="content">
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
              <div class="text-xs text-[#000000B2] font-normal">Marketcap</div>
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
            <coin-chart symbol={id} {loaded} price={priceChange} />
          </div>

          {#if price}
            <price-convert symbol={name} {price} />
          {:else}
            <div>No data price</div>
          {/if}

          <!-- <div class="flex gap-4 items-center my-4">
            <div
              on:click={() => alert("Comming soon")}
              class="flex items-center justyfy-center btn-border px-3 py-2 text-white bg-sky-500 rounded cursor-pointer"
            >
              More info
            </div>
            <div
              on:click={() => alert("Comming soon")}
              class="flex items-center justyfy-center btn-border px-3 py-2 text-sky-500 rounded cursor-pointer"
            >
              Follow this coin
            </div>
          </div> -->
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
    left: 0;
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
