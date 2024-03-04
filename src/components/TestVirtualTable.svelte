<script lang="ts">
  import { onMount } from "svelte";
  import { isDarkMode, typeWallet, chain, totalAssets } from "~/store";
  import VirtualList from "svelte-tiny-virtual-list";

  import Loading from "./Loading.svelte";
  import HoldingToken from "~/UI/Portfolio/HoldingToken.svelte";

  export let sumNFT;
  export let defaultData;
  export let data;
  export let isLoading;
  export let triggerFireworkBonus = (data) => {};

  const MultipleLang = {
    holding: i18n("newtabPage.holding", "Holding"),
    token: i18n("newtabPage.token", "Tokens"),
    nft: i18n("newtabPage.nft", "NFTs"),
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit & Loss"),
    total_spent: i18n("newtabPage.total_spent", "Total Spent"),
    collection: i18n("newtabPage.collection", "Collection"),
    floor_price: i18n("newtabPage.floor_price", "Floor Price"),
    current_value: i18n("newtabPage.current_value", "Current Value"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
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

  let tableTokenHeader;
  let isStickyTableToken = false;

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: colspan = listSupported.includes($typeWallet) ? 8 : 7;

  import { wallet, user, selectedBundle, realtimePrice } from "~/store";
  import { shorterName, shorterAddress } from "~/utils";
  import { listSupported, detectedChain } from "~/lib/chains";
  import numeral from "numeral";
  import { Progressbar, Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import dayjs from "dayjs";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { wait } from "../entries/background/utils";
  import mixpanel from "mixpanel-browser";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import Tooltip from "~/components/Tooltip.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import Image from "~/components/Image.svelte";
  import OverlaySidebar from "~/components/OverlaySidebar.svelte";
  import OverlaySidebarSwap from "~/components/OverlaySidebarSwap.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import VaultTable from "~/UI/Portfolio/VaultTable.svelte";
  import TokenDetailSidebar from "~/UI/TokenDetail/TokenDetailSidebar.svelte";
  import SwapWidget from "~/UI/SwapWidget/SwapWidget.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import defaultToken from "~/assets/defaultToken.png";

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let isShowCMC = false;
  let isShowCoingecko = false;
  let isShowReport = false;

  let showTableVaults = false;
  let selectedHighestVault;
  let selectedVaults;
  let selectedVaultsSymbol;

  let isShowReportTable = false;
  let isOldToken = false;
  let isLoadingReportTrashCoin = false;
  let reportReasonList = [];

  let isOpenTokenInfoBundle = false;
  let showTokenInfoBundle = false;

  let showSideTokenDetail = false;
  let selectedTokenDetail = {};
  let isCopied = false;
  let isShowTooltipContractAddress = false;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;

  let showSideTokenSwap = false;

  const trigger = () => {
    showToast = true;
    counter = 5;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    isSuccessToast = false;
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

  const closeSideBar = (event) => {
    if (event.key === "Escape") {
      showSideTokenSwap = false;
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
        type: "token",
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

  $: pnl =
    Number(data?.balance || 0) * Number(data?.market_price || 0) +
    Number(data?.profit?.totalGain || 0) -
    Number(data?.profit?.cost || 0);

  $: unrealizedProfit =
    Number(data?.avgCost) === 0 ? 0 : Number(pnl) - realizedProfit;

  $: percentUnrealizedProfit =
    Number(data?.avgCost) === 0
      ? 0
      : unrealizedProfit / Math.abs(Number(data?.avgCost));

  $: ratio = (value / $totalAssets - sumNFT) * 100;

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

  const handleSwapToken = (data: any) => {
    const config = {
      displayMode: "integrated",
      integratedTargetId: `swap-${index}`,
      endpoint: "https://rpc.shyft.to?api_key=Gny0V25q6Y2kMjze",
      strictTokenList: false,
      defaultExplorer: "Solscan",
      formProps: {
        darkMode: $isDarkMode,
        fixedOutputMint: false,
        initialAmount: data?.amountRaw,
        initialInputMint:
          data?.contractAddress ||
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      },
      onSuccess: ({ txid }) => {
        toastMsg = `Swap token successful. Tx id is ${shorterAddress(txid)}`;
        isSuccessToast = true;
        trigger();
      },
      onSwapError: ({ error }) => {
        console.log("onSwapError", error);
        toastMsg = "Swap token fail. Please try again!";
        isSuccessToast = false;
        trigger();
      },
    };

    window.Jupiter.init(config).catch((error) => {
      window.Jupiter.init(config);
    });
  };

  $: {
    if (showSideTokenDetail) {
      mixpanel.track("token_detail_page", {
        address: $wallet,
        token_address: selectedTokenDetail?.contract_address || "",
      });
    }
  }
</script>

<!-- <div
  class={`rounded-[10px] xl:overflow-visible overflow-x-auto ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <table class="table-auto xl:w-full w-[2000px] h-full">
    <thead
      class={isStickyTableToken ? "sticky top-0 z-10" : ""}
      bind:this={tableTokenHeader}
    >
      <tr class="bg_f4f5f8">
        <th
          class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[420px]"
        >
          <div class="text-left xl:text-xs text-xl uppercase font-medium">
            {MultipleLang.assets}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            {MultipleLang.price}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            {MultipleLang.amount}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            {MultipleLang.value}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            Avg Cost
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            Realized PnL
          </div>
        </th>
        <th
          class={`py-3 xl:pr-3 pr-6 ${
            listSupported.includes($typeWallet) ? "" : "rounded-tr-[10px]"
          }`}
        >
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            Unrealized PnL
          </div>
        </th>
        {#if listSupported.includes($typeWallet)}
          <th
            class={`py-3 pr-3 rounded-tr-[10px] ${
              ["BUNDLE", "SOL"].includes($typeWallet)
                ? "xl:max-w-20 w-16"
                : "xl:w-12 w-32"
            }`}
          />
        {/if}
      </tr>
    </thead>

    {#if $chain === "ALL"}
      <tbody>
        {#if data && data.length === 0 && !isLoading}
          <tr>
            <td {colspan}>
              <div
                class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
              >
                {#if defaultData && defaultData.length === 0}
                  {MultipleLang.empty}
                {:else}
                  All tokens less than $1
                {/if}
              </div>
            </td>
          </tr>
        {/if}
        {#each data as holding, index}
          <HoldingToken
            data={holding}
            lastIndex={data.length - 1 === index}
            sumAllTokens={$totalAssets - sumNFT}
            index={index + 1}
            {triggerFireworkBonus}
          />
        {/each}
      </tbody>
      {#if isLoading}
        <tbody>
          <tr>
            <td {colspan}>
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {/if}
    {/if}

    {#if $chain !== "ALL"}
      {#if isLoading}
        <tbody>
          <tr>
            <td {colspan}>
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if data && data.length === 0}
            <tr>
              <td {colspan}>
                <div
                  class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                >
                  {#if defaultData && defaultData.length === 0}
                    {MultipleLang.empty}
                  {:else}
                    All tokens less than $1
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            {#each data as holding, index (holding.positionId)}
              <HoldingToken
                data={holding}
                lastIndex={data.length - 1 == index}
                sumAllTokens={$totalAssets - sumNFT}
                index={index + 1}
                {triggerFireworkBonus}
              />
            {/each}
          {/if}
        </tbody>
      {/if}
    {/if}
  </table>
</div> -->

<div
  class={`rounded-[10px] xl:overflow-visible overflow-x-auto xl:w-full w-[2000px] ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <div
    class={`bg_f4f5f8 grid ${listSupported.includes($typeWallet) ? "grid-cols-11" : "grid-cols-10"} ${isStickyTableToken ? "sticky top-0 z-10" : ""}`}
    bind:this={tableTokenHeader}
  >
    <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
      <div class="text-left xl:text-xs text-xl uppercase font-medium">
        {MultipleLang.assets}
      </div>
    </div>

    <div class="py-3">
      <div class="text-right xl:text-xs text-xl uppercase font-medium">
        {MultipleLang.price}
      </div>
    </div>

    <div class="py-3">
      <div class="text-right xl:text-xs text-xl uppercase font-medium">
        {MultipleLang.amount}
      </div>
    </div>

    <div class="py-3">
      <div class="text-right xl:text-xs text-xl uppercase font-medium">
        {MultipleLang.value}
      </div>
    </div>

    <div class="py-3">
      <div class="text-right xl:text-xs text-xl uppercase font-medium">
        Avg Cost
      </div>
    </div>

    <div class="col-spans-2 py-3">
      <div class="text-right xl:text-xs text-xl uppercase font-medium">
        Realized PnL
      </div>
    </div>

    <div
      class={`col-spans-2 py-3 pr-3 ${
        listSupported.includes($typeWallet) ? "" : "rounded-tr-[10px]"
      }`}
    >
      <div class="text-right xl:text-xs text-xl uppercase font-medium">
        Unrealized PnL
      </div>
    </div>

    {#if listSupported.includes($typeWallet)}
      <div class="py-3 pr-3 rounded-tr-[10px]" />
    {/if}
  </div>

  <VirtualList width="100%" height={960} itemCount={data.length} itemSize={70}>
    <div
      class={`grid ${listSupported.includes($typeWallet) ? "grid-cols-11" : "grid-cols-10"}`}
      slot="item"
      let:index
      let:style
      {style}
    >
      <HoldingToken
        data={data[index]}
        lastIndex={data.length - 1 == index}
        sumAllTokens={$totalAssets - sumNFT}
        index={index + 1}
        {triggerFireworkBonus}
      />

      <!-- <div
        class={`col-spans-2 pl-3 py-3 ${
          isOpenTokenInfoBundle
            ? $isDarkMode
              ? "bg-[#000]"
              : "bg-gray-100"
            : $isDarkMode
              ? "bg-[#131313] group-hover:bg-[#000]"
              : "bg-white group-hover:bg-gray-100"
        }`}
        style={`${data.length - 1 === index ? "border-bottom-left-radius: 10px;" : ""}`}
      >
        <div class="relative flex items-center gap-3 text-left">
          {#if isShowReport}
            <div
              class="hidden xl:block absolute w-5 cursor-pointer -left-8 top-3 opacity-80 hover:opacity-60"
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
              <Image logo={data[index].logo} defaultLogo={defaultToken} />
            </div>
            {#if ($typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "BUNDLE") && data[index]?.chain !== "CEX"}
              <div class="absolute -top-2 -right-1">
                <img
                  src={detectedChain(data[index]?.chain)?.logo}
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
                {#if data[index].name === undefined}
                  N/A
                {:else}
                  <div class="flex">
                    {data[index]?.name?.length > 20
                      ? shorterName(data[index].name, 20)
                      : data[index].name}
                    {#if isShowReport}
                      <span
                        class="xl:hidden flex items-center justify-center ml-3 opacity-80 hover:opacity-60"
                        on:click={() => (isShowReportTable = true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="26"
                          height="26"
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
                {#if isShowTooltipName && data[index]?.name?.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={data[index].name} />
                  </div>
                {/if}
              </div>

              {#if selectedHighestVault !== undefined}
                <div
                  class="flex items-center justyfy-center px-2 py-1 text_27326F xl:text-[10px] text-base font-medium bg-[#1e96fc33] rounded-[1000px] cursor-pointer"
                  on:click={() => {
                    showTableVaults = true;
                    selectedVaults = data[index].vaults;
                    selectedVaultsSymbol = data[index].symbol;
                  }}
                >
                  <div class="hidden xl:block">
                    {`Farm up to ${numeral(
                      selectedHighestVault.apy * 100
                    ).format("0,0.00")}% APY`}
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
                {#if data[index].symbol === undefined}
                  N/A
                {:else}
                  {shorterName(data[index].symbol, 20)}
                {/if}
                {#if isShowTooltipSymbol && data[index].symbol.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={data[index].symbol} />
                  </div>
                {/if}
              </div>

              {#if isShowCMC}
                <a
                  href={`https://coinmarketcap.com/currencies/${data[index]?.cmc_slug}`}
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
                  href={`https://www.coingecko.com/en/coins/${data[index]?.cg_id}`}
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
                <div class="h-[20px]" />
              {/if}

              {#if data[index]?.positionType === "ERC_404"}
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
          class="flex justify-end text-2xl font-medium xl:text-sm text_00000099"
        >
          $<TooltipNumber number={data[index].market_price} type="balance" />
        </div>
      </div>

      <div
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
          <TooltipNumber
            number={data[index].amount}
            type="balance"
            personalValue
          />
        </div>
      </div>

      <div
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
            <div class="flex justify-end text-2xl text-gray-400 xl:text-sm">
              <TooltipNumber number={ratio} type="percent" />%
            </div>

            <div class="w-3/4 max-w-20">
              <Progressbar progress={ratio} animate size="h-1" />
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
          class="flex justify-end text-2xl font-medium xl:text-sm text_00000099"
        >
          ${#if data?.profit}
            <TooltipNumber number={data?.profit?.averageCost} type="balance" />
          {:else}
            0
          {/if}
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
      </div>

      <div
        class={`py-3 xl:pr-3 pr-6 ${
          $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
        }`}
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
                    ? unrealizedProfit >= 0
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
      </div>

      {#if listSupported.includes($typeWallet)}
        <div
          class={`py-3 pr-3 w-full h-full flex items-center xl:gap-4 gap-7 ${
            $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
          } ${
            ["BUNDLE", "SOL", "EVM"].includes($typeWallet)
              ? "justify-start"
              : "justify-center"
          }`}
          style={`${data.length - 1 === index ? "border-bottom-right-radius: 10px;" : ""}`}
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
                on:click={() =>
                  (isOpenTokenInfoBundle = !isOpenTokenInfoBundle)}
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

          {#if listSupported.includes($typeWallet)}
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

          {#if $user && Object.keys($user).length !== 0 && ($typeWallet === "SOL" || $typeWallet === "EVM" || ($typeWallet === "BUNDLE" && data?.chain !== "CEX"))}
            <div
              class="flex justify-center view-icon-detail"
              use:tooltip={{
                content: `<tooltip-detail text="Swap token" />`,
                allowHTML: true,
                placement: "top",
              }}
            >
              <div
                class="xl:block hidden cursor-pointer transform rotate-90"
                on:click={() => {
                  showSideTokenSwap = true;
                  selectedTokenDetail = data;
                  if (
                    $typeWallet === "SOL" ||
                    ($typeWallet === "BUNDLE" && data?.chain === "SOL")
                  ) {
                    handleSwapToken(data);
                  }
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 21 22"
                  fill={$isDarkMode ? "white" : "#00000080"}
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    d="M6.51043 7.47998V14.99H7.77043V7.47998L9.66043 9.36998L10.5505 8.47994L7.5859 5.51453C7.3398 5.26925 6.94114 5.26925 6.69504 5.51453L3.73047 8.47994L4.62051 9.36998L6.51043 7.47998Z"
                    fill={$isDarkMode ? "white" : "#00000080"}
                  ></path><path
                    d="M14.4902 14.52V7.01001H13.2302V14.52L11.3402 12.63L10.4502 13.5201L13.4148 16.4855C13.6609 16.7308 14.0595 16.7308 14.3056 16.4855L17.2702 13.5201L16.3802 12.63L14.4902 14.52Z"
                    fill={$isDarkMode ? "white" : "#00000080"}
                  ></path></svg
                >
              </div>
              <div
                class="xl:hidden block cursor-pointer transform rotate-90"
                on:click={() => {
                  showSideTokenSwap = true;
                  selectedTokenDetail = data;
                  if (
                    $typeWallet === "SOL" ||
                    ($typeWallet === "BUNDLE" && data?.chain === "SOL")
                  ) {
                    handleSwapToken(data);
                  }
                }}
              >
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 21 22"
                  fill={$isDarkMode ? "white" : "#00000080"}
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    d="M6.51043 7.47998V14.99H7.77043V7.47998L9.66043 9.36998L10.5505 8.47994L7.5859 5.51453C7.3398 5.26925 6.94114 5.26925 6.69504 5.51453L3.73047 8.47994L4.62051 9.36998L6.51043 7.47998Z"
                    fill={$isDarkMode ? "white" : "#00000080"}
                  ></path><path
                    d="M14.4902 14.52V7.01001H13.2302V14.52L11.3402 12.63L10.4502 13.5201L13.4148 16.4855C13.6609 16.7308 14.0595 16.7308 14.3056 16.4855L17.2702 13.5201L16.3802 12.63L14.4902 14.52Z"
                    fill={$isDarkMode ? "white" : "#00000080"}
                  ></path></svg
                >
              </div>
            </div>
          {/if}
        </div>
      {/if} -->
    </div>
  </VirtualList>
</div>

<style>
</style>
