<script lang="ts">
  import { typeWallet, isDarkMode, user, selectedBundle } from "~/store";
  import { detectedChain, shorterName, shorterAddress } from "~/utils";
  import numeral from "numeral";
  import { Progressbar, Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import dayjs from "dayjs";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { wait } from "../entries/background/utils";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import VaultTable from "~/UI/Portfolio/VaultTable.svelte";
  import Button from "./Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import Image from "~/components/Image.svelte";
  import OverlaySidebar from "./OverlaySidebar.svelte";
  import TokenDetailSidebar from "~/UI/TokenDetail/TokenDetailSidebar.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import defaultToken from "~/assets/defaultToken.png";

  export let data;
  export let selectedWallet;
  export let sumAllTokens;
  export let lastIndex: boolean = false;

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let isShowCMC = false;
  let isShowCoingecko = false;
  let isShowReport = false;
  let isShowReportTable = false;
  let selectedHighestVault;
  let selectedVaults;
  let showTableVaults = false;
  let isOldToken = false;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;
  let isLoadingReportTrashCoin = false;

  let isOpenTokenInfoBundle = false;
  let showTokenInfoBundle = false;

  let showSideTokenDetail = false;
  let selectedTokenDetail = {};
  let isCopied = false;
  let isShowTooltipContractAddress = false;

  let reportReasonList = [];

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    isSuccessToast = false;
  };

  const MultipleLang = {
    content: {
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_submitreport: i18n(
        "optionsPage.accounts-page-content.modal-submitreport",
        "Report"
      ),
    },
  };

  const reasonReport = [
    {
      id: "trash",
      content: "This token is trash 🗑️",
    },
    {
      id: "scam",
      content: "This token is the scam 🤬",
    },
    {
      id: "hate",
      content: "I hate this token 😠",
    },
  ];

  const closeSideTokenDetail = (event) => {
    if (event.key === "Escape") {
      showSideTokenDetail = false;
      selectedTokenDetail = {};
    }
  };

  const handleReportTrashCoin = async () => {
    isLoadingReportTrashCoin = true;
    try {
      let reason = "";

      if (document.getElementById("trash").checked) {
        reason += "Trash Token, ";
      }

      if (document.getElementById("hate").checked) {
        reason += "Hate Token, ";
      }

      if (document.getElementById("scam").checked) {
        reason += "Scam Token, ";
      }

      if (document.getElementById("outdated").checked) {
        reason += document.getElementById("reason").value;
      }

      const formData = {
        chain: document.getElementById("chain").value,
        contractAddress: document.getElementById("contract_address").value,
        reason: reason,
        contractName: data.name,
        contractTickerSymbol: data.symbol,
        logoUrl: data.logo,
      };
      await nimbus.post("/holding/trash/report", formData);
      isLoadingReportTrashCoin = false;
      toastMsg = "We will update after 2 minutes.";
      isSuccessToast = true;
    } catch (error) {
      isLoadingReportTrashCoin = false;
      toastMsg = "Something wrong when report token. Please try again!";
      isSuccessToast = false;
      console.error("error:", error);
    } finally {
      isShowReportTable = false;
      trigger();
    }
  };

  $: value = Number(data?.amount) * Number(data?.market_price);

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

  $: ratio = (value / sumAllTokens) * 100;

  $: {
    if (data?.vaults && data?.vaults.length !== 0) {
      selectedHighestVault = data?.vaults.reduce(
        (maxObject, currentObject) => {
          return currentObject.apy > maxObject.apy ? currentObject : maxObject;
        },
        { apy: -Infinity }
      );
    } else {
      selectedHighestVault = undefined;
    }
  }

  $: withinLast24Hours = dayjs().diff(dayjs(data?.last_transferred_at), "hour");

  $: formatDataBreakdown = (data?.breakdown || [])
    .map((item) => {
      const selectedAddress = $selectedBundle?.accounts.find(
        (account) =>
          account?.id?.toLowerCase() === item?.owner?.toLowerCase() ||
          account?.value?.toLowerCase() === item?.owner?.toLowerCase()
      );
      return {
        ...item,
        logo: selectedAddress?.logo,
        type: selectedAddress?.type,
        label: selectedAddress?.label,
      };
    })
    .filter((item) => Number(item?.amount) !== 0);

  $: console.log("this is last index : ", lastIndex);
</script>

<svelte:window on:keydown={closeSideTokenDetail} />

<tr
  key={data?.symbol}
  class={`group transition-all ${
    isOpenTokenInfoBundle ? ($isDarkMode ? "bg-[#000]" : "bg-gray-100") : ""
  }`}
  on:mouseover={() => {
    if ($user && Object.keys($user).length !== 0) {
      isShowReport = true;
    }

    if (data?.cmc_slug) {
      isShowCMC = true;
    }
    if (data?.cg_id) {
      isShowCoingecko = true;
    }
  }}
  on:mouseleave={() => {
    if ($user && Object.keys($user).length !== 0) {
      isShowReport = false;
    }

    if (data?.cmc_slug) {
      isShowCMC = false;
    }
    if (data?.cg_id) {
      isShowCoingecko = false;
    }
  }}
>
  <td
    class={`pl-3 py-3 xl:static sticky left-0 z-9 w-[450px] ${
      (isOpenTokenInfoBundle
        ? $isDarkMode
          ? "bg-[#000]"
          : "bg-gray-100"
        : $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100") +
      " " +
      (lastIndex ? "rounded-bl-xl" : "")
    }`}
  >
    <div class="relative flex items-center gap-3 text-left">
      <!-- icon report -->
      {#if isShowReport}
        <div
          class="absolute hidden w-5 cursor-pointer xl:-left-8 sm:-left-6 top-3 opacity-80 hover:opacity-60 xl:block"
          on:click={() => (isShowReportTable = true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path d="M0 0h24v24H0z" />
              <path
                fill="currentColor"
                d="M19 4c.852 0 1.297.986.783 1.623l-.076.084L15.915 9.5l3.792 3.793c.603.602.22 1.614-.593 1.701L19 15H6v6a1 1 0 0 1-.883.993L5 22a1 1 0 0 1-.993-.883L4 21V5a1 1 0 0 1 .883-.993L5 4h14z"
              />
            </g>
          </svg>
        </div>
      {/if}
      <div class="relative">
        <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
          <Image logo={data.logo} defaultLogo={defaultToken} />
        </div>
        {#if ($typeWallet === "EVM" || $typeWallet === "BUNDLE") && data?.chain !== "CEX"}
          <div class="absolute -top-2 -right-1">
            <img
              src={detectedChain(data?.chain)}
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
            {#if data.name === undefined}
              N/A
            {:else}
              <div class="flex">
                {data?.name?.length > 20
                  ? shorterName(data.name, 20)
                  : data.name}
                <!-- icon report -->
                {#if isShowReport}
                  <span
                    class="flex items-center justify-center ml-3 opacity-80 hover:opacity-60 xl:hidden"
                    on:click={() => (isShowReportTable = true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <path d="M0 0h24v24H0z" />
                        <path
                          fill="currentColor"
                          d="M19 4c.852 0 1.297.986.783 1.623l-.076.084L15.915 9.5l3.792 3.793c.603.602.22 1.614-.593 1.701L19 15H6v6a1 1 0 0 1-.883.993L5 22a1 1 0 0 1-.993-.883L4 21V5a1 1 0 0 1 .883-.993L5 4h14z"
                        />
                      </g>
                    </svg>
                  </span>
                {/if}
              </div>
            {/if}
            {#if isShowTooltipName && data?.name?.length > 20}
              <div class="absolute left-0 -top-8" style="z-index: 2147483648;">
                <tooltip-detail text={data.name} />
              </div>
            {/if}
          </div>
          {#if selectedHighestVault !== undefined}
            <div
              class="flex items-center justyfy-center px-2 py-1 text_27326F xl:text-[10px] text-base font-medium bg-[#1e96fc33] rounded-[1000px] cursor-pointer"
              on:click={() => {
                showTableVaults = true;
                selectedVaults = data.vaults;
              }}
            >
              <div class="hidden xl:block">
                {`Farm up to ${numeral(selectedHighestVault.apy * 100).format(
                  "0,0.00"
                )}% APY`}
              </div>
              <div class="block xl:hidden">Farm</div>
            </div>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <div
            class="relative text-lg font-medium text_00000080 xl:text-xs"
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
              <div class="absolute left-0 -top-8" style="z-index: 2147483648;">
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
                class="object-contain w-full h-full rounded-full"
              >
                <path
                  d="m66.54 46.41a4.09 4.09 0 0 1 -4.17.28c-1.54-.87-2.37-2.91-2.37-5.69v-8.52c0-4.09-1.62-7-4.33-7.79-4.58-1.34-8 4.27-9.32 6.38l-8.1 13.11v-16c-.09-3.69-1.29-5.9-3.56-6.56-1.5-.44-3.75-.26-5.94 3.08l-18.11 29.07a32 32 0 0 1 -3.64-14.94c0-17.52 14-31.77 31.25-31.77s31.3 14.25 31.3 31.77v.09s0 .06 0 .09c.17 3.39-.93 6.09-3 7.4zm10-7.57v-.17c-.14-21.35-17.26-38.67-38.29-38.67s-38.25 17.42-38.25 38.83 17.16 38.84 38.25 38.84a37.81 37.81 0 0 0 26-10.36 3.56 3.56 0 0 0 .18-5 3.43 3.43 0 0 0 -4.86-.23 30.93 30.93 0 0 1 -44.57-2.08l16.3-26.2v12.09c0 5.81 2.25 7.69 4.14 8.24s4.78.17 7.81-4.75l9-14.57c.28-.47.55-.87.79-1.22v7.41c0 5.43 2.18 9.77 6 11.91a11 11 0 0 0 11.21-.45c4.2-2.73 6.49-7.67 6.25-13.62z"
                  fill={`${$isDarkMode ? "#d1d5db" : "#17181b"}`}
                />
              </svg>
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
                class="object-contain w-full h-full rounded-full"
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end text-2xl font-medium xl:text-sm text_00000099">
      $<TooltipNumber number={data.market_price} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="flex items-center justify-end gap-1 text-2xl font-medium xl:text-sm text_00000099"
    >
      {#if withinLast24Hours < 24 && withinLast24Hours > 0}
        <span
          use:tooltip={{
            content: `<tooltip-detail text="Changed ${withinLast24Hours} hrs ago" />`,
            allowHTML: true,
            placement: "top",
            interactive: true,
          }}
          class="cursor-pointer"
        >
          <div class="w-2 h-2 bg-indigo-500 rounded-full" />
        </span>
      {/if}
      <TooltipNumber number={data.amount} type="balance" personalValue />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex flex-col gap-1">
      <div
        class="flex justify-end text-2xl font-medium xl:text-sm text_00000099"
      >
        <TooltipNumber number={value} type="value" personalValue />
      </div>
      <div class="flex flex-col items-end justify-end gap-1">
        <div
          class="flex justify-end text-2xl font-medium text-gray-400 xl:text-sm"
        >
          <TooltipNumber number={ratio} type="percent" />%
        </div>

        <div class="w-3/4 max-w-20">
          <Progressbar progress={ratio} animate size="h-1" />
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end text-2xl font-medium xl:text-sm text_00000099">
      ${#if data?.profit}
        <TooltipNumber number={data?.profit?.averageCost} type="balance" />
      {:else}
        0
      {/if}
    </div>
  </td>

  <td
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
              realizedProfit !== 0
                ? realizedProfit >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber
              number={Math.abs(realizedProfit)}
              type="value"
              personalValue
            />
          </div>
          <div class="flex items-center justify-end gap-1">
            <div
              class={`flex items-center ${
                realizedProfit !== 0
                  ? realizedProfit >= 0
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
            {#if realizedProfit !== 0}
              <img
                src={realizedProfit >= 0 ? TrendUp : TrendDown}
                alt="trend"
                class="mb-1"
              />
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      $typeWallet === "SOL" ||
      $typeWallet === "EVM" ||
      $typeWallet === "BUNDLE" ||
      $typeWallet === "CEX"
        ? ""
        : "pr-3"
    } ${$isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"}`}
  >
    <div
      class="flex items-center justify-end gap-1 text-2xl font-medium xl:text-sm view-token-detail2"
    >
      {#if ["BTC"].includes($typeWallet)}
        N/A
      {:else}
        <div class="flex flex-col">
          <div
            class={`flex justify-end ${
              unrealizedProfit !== 0
                ? percentUnrealizedProfit >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber
              number={Math.abs(unrealizedProfit)}
              type="value"
              personalValue
            />
          </div>
          <div class="flex items-center justify-end gap-1">
            <div
              class={`flex items-center ${
                unrealizedProfit !== 0
                  ? unrealizedProfit >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : "text_00000099"
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
      {/if}
    </div>
  </td>

  {#if $typeWallet === "SOL" || $typeWallet === "EVM" || $typeWallet === "BUNDLE" || $typeWallet === "CEX"}
    <td
      class={`py-3 xl:w-14 w-32 h-full flex justify-center items-center xl:gap-3 gap-6 ${
        ($isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100") +
        " " +
        (lastIndex ? "rounded-br-xl" : "")
      }`}
    >
      {#if $typeWallet === "BUNDLE"}
        <div
          class="flex justify-center view-icon-detail"
          use:tooltip={{
            content: `<tooltip-detail text="Show bundles detail" />`,
            allowHTML: true,
            placement: "top",
          }}
        >
          <div
            class="xl:block hidden cursor-pointer transform rotate-180 xl:w-3 xl:h-3 w-5 h-5"
            class:rotate-0={isOpenTokenInfoBundle}
            on:click={() => (isOpenTokenInfoBundle = !isOpenTokenInfoBundle)}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 8.36365L6 4.00001L2 8.36365"
                stroke={$isDarkMode ? "white" : "#00000080"}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div
            class="xl:hidden block"
            on:click={() => (showTokenInfoBundle = true)}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill={$isDarkMode ? "white" : "#00000080"}
                d="M3.5 4A1.5 1.5 0 0 0 2 5.5v2A1.5 1.5 0 0 0 3.5 9h2A1.5 1.5 0 0 0 7 7.5v-2A1.5 1.5 0 0 0 5.5 4h-2ZM3 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2ZM9.5 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8Zm0 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6Zm-6 4A1.5 1.5 0 0 0 2 12.5v2A1.5 1.5 0 0 0 3.5 16h2A1.5 1.5 0 0 0 7 14.5v-2A1.5 1.5 0 0 0 5.5 11h-2ZM3 12.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2Zm6.5-.5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8Zm0 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6Z"
              />
            </svg>
          </div>
        </div>
      {/if}

      {#if $typeWallet === "EVM" || $typeWallet === "SOL" || $typeWallet === "BUNDLE" || $typeWallet === "CEX"}
        <div
          class="flex justify-center cursor-pointer view-icon-detail"
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
                fill={$isDarkMode ? "white" : "#00000080"}
                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
              >
                <path
                  d="M 87.994 0 H 69.342 c -1.787 0 -2.682 2.16 -1.418 3.424 l 5.795 5.795 l -33.82 33.82 L 28.056 31.196 l -3.174 -3.174 c -1.074 -1.074 -2.815 -1.074 -3.889 0 L 0.805 48.209 c -1.074 1.074 -1.074 2.815 0 3.889 l 3.174 3.174 c 1.074 1.074 2.815 1.074 3.889 0 l 15.069 -15.069 l 14.994 14.994 c 1.074 1.074 2.815 1.074 3.889 0 l 1.614 -1.614 c 0.083 -0.066 0.17 -0.125 0.247 -0.202 l 37.1 -37.1 l 5.795 5.795 C 87.84 23.34 90 22.445 90 20.658 V 2.006 C 90 0.898 89.102 0 87.994 0 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  transform=" matrix(1 0 0 1 0 0) "
                  fill={$isDarkMode ? "white" : "#00000080"}
                  stroke-linecap="round"
                />
                <path
                  d="M 65.626 37.8 v 49.45 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 23.518 L 65.626 37.8 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={$isDarkMode ? "white" : "#00000080"}
                  transform=" matrix(1 0 0 1 0 0) "
                  stroke-linecap="round"
                />
                <path
                  d="M 47.115 56.312 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 42.03 L 47.115 56.312 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={$isDarkMode ? "white" : "#00000080"}
                  transform=" matrix(1 0 0 1 0 0) "
                  stroke-linecap="round"
                />
                <path
                  d="M 39.876 60.503 c -1.937 0 -3.757 -0.754 -5.127 -2.124 l -6.146 -6.145 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 59.844 C 41.952 60.271 40.933 60.503 39.876 60.503 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={$isDarkMode ? "white" : "#00000080"}
                  transform=" matrix(1 0 0 1 0 0) "
                  stroke-linecap="round"
                />
                <path
                  d="M 22.937 46.567 L 11.051 58.453 c -0.298 0.298 -0.621 0.562 -0.959 0.8 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 48.004 L 22.937 46.567 z"
                  style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
                  fill={$isDarkMode ? "white" : "#00000080"}
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

{#if isOpenTokenInfoBundle}
  <tr class="border-t-[1px] border_0000000d">
    <td
      class={`xl:pt-2 py-2 pl-3 ${$isDarkMode ? "bg-[#000]" : "bg-gray-100"}`}
    >
      <div class="xl:text-sm text-2xl">Token breakdown</div>
    </td>
    <td
      colspan={8}
      class={`xl:py-0 py-2 pr-3 ${$isDarkMode ? "bg-[#000]" : "bg-gray-100"}`}
    />
  </tr>

  <tr>
    <td colspan={8} class={`${$isDarkMode ? "bg-[#000]" : "bg-gray-100"}`}>
      <div class="-mt-1 flex items-center">
        <div class="py-2 pl-3 flex-1">
          <div class="text-left xl:text-sm text-xl font-medium">Account</div>
        </div>
        <div class="py-2 flex-1">
          <div class="text-right xl:text-sm text-xl font-medium">Amount</div>
        </div>
        <div class="py-2 pr-3 flex-1">
          <div class="text-right xl:text-sm text-xl font-medium">Value</div>
        </div>
      </div>
    </td>
  </tr>

  <tr>
    <td colspan={8}>
      <div
        class={`-mt-2 -mx-[1px] max-h-[500px] overflow-y-auto ${
          $isDarkMode ? "bg-[#000]" : "bg-gray-100"
        }`}
      >
        {#each formatDataBreakdown as item}
          <div class="flex items-center">
            <div class="py-2 pl-3 flex-1">
              <div class="flex items-center gap-3">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image logo={data.logo} defaultLogo={defaultToken} />
                </div>
                <div class="flex flex-col items-start">
                  <div class="font-medium xl:text-sm text-xl text_00000099">
                    {item.label}
                  </div>
                  <div
                    class="xl:text-sm text-2xl flex justify-end items-center"
                  >
                    <Copy
                      address={item?.owner}
                      iconColor={$isDarkMode ? "#fff" : "#000"}
                      color={$isDarkMode ? "#fff" : "#000"}
                      isShorten
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="py-2 flex-1">
              <div
                class="xl:text-sm text-2xl text_00000099 flex flex-col justify-end items-end gap-1"
              >
                <div
                  class="flex justify-end items-center gap-1 text-2xl font-medium xl:text-sm text_00000099"
                >
                  <TooltipNumber number={item?.amount} type="balance" />
                  {#if data.symbol === undefined}
                    N/A
                  {:else}
                    {data.symbol}
                  {/if}
                </div>

                <div class="flex flex-col items-end justify-end gap-1 w-full">
                  <div
                    class="flex justify-end text-2xl font-medium text-gray-400 xl:text-sm"
                  >
                    <TooltipNumber
                      number={Math.abs(item.amount / data.amount) * 100}
                      type="percent"
                    />%
                  </div>
                  <div class="w-3/4 max-w-20">
                    <Progressbar
                      progress={Math.abs(item.amount / data.amount) * 100}
                      animate
                      size="h-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="py-2 pr-3 flex-1">
              <div
                class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end items-center"
              >
                $<TooltipNumber
                  number={Number(item?.amount) * Number(data?.market_price)}
                  type="balance"
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </td>
  </tr>
{/if}

<!-- Modal token holding information when bundle -->
<AppOverlay
  clickOutSideToClose
  isOpen={showTokenInfoBundle}
  isTableContent
  on:close={() => {
    showTokenInfoBundle = false;
  }}
>
  <div class="h-[563px] flex flex-col gap-4">
    <div class="text-4xl font-medium xl:text-2xl">Token breakdown</div>
    <div
      class={`rounded-[10px] overflow-visible overflow-y-auto h-[563px] relative ${
        $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
      }`}
    >
      <table class="table-auto xl:w-full w-[1200px]">
        <thead>
          <tr class="bg_f4f5f8">
            <th class="pl-3 py-3 rounded-tl-[10px]">
              <div class="font-medium text-left uppercase xl:text-xs text-xl">
                Account
              </div>
            </th>
            <th class="py-3">
              <div class="font-medium text-right uppercase xl:text-xs text-xl">
                Amount
              </div>
            </th>
            <th class="py-3 pr-3 rounded-tr-[10px]">
              <div class="font-medium text-right uppercase xl:text-xs text-xl">
                Value
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {#if formatDataBreakdown && formatDataBreakdown.length === 0}
            <tr>
              <td colspan="3">
                <div
                  class="flex items-center justify-center px-3 py-3 text-gray-400 xl:text-lg text-xl"
                >
                  Empty
                </div>
              </td>
            </tr>
          {:else}
            {#each formatDataBreakdown as item}
              <tr class="transition-all cursor-pointer group">
                <td
                  class={`pl-3 py-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="flex items-center gap-3">
                    <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                      <Image logo={data.logo} defaultLogo={defaultToken} />
                    </div>
                    <div class="flex flex-col items-start">
                      <div class="font-medium xl:text-sm text-xl text_00000099">
                        {item.label}
                      </div>
                      <div
                        class="xl:text-sm text-2xl flex justify-end items-center"
                      >
                        <Copy
                          address={item?.owner}
                          iconColor={$isDarkMode ? "#fff" : "#000"}
                          color={$isDarkMode ? "#fff" : "#000"}
                          isShorten
                        />
                      </div>
                    </div>
                  </div>
                </td>

                <td
                  class={`py-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class="xl:text-sm text-2xl text_00000099 flex flex-col justify-end items-end gap-4"
                  >
                    <div
                      class="flex justify-end items-center gap-1 text-2xl font-medium xl:text-sm text_00000099"
                    >
                      <TooltipNumber number={item?.amount} type="balance" />
                      {#if data.symbol === undefined}
                        N/A
                      {:else}
                        {data.symbol}
                      {/if}
                    </div>

                    <div
                      class="flex flex-col items-end justify-end gap-1 w-full"
                    >
                      <div
                        class="flex justify-end text-2xl font-medium text-gray-400 xl:text-sm"
                      >
                        <TooltipNumber
                          number={Math.abs(item.amount / data.amount) * 100}
                          type="percent"
                        />%
                      </div>
                      <div class="w-3/4 max-w-30">
                        <Progressbar
                          progress={Math.abs(item.amount / data.amount) * 100}
                          size="h-1"
                        />
                      </div>
                    </div>
                  </div>
                </td>

                <td
                  class={`py-3 pr-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end items-center"
                  >
                    $<TooltipNumber
                      number={Number(item?.amount) * Number(data?.market_price)}
                      type="balance"
                    />
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</AppOverlay>

<!-- Modal vault -->
<AppOverlay
  clickOutSideToClose
  isOpen={showTableVaults}
  isTableContent
  on:close={() => {
    showTableVaults = false;
  }}
>
  <VaultTable data={selectedVaults} />
</AppOverlay>

<!-- Modal report spam/trash token  -->
<AppOverlay
  clickOutSideToClose
  isOpen={isShowReportTable}
  on:close={() => {
    isShowReportTable = false;
    isOldToken = false;
  }}
>
  <div class="flex flex-col gap-4">
    <div class="font-medium xl:title-3 title-1">Blacklist Token</div>
    <form
      on:submit|preventDefault={handleReportTrashCoin}
      class="flex flex-col gap-10 xl:gap-3"
    >
      <div class="flex flex-col gap-6 xl:gap-3">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div
            class={`xl:text-base text-2xl font-medium ${
              $isDarkMode ? "text-gray-400" : "text-[#666666]"
            }`}
          >
            Chain
          </div>
          <input
            type="text"
            id="chain"
            name="chain"
            value={data.chain}
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
              !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            } ${
              $isDarkMode
                ? "text-white"
                : "text-[#5E656B] placeholder-[#5E656B]"
            }`}
            disabled
          />
        </div>

        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div
            class={`xl:text-base text-2xl font-medium ${
              $isDarkMode ? "text-gray-400" : "text-[#666666]"
            }`}
          >
            Contract Address
          </div>
          <input
            type="text"
            id="contract_address"
            name="contract_address"
            value={data.contractAddress}
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
              !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            } ${
              $isDarkMode
                ? "text-white"
                : "text-[#5E656B] placeholder-[#5E656B]"
            }`}
            disabled
          />
        </div>

        <div
          class={`flex flex-col gap-3 input-2 input-border w-full py-[8px] px-3 ${
            (reportReasonList.length !== 0 || isOldToken) && !$isDarkMode
              ? "bg-[#F0F2F7]"
              : "bg_fafafbff"
          }`}
        >
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Reason
          </div>

          {#each reasonReport as item}
            <div class="flex items-center gap-2 cursor-pointer w-max">
              <input
                type="checkbox"
                name={item.id}
                id={item.id}
                value={item.id}
                bind:group={reportReasonList}
                class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
              />
              <label
                for={item.id}
                class="xl:text-sm text-2xl font-normal text-[#5E656B] cursor-pointer"
              >
                {item.content}
              </label>
            </div>
          {/each}

          <div class="flex items-center gap-2 cursor-pointer w-max">
            <input
              type="checkbox"
              name="outdated"
              id="outdated"
              class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
              on:change={(e) => {
                isOldToken = e.target.checked;
              }}
            />
            <label
              for="outdated"
              class="xl:text-sm text-2xl font-normal text-[#5E656B] cursor-pointer"
            >
              The token is outdate
            </label>
          </div>

          {#if isOldToken}
            <textarea
              placeholder="Please type info about that token"
              rows="5"
              id="reason"
              name="reason"
              class={`mb-2 p-0 input-2 input-border w-full py-[6px] px-3 focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
                !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
              } ${
                $isDarkMode
                  ? "text-white"
                  : "text-[#5E656B] placeholder-[#5E656B]"
              }`}
            />
          {/if}
        </div>

        <div class="flex justify-end gap-6 lg:gap-2">
          <div class="xl:w-[120px] w-full">
            <Button
              variant="secondary"
              on:click={() => {
                isShowReportTable = false;
                isOldToken = false;
              }}
            >
              {MultipleLang.content.modal_cancel}</Button
            >
          </div>
          <div class="xl:w-[120px] w-full">
            <Button
              type="submit"
              variant="tertiary"
              isLoading={isLoadingReportTrashCoin}
              disabled={isLoadingReportTrashCoin}
            >
              {MultipleLang.content.modal_submitreport}</Button
            >
          </div>
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

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
              <Image logo={data.logo} defaultLogo={defaultToken} />
            </div>
            {#if ($typeWallet === "EVM" || $typeWallet === "BUNDLE") && selectedTokenDetail?.chain !== "CEX"}
              <div class="absolute -top-2 -right-1">
                <img
                  src={detectedChain(selectedTokenDetail?.chain)}
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
                      <tooltip-detail
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
            number={selectedTokenDetail?.market_price}
            type="balance"
          />
        </div>
      </div>
    {/if}
  </div>
  <TokenDetailSidebar data={selectedTokenDetail} />
</OverlaySidebar>

{#if showToast}
  <div class="fixed z-30 w-full top-3 right-3">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
</style>
