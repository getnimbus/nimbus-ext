<script>
  import { useNavigate } from "svelte-navigator";
  import { chain, typeWallet } from "~/store";
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

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
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
>
  <td
    class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 bg-white w-[420px] group-hover:bg-gray-100"
  >
    <div class="text-left flex items-start gap-3">
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
      <div class="flex flex-col gap-1">
        <div
          class="text-black xl:text-sm text-xl font-medium relative"
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
        <div
          class="text-[#00000080] text-xs font-medium relative"
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
      </div>

      {#if selectedHighestVault !== undefined}
        <div
          class="flex items-center justyfy-center px-2 py-1 text-[#27326F] text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px] cursor-pointer"
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
  </td>

  <td class="py-3 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
    >
      $<TooltipNumber number={data.market_price} type="balance" />
    </div>
  </td>

  <td class="py-3 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
    >
      <TooltipNumber number={data.amount} type="amount" />
    </div>
  </td>

  <td class="py-3 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
    >
      $<TooltipNumber number={price} type="balance" />
    </div>
  </td>

  <td class="py-3 pr-3 group-hover:bg-gray-100">
    <div class="flex flex-col gap-1 justify-end items-end">
      <div
        class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
      >
        <TooltipNumber number={ratio} type="percent" />%
      </div>
      <div class="w-3/4 max-w-40">
        <Progressbar progress={ratio} size="h-1" />
      </div>
    </div>
  </td>

  <!-- <td class="py-3 pr-3 group-hover:bg-gray-100">
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

  <!-- <td class="py-3 w-10 group-hover:bg-gray-100">
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
