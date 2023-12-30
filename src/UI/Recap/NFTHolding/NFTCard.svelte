<script lang="ts">
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  $: console.log("data: ", data);

  $: profitAndLoss =
    Number(data?.price) === 0
      ? 0
      : Number(data?.floorPrice) - (Number(data?.price) || 0);

  $: profitAndLossPercent =
    profitAndLoss === 0
      ? 0
      : (profitAndLoss * Number(data?.marketPrice)) /
        Math.abs(Number(data?.cost));
</script>

<div class="flex-1 flex flex-col gap-4 items-center">
  <div class="h-[300px] rounded-[20px] overflow-hidden">
    <img src={data.imageUrl} alt="" class="w-full h-full object-cover" />
  </div>
  <div class="flex flex-col items-center">
    <div class="flex items-center gap-1">
      <div class="text-white text-xl font-bold">
        <TooltipNumber number={Number(data?.floorPrice || 0)} type="balance" />
      </div>
      <div class="text-[#B7B7B7] text-base mt-1">SOL</div>
    </div>
    <div class="flex items-center gap-1 text-xl">
      <div
        class={`flex items-center ${
          profitAndLossPercent !== 0
            ? profitAndLossPercent >= 0
              ? "text-[#00A878]"
              : "text-red-500"
            : "text-white"
        }`}
      >
        <TooltipNumber
          number={Math.abs(profitAndLossPercent) * 100}
          type="percent"
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

<style></style>
