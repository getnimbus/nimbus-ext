<script lang="ts">
  import { wallet, typeWallet } from "~/store";
  import { shorterName } from "~/utils";

  import TooltipNumber from "./TooltipNumber.svelte";

  export let data;
  export let nativeToken;
  export let totalCost;
  export let marketPrice;

  let showTooltipName = false;

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  $: cost = Number(data?.price) * marketPrice;

  $: profitAndLoss = cost - (totalCost || 0);

  $: profitAndLossPercent =
    Math.abs(totalCost || 0) === 0 ? 0 : profitAndLoss / Math.abs(totalCost);
</script>

<div
  class="border border_0000000d rounded-[10px] px-1 pt-1 pb-3 flex flex-col gap-2"
>
  <div class="rounded-[10px] overflow-hidden xl:h-[270px] h-[470px]">
    <img
      src={data?.imageUrl ||
        "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
      alt=""
      class="w-full h-full object-cover"
    />
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex flex-col">
      <div
        class="xl:text-base text-2xl font-semibold relative"
        on:mouseenter={() => (showTooltipName = true)}
        on:mouseleave={() => (showTooltipName = false)}
      >
        {shorterName(data?.name, 30)}
        {#if showTooltipName && data?.name.length > 30}
          <span class="absolute -top-7 left-0" style="z-index: 2147483648;">
            <tooltip-detail text={data?.name} />
          </span>
        {/if}
      </div>

      <div class="flex items-center gap-2 xl:text-base text-2xl font-semibold">
        <div>
          {typeWalletAddress === "EVM" ? "Token ID" : "Inscription"}
        </div>
        <div>
          #{data?.tokenId}
        </div>
      </div>
    </div>

    <div class="xl:text-sm text-lg font-normal flex items-center gap-2">
      <div class="text-[#616b84]">Rarity Score</div>
      <div>{data?.rarityScore}</div>
    </div>

    <div class="xl:text-sm text-lg font-normal flex gap-1">
      <div class="text-[#616b84]">Cost</div>
      <div class="flex items-center gap-1">
        <span>
          <TooltipNumber number={Number(data?.price)} type="balance" /><span
            class="ml-1"
          >
            {nativeToken?.symbol || ""}
          </span>
        </span>
        | <TooltipNumber number={cost} type="value" />
      </div>
    </div>

    <div class="xl:text-sm text-lg font-normal flex gap-1">
      <div class="text-[#616b84]">Profit & Loss</div>
      <div class="flex gap-1">
        <div
          class={`flex ${
            profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          <TooltipNumber number={Math.abs(profitAndLoss)} type="value" />
        </div>
        <div
          class={`flex ${
            profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          {#if profitAndLossPercent < 0}
            ↓
          {:else}
            ↑
          {/if}
          <TooltipNumber
            number={Math.abs(profitAndLossPercent) * 100}
            type="percent"
          />%
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
