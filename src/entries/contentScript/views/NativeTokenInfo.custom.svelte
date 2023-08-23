<svelte:options tag="native-token-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { add3Dots } from "~/utils";

  import type { TokenInfoData } from "~/types/TokenInfoData";

  import "~/components/Loading.custom.svelte";
  import "~/components/ResetStyle.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";
  import "~/components/Tooltip.custom.svelte";
  import "~/components/CheckSafetyToken.custom.svelte";
  import Copy from "~/components/Copy.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let name;
  export let id;
  export let loaded;
  export let search;
  export let address;

  let isLoading = false;
  let price = 0;
  let priceChange = 0;
  let openShowCategoryList = false;
  let showTooltip = false;
  let showTooltipCoinGecko = false;
  let showTooltipCMC = false;
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

  const getTokenInfo = async () => {
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
    getTokenInfo();
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
      <div class="h-full w-full">
        {#if coinInfo}
          <div class="flex items-center justify-between">
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
                      class="flex-1 text-sm font-medium"
                      on:mouseenter={() => (showTooltip = true)}
                      on:mouseleave={() => (showTooltip = false)}
                    >
                      {coinInfo?.name
                        ? search
                          ? coinInfo?.name
                          : add3Dots(coinInfo?.name, 10)
                        : "-"}
                    </div>
                    {#if showTooltip && coinInfo?.name.length >= 10 && !search}
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
                    class="relative w-4 h-4 -mt-2"
                    on:mouseenter={() => (showTooltipCoinGecko = true)}
                    on:mouseleave={() => (showTooltipCoinGecko = false)}
                  >
                    <svg
                      version="1.1"
                      id="Layer_1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      width="100%"
                      viewBox="0 0 130 130"
                      enable-background="new 0 0 130 130"
                      xml:space="preserve"
                    >
                      <path
                        fill="#8CC640"
                        opacity="1.000000"
                        stroke="none"
                        d="
M131.000000,57.000000 
	C131.000000,63.021152 131.000000,69.042305 130.672409,75.726242 
	C126.245422,96.442734 115.971336,112.377365 97.906433,122.312782 
	C90.821442,126.209435 82.667252,128.162033 75.000000,131.000000 
	C68.978851,131.000000 62.957695,131.000000 56.274689,130.671448 
	C26.738447,123.925354 8.627264,106.579208 1.978957,77.565338 
	C1.849081,76.998550 1.334888,76.519814 1.000000,76.000000 
	C1.000000,69.645599 1.000000,63.291203 1.327633,56.273994 
	C7.883286,27.381535 24.726683,9.368647 52.947453,2.288438 
	C54.319679,1.944165 55.650108,1.433293 57.000000,1.000000 
	C62.688042,1.000000 68.376083,1.000000 74.741592,1.327464 
	C96.446571,5.317031 112.630692,16.197533 122.822418,34.953358 
	C126.526794,41.770519 128.329590,49.620987 131.000000,57.000000 
M67.669617,34.593678 
	C72.853539,36.328110 78.037468,38.062542 83.988960,39.800339 
	C91.320595,42.477032 98.943100,44.560196 105.912613,47.975792 
	C115.309883,52.581173 116.758698,60.664780 110.240662,68.973640 
	C107.172386,72.884933 103.662323,76.491829 100.067467,79.939499 
	C91.340828,88.308846 83.506844,97.323128 78.944870,108.687225 
	C76.923164,113.723396 75.289993,118.956802 76.719704,124.519165 
	C99.219704,123.777618 121.628136,100.428284 125.708771,73.910149 
	C129.903824,46.648495 112.813217,18.713875 86.159439,9.266678 
	C58.672554,-0.475806 28.585316,10.712248 13.686728,36.168118 
	C0.647401,58.447243 5.632729,87.567360 16.799000,99.079071 
	C21.500576,87.592857 23.501854,75.702583 23.929556,63.478218 
	C24.379354,50.622173 30.065470,41.486504 42.244755,36.285854 
	C50.463642,32.776325 58.658878,32.550331 67.669617,34.593678 
M46.378696,47.004932 
	C46.153244,48.472221 45.722897,49.941711 45.738663,51.406406 
	C45.799110,57.022385 52.580402,64.181587 57.331547,63.782600 
	C64.207664,63.205166 69.441216,57.424793 69.158218,50.720249 
	C68.941345,45.582127 65.791763,41.742584 60.648354,40.346165 
	C54.984890,38.808552 50.460312,40.761738 46.378696,47.004932 
M70.502975,77.108353 
	C70.182304,77.152718 69.855530,77.173737 69.544479,77.254951 
	C69.444435,77.281075 69.385818,77.465889 69.308258,77.578117 
	C70.492355,78.370712 71.577995,79.583702 72.876495,79.887817 
	C81.442947,81.894165 89.345863,79.361977 96.649796,76.835396 
	C88.453735,76.963951 79.822350,77.099335 70.502975,77.108353 
z"
                      />
                      <path
                        fill="#FEFEFD"
                        opacity="1.000000"
                        stroke="none"
                        d="
M131.000000,56.531342 
	C128.329590,49.620987 126.526794,41.770519 122.822418,34.953358 
	C112.630692,16.197533 96.446571,5.317031 75.209534,1.327464 
	C93.593452,1.000000 112.186913,1.000000 131.000000,1.000000 
	C131.000000,19.353643 131.000000,37.708164 131.000000,56.531342 
z"
                      />
                      <path
                        fill="#FEFEFD"
                        opacity="1.000000"
                        stroke="none"
                        d="
M56.531342,1.000000 
	C55.650108,1.433293 54.319679,1.944165 52.947453,2.288438 
	C24.726683,9.368647 7.883286,27.381535 1.327633,55.805592 
	C1.000000,37.739223 1.000000,19.478447 1.000000,1.000000 
	C19.353655,1.000000 37.708168,1.000000 56.531342,1.000000 
z"
                      />
                      <path
                        fill="#FEFEFD"
                        opacity="1.000000"
                        stroke="none"
                        d="
M75.468658,131.000000 
	C82.667252,128.162033 90.821442,126.209435 97.906433,122.312782 
	C115.971336,112.377365 126.245422,96.442734 130.672409,76.194504 
	C131.000000,94.260780 131.000000,112.521553 131.000000,131.000000 
	C112.646347,131.000000 94.291832,131.000000 75.468658,131.000000 
z"
                      />
                      <path
                        fill="#FEFEFD"
                        opacity="1.000000"
                        stroke="none"
                        d="
M1.000000,76.468658 
	C1.334888,76.519814 1.849081,76.998550 1.978957,77.565338 
	C8.627264,106.579208 26.738447,123.925354 55.806419,130.671448 
	C37.739883,131.000000 19.479769,131.000000 1.000000,131.000000 
	C1.000000,112.979698 1.000000,94.958511 1.000000,76.468658 
z"
                      />
                      <path
                        fill="#F8E987"
                        opacity="1.000000"
                        stroke="none"
                        d="
M67.161728,34.130535 
	C58.658878,32.550331 50.463642,32.776325 42.244755,36.285854 
	C30.065470,41.486504 24.379354,50.622173 23.929556,63.478218 
	C23.501854,75.702583 21.500576,87.592857 16.799000,99.079071 
	C5.632729,87.567360 0.647401,58.447243 13.686728,36.168118 
	C28.585316,10.712248 58.672554,-0.475806 86.159439,9.266678 
	C112.813217,18.713875 129.903824,46.648495 125.708771,73.910149 
	C121.628136,100.428284 99.219704,123.777618 76.719704,124.519165 
	C75.289993,118.956802 76.923164,113.723396 78.944870,108.687225 
	C83.506844,97.323128 91.340828,88.308846 100.067467,79.939499 
	C103.662323,76.491829 107.172386,72.884933 110.240662,68.973640 
	C116.758698,60.664780 115.309883,52.581173 105.912613,47.975792 
	C98.943100,44.560196 91.320595,42.477032 83.481522,39.486412 
	C79.000679,33.218479 75.050224,31.958828 67.161728,34.130535 
M122.741554,62.952946 
	C121.931564,49.456993 117.821663,37.472195 107.482773,27.581638 
	C112.618309,40.665421 117.481361,53.054993 122.356270,65.474770 
	C122.471214,64.915009 122.599434,64.290619 122.741554,62.952946 
M74.766914,11.836439 
	C80.884399,13.444856 87.001877,15.053272 93.647499,16.800549 
	C88.945778,11.339518 75.633400,7.880075 68.937065,10.319439 
	C70.920326,10.843212 72.457603,11.249201 74.766914,11.836439 
z"
                      />
                      <path
                        fill="#F5F7F2"
                        opacity="1.000000"
                        stroke="none"
                        d="
M46.557922,46.678169 
	C50.460312,40.761738 54.984890,38.808552 60.648354,40.346165 
	C65.791763,41.742584 68.941345,45.582127 69.158218,50.720249 
	C69.441216,57.424793 64.207664,63.205166 57.331547,63.782600 
	C52.580402,64.181587 45.799110,57.022385 45.738663,51.406406 
	C45.722897,49.941711 46.153244,48.472221 46.557922,46.678169 
M59.129066,43.321339 
	C52.905285,43.682343 50.128323,45.922436 49.880501,50.781902 
	C49.652809,55.246601 51.976357,58.415615 56.005619,59.135765 
	C60.652447,59.966290 64.273163,58.019295 65.559769,53.998142 
	C67.025444,49.417343 65.020790,45.732014 59.129066,43.321339 
z"
                      />
                      <path
                        fill="#5E6658"
                        opacity="1.000000"
                        stroke="none"
                        d="
M70.846970,77.171539 
	C79.822350,77.099335 88.453735,76.963951 96.649796,76.835396 
	C89.345863,79.361977 81.442947,81.894165 72.876495,79.887817 
	C71.577995,79.583702 70.492355,78.370712 69.308258,77.578117 
	C69.385818,77.465889 69.444435,77.281075 69.544479,77.254951 
	C69.855530,77.173737 70.182304,77.152718 70.846970,77.171539 
z"
                      />
                      <path
                        fill="#249B48"
                        opacity="1.000000"
                        stroke="none"
                        d="
M67.415672,34.362106 
	C75.050224,31.958828 79.000679,33.218479 83.097733,39.484730 
	C78.037468,38.062542 72.853539,36.328110 67.415672,34.362106 
z"
                      />
                      <path
                        fill="#FDFDF4"
                        opacity="1.000000"
                        stroke="none"
                        d="
M122.734604,63.309586 
	C122.599434,64.290619 122.471214,64.915009 122.356270,65.474770 
	C117.481361,53.054993 112.618309,40.665421 107.482773,27.581638 
	C117.821663,37.472195 121.931564,49.456993 122.734604,63.309586 
z"
                      />
                      <path
                        fill="#FCFBEE"
                        opacity="1.000000"
                        stroke="none"
                        d="
M74.380898,11.745815 
	C72.457603,11.249201 70.920326,10.843212 68.937065,10.319439 
	C75.633400,7.880075 88.945778,11.339518 93.647499,16.800549 
	C87.001877,15.053272 80.884399,13.444856 74.380898,11.745815 
z"
                      />
                      <path
                        fill="#5B5C5E"
                        opacity="1.000000"
                        stroke="none"
                        d="
M59.497826,43.426590 
	C65.020790,45.732014 67.025444,49.417343 65.559769,53.998142 
	C64.273163,58.019295 60.652447,59.966290 56.005619,59.135765 
	C51.976357,58.415615 49.652809,55.246601 49.880501,50.781902 
	C50.128323,45.922436 52.905285,43.682343 59.497826,43.426590 
z"
                      />
                    </svg>

                    {#if showTooltipCoinGecko}
                      <div
                        class="absolute transform -translate-x-1/2 -top-6 left-1/2"
                        style="z-index: 2147483648;"
                      >
                        <tooltip-detail text={"Go to CoinGecko detail"} />
                      </div>
                    {/if}
                  </a>
                  {#if coinInfo.cmc_slug !== ""}
                    <a
                      href={`https://coinmarketcap.com/currencies/${coinInfo.cmc_slug}`}
                      target="_blank"
                      class="relative w-4 h-4 -mt-2"
                      on:mouseenter={() => (showTooltipCMC = true)}
                      on:mouseleave={() => (showTooltipCMC = false)}
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
                      {#if showTooltipCMC}
                        <div
                          class="absolute transform -translate-x-1/2 -top-6 left-1/2"
                          style="z-index: 2147483648;"
                        >
                          <tooltip-detail text={"Go to CoinMarketCap detail"} />
                        </div>
                      {/if}
                    </a>
                  {/if}
                </div>
                {#if address}
                  <div class="text-xs">
                    <Copy
                      iconSize={12}
                      {address}
                      isShorten
                      iconColor="#212121"
                      color="#00000099"
                    />
                  </div>
                {:else}
                  <div
                    class="text-[11px] text_00000099 font-normal py-[2px] px-1 rounded bg-[#E9EBF1] w-max"
                  >
                    {name}
                  </div>
                {/if}
              </div>
            </div>
            <div class="flex items-start gap-1">
              <div class="flex flex-col items-end gap-1">
                <div class="relative">
                  <div class="text-base font-medium">
                    {#if price}
                      $<TooltipNumber number={price} type="balance" />
                    {:else}
                      --
                    {/if}
                  </div>
                </div>
                {#if priceChange}
                  <div class="flex items-center gap-1">
                    <div
                      class={`text-[13px] font-medium flex ${
                        priceChange < 0 ? "text-[#EF4444]" : "text-[#00A878]"
                      }`}
                    >
                      {#if priceChange < 0}
                        ↓
                      {:else}
                        ↑
                      {/if}
                      <TooltipNumber
                        number={Math.abs(priceChange)}
                        type="percent"
                      />%
                    </div>
                    <div class="text-[#00000066] text-xs font-medium">24h</div>
                  </div>
                {/if}
              </div>
              <!-- <div class="cursor-pointer -mt-[2px]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.0007 10.6666C14.9173 10.6666 15.6673 9.91659 15.6673 8.99992C15.6673 8.08325 14.9173 7.33325 14.0007 7.33325C13.084 7.33325 12.334 8.08325 12.334 8.99992C12.334 9.91659 13.084 10.6666 14.0007 10.6666ZM14.0007 12.3333C13.084 12.3333 12.334 13.0833 12.334 13.9999C12.334 14.9166 13.084 15.6666 14.0007 15.6666C14.9173 15.6666 15.6673 14.9166 15.6673 13.9999C15.6673 13.0833 14.9173 12.3333 14.0007 12.3333ZM14.0007 17.3333C13.084 17.3333 12.334 18.0833 12.334 18.9999C12.334 19.9166 13.084 20.6666 14.0007 20.6666C14.9173 20.6666 15.6673 19.9166 15.6673 18.9999C15.6673 18.0833 14.9173 17.3333 14.0007 17.3333Z"
                    fill="#B3B3B3"
                  />
                </svg>
              </div> -->
            </div>
          </div>

          <div class="flex flex-wrap gap-1 mx-auto mt-3">
            {#each coinInfo.categories.slice(0, 6) as category}
              <div
                class="w-max px-1 py-[2px] text_27326F text-[11px] font-normal bg-[#6AC7F533] rounded-[5px]"
              >
                {category}
              </div>
            {/each}
            {#if coinInfo.categories.length > 6}
              <div class="relative">
                <div
                  class="w-max px-1 py-[2px] text_27326F text-[11px] font-normal bg-[#6AC7F533] rounded-[5px] flex items-center gap-1 cursor-pointer"
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
                    {#each coinInfo.categories.slice(6) as category}
                      <div class="content_item" id={category.value}>
                        {category}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          {#if !search}
            <div class="mt-3">
              <check-safety-token {address} id={"1"} />
            </div>
          {/if}

          <div class="mt-3">
            <div class="flex justify-between mb-[6px]">
              <div class="flex items-center gap-2">
                <div class="text-xs text-[#000000B2] font-normal">
                  Marketcap
                </div>
                {#if coinInfo.cmc_rank !== -1}
                  <div
                    class="px-1 py-[2px] text_27326F text-[11px] font-medium bg-[#6AC7F533] rounded-[5px]"
                  >
                    Rank #{coinInfo.cmc_rank}
                  </div>
                {/if}
              </div>
              <div class="text-xs text-[#000000B2] font-medium uppercase">
                $<TooltipNumber number={currentMarketcap} type="balance" />
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
                  $<TooltipNumber number={min} type="balance" />
                </div>
                <div class="text-[#000000B2] text-xs font-medium uppercase">
                  $<TooltipNumber number={max} type="balance" />
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
