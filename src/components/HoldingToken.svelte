<script>
  import { useNavigate } from "svelte-navigator";
  import { chain, typeWallet, isDarkMode } from "~/store";
  import { detectedChain, getAddressContext, shorterName } from "~/utils";
  import numeral from "numeral";
  import { Progressbar } from "flowbite-svelte";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import VaultTable from "~/UI/Portfolio/VaultTable.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import Chart from "~/assets/chart.svg";

  export let data;
  export let selectedWallet;
  export let sumAllTokens;

  $: selectedChain = $chain;

  const navigate = useNavigate();

  let typeWalletAddress = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let isShowCMC = false;
  let selectedHighestVault;
  let selectedVaults;
  let showTableVaults = false;

  $: price = data?.amount * data?.market_price;
  $: profitAndLoss = price + (data?.avgCost || 0);
  $: profitAndLossPercent =
    Math.abs(data?.avgCost || 0) === 0
      ? 0
      : profitAndLoss / Math.abs(data?.avgCost);

  $: clickable =
    data.name !== "Bitcoin" &&
    data.name !== "Ethereum" &&
    selectedChain !== "XDAI";

  $: ratio = (price / sumAllTokens) * 100;

  $: {
    if (data?.vaults && data?.vaults.length !== 0) {
      selectedHighestVault = data?.vaults.reduce(
        (maxObject, currentObject) => {
          return currentObject.apy > maxObject.apy ? currentObject : maxObject;
        },
        { apy: -Infinity }
      );
    }
  }
</script>

<tr
  class={`group transition-all`}
  on:click={() => {
    // if (clickable) {
    //   navigate(
    //     `/position-detail?id=${encodeURIComponent(
    //       data.positionId
    //     )}&type=${encodeURIComponent(
    //       data.positionType
    //     )}&address=${encodeURIComponent(selectedWallet)}`
    //   );
    // }
  }}
  on:mouseover={() => {
    if (getAddressContext(selectedWallet)?.type === "EVM") {
      isShowCMC = true;
    }
  }}
  on:mouseleave={() => {
    if (getAddressContext(selectedWallet)?.type === "EVM") {
      isShowCMC = false;
    }
  }}
>
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 w-[420px] ${
      darkMode
        ? "bg-[#110c2a] group-hover:bg-[#00000033]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left flex items-center gap-3">
      <div class="relative">
        <img
          src={data.logo ||
            "https://raw.githubusercontent.com/getnimbus/assets/main/token.png"}
          alt=""
          width="30"
          height="30"
          class="rounded-full"
        />
        {#if getAddressContext(selectedWallet)?.type !== "BTC" && typeWalletAddress === "DEX"}
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
      <div class="flex items-start gap-3">
        <div class="flex flex-col gap-1">
          <div
            class="xl:text-sm text-xl font-medium relative"
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
          <div class="flex items-center gap-2">
            <div
              class="text_00000080 text-xs font-medium relative"
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
                <div
                  class="absolute -top-8 left-0"
                  style="z-index: 2147483648;"
                >
                  <tooltip-detail text={data.symbol} />
                </div>
              {/if}
            </div>
            {#if isShowCMC}
              <a
                href={`https://coinmarketcap.com/currencies/${"cmc_slug"}`}
                target="_blank"
                class="w-[20px] h-[20px] cursor-pointer"
              >
                <svg
                  viewBox="0 0 76.52 77.67"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-full h-full object-contain"
                  ><path
                    d="m66.54 46.41a4.09 4.09 0 0 1 -4.17.28c-1.54-.87-2.37-2.91-2.37-5.69v-8.52c0-4.09-1.62-7-4.33-7.79-4.58-1.34-8 4.27-9.32 6.38l-8.1 13.11v-16c-.09-3.69-1.29-5.9-3.56-6.56-1.5-.44-3.75-.26-5.94 3.08l-18.11 29.07a32 32 0 0 1 -3.64-14.94c0-17.52 14-31.77 31.25-31.77s31.3 14.25 31.3 31.77v.09s0 .06 0 .09c.17 3.39-.93 6.09-3 7.4zm10-7.57v-.17c-.14-21.35-17.26-38.67-38.29-38.67s-38.25 17.42-38.25 38.83 17.16 38.84 38.25 38.84a37.81 37.81 0 0 0 26-10.36 3.56 3.56 0 0 0 .18-5 3.43 3.43 0 0 0 -4.86-.23 30.93 30.93 0 0 1 -44.57-2.08l16.3-26.2v12.09c0 5.81 2.25 7.69 4.14 8.24s4.78.17 7.81-4.75l9-14.57c.28-.47.55-.87.79-1.22v7.41c0 5.43 2.18 9.77 6 11.91a11 11 0 0 0 11.21-.45c4.2-2.73 6.49-7.67 6.25-13.62z"
                    fill={`${darkMode ? "#d1d5db" : "#17181b"}`}
                  /></svg
                >
              </a>
            {:else}
              <div class="w-[20px] h-[20px]" />
            {/if}
          </div>
        </div>
        {#if selectedHighestVault !== undefined}
          <div
            class="flex items-center justyfy-center px-2 py-1 text_27326F text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px] cursor-pointer"
            on:click={() => {
              showTableVaults = true;
              selectedVaults = data.vaults;
            }}
          >
            {`Farm up to ${numeral(selectedHighestVault.apy * 100).format(
              "0,0.00"
            )}% APY`}
          </div>
        {/if}
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-xl text_00000099 font-medium flex justify-end">
      $<TooltipNumber number={data.market_price} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-xl text_00000099 font-medium flex justify-end">
      <TooltipNumber number={data.amount} type="amount" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-xl text_00000099 font-medium flex justify-end">
      $<TooltipNumber number={price} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex flex-col gap-1 justify-end items-end">
      <div
        class="xl:text-sm text-xl text_00000099 font-medium flex justify-end"
      >
        <TooltipNumber number={ratio} type="percent" />%
      </div>
      <div class="w-3/4 max-w-40">
        <Progressbar progress={ratio} size="h-1" />
      </div>
    </div>
  </td>

  <!-- <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="flex items-center justify-end gap-1 xl:text-sm text-xl font-medium"
    >
      <div class="flex flex-col">
        <div
          class={`flex justify-end ${
            profitAndLoss >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          $<TooltipNumber number={Math.abs(profitAndLoss)} type="balance" />
        </div>
        <div class="flex items-center justify-end gap-1">
          <div
            class={`flex items-center ${
              profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
            }`}
          >
            <TooltipNumber
              number={Math.abs(profitAndLossPercent) * 100}
              type="percent"
            />
            <span>%</span>
          </div>
          <img
            src={profitAndLoss >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="mb-1"
          />
        </div>
      </div>
    </div>
  </td> -->

  <!-- <td
    class={`py-3 w-10 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    {#if clickable}
      <div class="flex justify-center">
        <div
          use:tooltip={{
            content: `<tooltip-detail text="Show detail" />`,
            allowHTML: true,
            placement: "top",
          }}
        >
          <img src={Chart} alt="" width={14} height={14} />
        </div>
      </div>
    {/if}
  </td> -->
</tr>

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

<style>
</style>
