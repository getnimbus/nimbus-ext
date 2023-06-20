<script lang="ts">
  import EChart from "~/components/EChart.svelte";
  import TooltipTitle from "./TooltipTitle.svelte";

  export let option;
  export let isLoadingChart;
  export let isEmptyDataChart;
</script>

<div
  class="border border-[#0000001a] rounded-[20px] pt-6 pb-9 flex flex-col gap-4"
>
  <div class="text-2xl font-medium text-black pl-6 flex justify-start z-10">
    <TooltipTitle
      tooltipText="The chart shows only activities made by this wallet"
      isBigIcon
    >
      Historical Activities
    </TooltipTitle>
  </div>
  {#if isLoadingChart}
    <div class="flex items-center justify-center h-[152px]">
      <loading-icon />
    </div>
  {:else}
    <div class="h-full">
      {#if isEmptyDataChart}
        <div
          class="flex justify-center items-center h-full text-lg text-gray-400 h-[152px]"
        >
          Empty
        </div>
      {:else}
        <div class="-mt-12">
          <EChart id="calendar-chart" theme="white" {option} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style></style>
