<script>
  import { typeWallet, isDarkMode, isHidePortfolio } from "~/store";
  import { detectedChain, shorterName } from "~/utils";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import OverlaySidebar from "./OverlaySidebar.svelte";
  import TokenDetailSidebar from "~/UI/TokenDetail/TokenDetailSidebar.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let selectedWallet;

  let typeWalletAddress = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let hiddenPortfolio = false;
  isHidePortfolio.subscribe((value) => (hiddenPortfolio = value));

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let isShowCMC = false;
  let isShowCoingecko = false;

  let showSideTokenDetail = false;
  let selectedTokenDetail = {};

  $: value = Number(data?.amount) * Number(data?.market_price);

  $: realizedProfit = data?.profit?.realizedProfit
    ? Number(data?.profit?.realizedProfit)
    : 0;

  $: percentRealizedProfit =
    Number(data?.avgCost) === 0
      ? 0
      : realizedProfit / Math.abs(Number(data?.avgCost));

  $: logo =
    data.logo ||
    "https://raw.githubusercontent.com/getnimbus/assets/main/token.png";
</script>

<tr
  key={data?.symbol}
  class="group transition-all"
  on:mouseover={() => {
    if (data?.cmc_slug) {
      isShowCMC = true;
    }
    if (data?.cg_id) {
      isShowCoingecko = true;
    }
  }}
  on:mouseleave={() => {
    if (data?.cmc_slug) {
      isShowCMC = false;
    }
    if (data?.cg_id) {
      isShowCoingecko = false;
    }
  }}
>
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 w-[420px] ${
      darkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left flex items-center gap-3">
      <div class="relative">
        <img
          src={logo}
          alt=""
          width="30"
          height="30"
          class="rounded-full"
          on:error={() => {
            logo =
              "https://raw.githubusercontent.com/getnimbus/assets/main/token.png";
          }}
        />
        {#if (typeWalletAddress === "EVM" || typeWalletAddress === "BUNDLE") && data?.chain !== "CEX" && data?.chain !== "SOL" && data?.chain !== "BTC"}
          <div class="absolute -top-2 -right-1">
            <img
              src={detectedChain(data.chain)}
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
            class="xl:text-sm text-2xl font-medium relative"
            on:mouseover={() => {
              isShowTooltipName = true;
            }}
            on:mouseleave={() => (isShowTooltipName = false)}
          >
            {#if data.name === undefined}
              N/A
            {:else}
              {data?.name?.length > 20 ? shorterName(data.name, 20) : data.name}
            {/if}
            {#if isShowTooltipName && data?.name?.length > 20}
              <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
                <tooltip-detail text={data.name} />
              </div>
            {/if}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div
            class="text_00000080 xl:text-xs text-lg font-medium relative"
            on:mouseover={() => {
              isShowTooltipSymbol = true;
            }}
            on:mouseleave={() => (isShowTooltipSymbol = false)}
          >
            {#if data.symbol === undefined}
              N/A
            {:else}
              {shorterName(data.symbol, 20)}
            {/if}
            {#if isShowTooltipSymbol && data.symbol.length > 20}
              <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
                <tooltip-detail text={data.symbol} />
              </div>
            {/if}
          </div>
          {#if isShowCMC}
            <a
              href={`https://coinmarketcap.com/currencies/${data?.cmc_slug}`}
              target="_blank"
              class="w-[20px] h-[20px] cursor-pointer"
            >
              <svg
                viewBox="0 0 76.52 77.67"
                xmlns="http://www.w3.org/2000/svg"
                class="w-full h-full object-contain rounded-full"
                ><path
                  d="m66.54 46.41a4.09 4.09 0 0 1 -4.17.28c-1.54-.87-2.37-2.91-2.37-5.69v-8.52c0-4.09-1.62-7-4.33-7.79-4.58-1.34-8 4.27-9.32 6.38l-8.1 13.11v-16c-.09-3.69-1.29-5.9-3.56-6.56-1.5-.44-3.75-.26-5.94 3.08l-18.11 29.07a32 32 0 0 1 -3.64-14.94c0-17.52 14-31.77 31.25-31.77s31.3 14.25 31.3 31.77v.09s0 .06 0 .09c.17 3.39-.93 6.09-3 7.4zm10-7.57v-.17c-.14-21.35-17.26-38.67-38.29-38.67s-38.25 17.42-38.25 38.83 17.16 38.84 38.25 38.84a37.81 37.81 0 0 0 26-10.36 3.56 3.56 0 0 0 .18-5 3.43 3.43 0 0 0 -4.86-.23 30.93 30.93 0 0 1 -44.57-2.08l16.3-26.2v12.09c0 5.81 2.25 7.69 4.14 8.24s4.78.17 7.81-4.75l9-14.57c.28-.47.55-.87.79-1.22v7.41c0 5.43 2.18 9.77 6 11.91a11 11 0 0 0 11.21-.45c4.2-2.73 6.49-7.67 6.25-13.62z"
                  fill={`${darkMode ? "#d1d5db" : "#17181b"}`}
                /></svg
              >
            </a>
          {/if}

          {#if isShowCoingecko}
            <a
              href={`https://www.coingecko.com/en/coins/${data?.cg_id}`}
              target="_blank"
              class="w-[20px] h-[20px] cursor-pointer"
            >
              <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                class="w-full h-full object-contain rounded-full"
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
            </a>
          {/if}

          {#if !isShowCMC || !isShowCoingecko}
            <div class="w-[20px] h-[20px]" />
          {/if}
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end">
      $<TooltipNumber number={data.market_price} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end">
      $<TooltipNumber
        number={data.profit.averageCost}
        type="balance"
        personalValue
      />
    </div>
  </td>

  <td
    class={`py-3 ${
      typeWalletAddress === "SOL" ||
      typeWalletAddress === "EVM" ||
      typeWalletAddress === "BUNDLE"
        ? ""
        : "pr-3"
    } ${darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"}`}
  >
    <div
      class="flex items-center justify-end gap-1 xl:text-sm text-2xl font-medium"
    >
      <div class="flex flex-col">
        <div
          class={`flex justify-end ${
            realizedProfit !== 0
              ? realizedProfit >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : "text_00000099"
          }`}
        >
          <TooltipNumber number={Math.abs(realizedProfit)} type="value" />
        </div>
        <div class="flex items-center justify-end gap-1">
          <div
            class={`flex items-center ${
              percentRealizedProfit !== 0
                ? percentRealizedProfit >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber
              number={Math.abs(percentRealizedProfit) * 100}
              type="percent"
            />
            <span>%</span>
          </div>
          {#if percentRealizedProfit !== 0}
            <img
              src={percentRealizedProfit >= 0 ? TrendUp : TrendDown}
              alt="trend"
              class="mb-1"
            />
          {/if}
        </div>
      </div>
    </div>
  </td>

  {#if typeWalletAddress === "SOL" || typeWalletAddress === "EVM" || typeWalletAddress === "BUNDLE"}
    <td
      class={`py-3 xl:w-12 w-32 h-full flex justify-center items-center xl:gap-3 gap-6 ${
        darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      }`}
    >
      {#if typeWalletAddress === "EVM" || typeWalletAddress === "SOL"}
        <div
          class="flex justify-center cursor-pointer"
          on:click={() => {
            showSideTokenDetail = true;
            selectedTokenDetail = data;
          }}
        >
          <div
            use:tooltip={{
              content: `<tooltip-detail text="Show token detail" />`,
              allowHTML: true,
              placement: "top",
            }}
            class="xl:w-[14px] xl:h-[14px] w-[26px] h-[26px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              version="1.1"
              viewBox="0 0 256 256"
              xml:space="preserve"
            >
              <defs />
              <g
                style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                fill={darkMode ? "white" : "#00000080"}
                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
              >
                <path
                  d="M 87.994 0 H 69.342 c -1.787 0 -2.682 2.16 -1.418 3.424 l 5.795 5.795 l -33.82 33.82 L 28.056 31.196 l -3.174 -3.174 c -1.074 -1.074 -2.815 -1.074 -3.889 0 L 0.805 48.209 c -1.074 1.074 -1.074 2.815 0 3.889 l 3.174 3.174 c 1.074 1.074 2.815 1.074 3.889 0 l 15.069 -15.069 l 14.994 14.994 c 1.074 1.074 2.815 1.074 3.889 0 l 1.614 -1.614 c 0.083 -0.066 0.17 -0.125 0.247 -0.202 l 37.1 -37.1 l 5.795 5.795 C 87.84 23.34 90 22.445 90 20.658 V 2.006 C 90 0.898 89.102 0 87.994 0 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  transform=" matrix(1 0 0 1 0 0) "
                  fill={darkMode ? "white" : "#00000080"}
                  stroke-linecap="round"
                />
                <path
                  d="M 65.626 37.8 v 49.45 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 23.518 L 65.626 37.8 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={darkMode ? "white" : "#00000080"}
                  transform=" matrix(1 0 0 1 0 0) "
                  stroke-linecap="round"
                />
                <path
                  d="M 47.115 56.312 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 42.03 L 47.115 56.312 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={darkMode ? "white" : "#00000080"}
                  transform=" matrix(1 0 0 1 0 0) "
                  stroke-linecap="round"
                />
                <path
                  d="M 39.876 60.503 c -1.937 0 -3.757 -0.754 -5.127 -2.124 l -6.146 -6.145 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 59.844 C 41.952 60.271 40.933 60.503 39.876 60.503 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={darkMode ? "white" : "#00000080"}
                  transform=" matrix(1 0 0 1 0 0) "
                  stroke-linecap="round"
                />
                <path
                  d="M 22.937 46.567 L 11.051 58.453 c -0.298 0.298 -0.621 0.562 -0.959 0.8 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 48.004 L 22.937 46.567 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={darkMode ? "white" : "#00000080"}
                  transform=" matrix(1 0 0 1 0 0) "
                  stroke-linecap="round"
                />
              </g>
            </svg>
          </div>
        </div>
      {/if}
    </td>
  {/if}
</tr>

<!-- Sidebar Token Detail -->
<OverlaySidebar isOpen={showSideTokenDetail}>
  <div class="flex flex-col gap-6 p-6">
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
              <img
                src={logo}
                alt=""
                width="46"
                height="46"
                class="rounded-full"
                on:error={() => {
                  logo =
                    "https://raw.githubusercontent.com/getnimbus/assets/main/token.png";
                }}
              />
              {#if (typeWalletAddress === "EVM" || typeWalletAddress === "BUNDLE") && selectedTokenDetail?.chain !== "CEX" && selectedTokenDetail?.chain !== "BTC"}
                <div class="absolute -top-2 -right-1">
                  <img
                    src={detectedChain(selectedTokenDetail.chain)}
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
                      <tooltip-detail text={selectedTokenDetail.name} />
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
                      <tooltip-detail text={selectedTokenDetail.symbol} />
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center font-medium xl:text-2xl text-3xl">
            $<TooltipNumber
              number={selectedTokenDetail?.market_price}
              type="balance"
            />
          </div>
        </div>
      {/if}
    </div>
    <TokenDetailSidebar data={selectedTokenDetail} />
  </div>
</OverlaySidebar>

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
</style>
