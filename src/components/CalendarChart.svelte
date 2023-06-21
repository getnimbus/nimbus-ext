<script lang="ts">
  import EChart from "~/components/EChart.svelte";
  import TooltipTitle from "./TooltipTitle.svelte";

  export let option;
  export let isLoadingChart;
  export let isEmptyDataChart;
  export let isTrxPage = false;
  export let title;
  export let tooltipTitle;
  export let id;
</script>

<div
  class={`font-medium text-black pl-6 flex justify-start z-10 w-max ${
    isTrxPage ? "text-2xl" : "text-xl"
  }`}
>
  {#if tooltipTitle}
    <TooltipTitle tooltipText={tooltipTitle} isBigIcon>
      {title}
    </TooltipTitle>
  {:else}
    {title}
  {/if}
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
        <EChart {id} theme="white" {option} />
      </div>
    {/if}
  </div>
{/if}

<style></style>
