<script lang="ts">
  import EChart from "~/components/EChart.svelte";
  import TooltipTitle from "./TooltipTitle.svelte";
  import TooltipNumber from "./TooltipNumber.svelte";

  export let option;
  export let isLoadingChart;
  export let isEmptyDataChart;
  export let isTrxPage = false;
  export let title;
  export let tooltipTitle;
  export let sum = 0;
  export let id;
  export let type;

  import LoadingPremium from "./LoadingPremium.svelte";
  import "~/components/Loading.custom.svelte";

  import Logo from "~/assets/logo-1.svg";
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 pl-6">
    <div
      class={`font-medium text-black flex justify-start z-10 w-max ${
        isTrxPage ? "xl:text-2xl text-4xl" : "xl:text-xl text-3xl"
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
    {#if sum !== 0}
      <div class="xl:text-lg text-2xl font-medium">
        $<TooltipNumber number={sum} type="balance" />
      </div>
    {/if}
  </div>
  {#if isLoadingChart}
    <div class="flex items-center justify-center h-[152px]">
      {#if type === "primary"}
        <LoadingPremium />
      {:else}
        <loading-icon />
      {/if}
    </div>
  {:else}
    <div class="h-full">
      {#if isEmptyDataChart}
        <div
          class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[152px]"
        >
          Empty
        </div>
      {:else}
        <div class="relative xl:-mt-12">
          <EChart
            {id}
            theme="white"
            {option}
            type="full-width"
            notMerge={true}
          />
          <div
            class="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50 top-2/3 left-1/2"
          >
            <img src={Logo} alt="" width="140" height="140" />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style></style>
