<script lang="ts">
  import TooltipNumber from "./TooltipNumber.svelte";

  export let data;
  export let marketPrice;

  $: profitAndLoss = data.est_valueBTC * marketPrice - (data.totalCost || 0);
  $: profitAndLossPercent =
    Math.abs(data.totalCost || 0) === 0
      ? 0
      : profitAndLoss / Math.abs(data.totalCost);
</script>

<div
  class="border border-[#0000000d] rounded-[10px] px-1 pt-1 pb-3 flex flex-col gap-2"
>
  <div class="rounded-[10px] overflow-hidden h-[270px]">
    <img src={data.image_url} alt="" class="w-full h-full object-cover" />
  </div>
  <div class="flex flex-col gap-1">
    <div class="text-sm font-semibold">#{data.item_id}</div>
    <div class="flex gap-1 items-center">
      <div class="text-sm font-semibold">Inscription</div>
      <div class="text-sm font-semibold">#{data.inscription_number}</div>
    </div>
    <div class="text-xs font-normal text-[#616b84] flex gap-1">
      <div>Est. value</div>
      <div>
        <TooltipNumber number={data.est_valueBTC} type="amount" /> BTC | $<TooltipNumber
          number={data.est_valueBTC * marketPrice}
          type="amount"
        />
      </div>
    </div>
    <div class="text-xs font-normal text-[#616b84] flex gap-1">
      <div>Profit & Loss</div>
      <div class="flex gap-1">
        <div
          class={`flex ${
            profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          $<TooltipNumber number={Math.abs(profitAndLoss)} />
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
          <TooltipNumber number={Math.abs(profitAndLossPercent) * 100} />%
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
