<script lang="ts">
  import {
    typeWallet,
    isDarkMode,
    isShowModalNftList,
    isShowModalNftDeList,
    listingNft,
    selectedNftContractAddress,
  } from "~/store";
  import { shorterName } from "~/utils";

  import Tooltip from "~/components/Tooltip.svelte";
  import TooltipNumber from "./TooltipNumber.svelte";
  import Image from "./Image.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let nativeToken;
  export let marketPrice;
  export let floorPrice;

  let showTooltipName = false;

  $: profitAndLoss =
    Number(data?.price || 0) === 0
      ? 0
      : Number(floorPrice) - Number(data?.price);

  $: profitAndLossPercent =
    Number(data?.price || 0) === 0
      ? 0
      : (profitAndLoss * marketPrice) / Math.abs(Number(data?.cost));
</script>

<div
  class={`rounded-[10px] px-3 pt-2 pb-3 flex flex-col gap-2 ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <div class="rounded-[10px] overflow-hidden xl:h-[270px] h-[470px]">
    <Image
      logo={data?.imageUrl}
      defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
    />
  </div>

  <div class="flex flex-col xl:gap-2 gap-4">
    <div
      class="xl:text-base text-3xl font-semibold relative"
      on:mouseenter={() => (showTooltipName = true)}
      on:mouseleave={() => (showTooltipName = false)}
    >
      {shorterName(data?.name, 30)}
      {data?.tokenId && nativeToken?.symbol !== "SOL"
        ? `#${data?.tokenId}`
        : ""}
      {#if showTooltipName && data?.name.length > 30}
        <span class="absolute -top-7 left-0" style="z-index: 2147483648;">
          <Tooltip text={data?.name} />
        </span>
      {/if}
    </div>

    <!-- <div
      class="xl:text-sm text-lg font-normal flex items-center justify-between gap-2"
    >
      <div class="text-[#616b84]">Rarity Score</div>
      <TooltipNumber number={data?.rarityScore} type="percent" />
    </div> -->

    <div
      class="xl:text-sm text-2xl font-normal flex xl:items-center items-start justify-between gap-1"
    >
      <div class="text-[#616b84]">Cost</div>
      <div class="flex xl:flex-row flex-col xl:items-center items-end gap-1">
        <span class="flex items-center">
          <TooltipNumber
            number={Number(data?.price || 0)}
            type="balance"
          /><span class="ml-1">
            {nativeToken?.symbol || ""}
          </span>
        </span>
        <span class="xl:block hidden">|</span>
        <TooltipNumber number={Number(data?.cost || 0)} type="value" />
      </div>
    </div>

    <div
      class="xl:text-sm text-2xl font-normal flex items-start justify-between gap-1"
    >
      <div class="text-[#616b84]">PnL</div>
      <div class="flex flex-col items-end">
        <div class="flex xl:flex-row flex-col xl:items-center items-end gap-1">
          <div
            class={`flex items-center ${
              Number(profitAndLoss) !== 0
                ? Number(profitAndLoss) >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : ""
            }`}
          >
            <TooltipNumber
              number={Math.abs(Number(profitAndLoss))}
              type="balance"
            /><span class="ml-1">
              {nativeToken?.symbol || ""}
            </span>
          </div>
          <div class="xl:block hidden">|</div>
          <div
            class={`flex ${
              profitAndLoss !== 0
                ? profitAndLoss >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : ""
            }`}
          >
            <TooltipNumber
              number={Math.abs(profitAndLoss) * marketPrice}
              type="value"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-1">
          <div
            class={`flex items-center ${
              profitAndLossPercent !== 0
                ? profitAndLossPercent >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : ""
            }`}
          >
            <TooltipNumber
              number={Math.abs(profitAndLossPercent) * 100}
              type={Math.abs(Number(profitAndLossPercent)) > 100
                ? "balance"
                : "percent"}
            />
            <span>%</span>
          </div>
          {#if profitAndLossPercent !== 0}
            <img
              src={profitAndLossPercent >= 0 ? TrendUp : TrendDown}
              alt="trend"
              class="mb-1"
            />
          {/if}
        </div>
      </div>
    </div>

    {#if $typeWallet === "SOL" || ($typeWallet === "BUNDLE" && nativeToken?.symbol === "SOL")}
      <div
        class="xl:text-sm text-2xl font-normal flex items-start justify-between gap-1"
      >
        <div class="text-[#616b84]">Action</div>
        <div class="flex flex-col items-end">
          {#if data?.listing}
            <div
              class="font-semibold text-red-600 transition-all cursor-pointer hover:underline"
              on:click={() => {
                selectedNftContractAddress.update(
                  (n) => (n = data?.contractAddress)
                );
                listingNft.update((n) => (n = data?.listing));
                isShowModalNftDeList.update((n) => (n = true));
              }}
            >
              De-list
            </div>
          {:else}
            <div
              class="font-semibold text-blue-600 transition-all cursor-pointer hover:underline"
              on:click={() => {
                selectedNftContractAddress.update(
                  (n) => (n = data?.contractAddress)
                );
                isShowModalNftList.update((n) => (n = true));
              }}
            >
              List
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
</style>
