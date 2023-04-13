<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let optionPie;
  export let optionLine;
  export let isLoading;

  import EChart from "../EChart.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
    performance: i18n("newtabPage.performance", "Performance"),
  };
</script>

<div class="flex xl:flex-row flex-col justify-between gap-6">
  <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
    <div class="flex justify-between mb-1">
      <div class="pl-4 text-2xl font-medium text-black">
        {MultipleLang.token_allocation}
      </div>
      <!-- <div class="flex items-center gap-2">
        <div
          class={`cursor-pointer text-base font-medium py-[6px] px-4 rounded-[100px] transition-all ${
            selectedTokenAllocation === "token" && "bg-[#1E96FC] text-white"
          }`}
          on:click={() => (selectedTokenAllocation = "token")}
        >
          Token
        </div>
        <div
          class={`cursor-pointer text-base font-medium py-[6px] px-4 rounded-[100px] transition-all ${
            selectedTokenAllocation === "chain" && "bg-[#1E96FC] text-white"
          }`}
          on:click={() => (selectedTokenAllocation = "chain")}
        >
          Chain
        </div>
      </div> -->
    </div>
    {#if isLoading}
      <div class="flex items-center justify-center h-[465px]">
        <loading-icon />
      </div>
    {:else}
      <EChart id="pie-chart" theme="white" option={optionPie} height={465} />
    {/if}
  </div>
  <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
    <div class="pl-4 text-2xl font-medium text-black mb-3">
      {MultipleLang.performance}
    </div>
    {#if isLoading}
      <div class="flex items-center justify-center h-[433px]">
        <loading-icon />
      </div>
    {:else}
      <EChart id="line-chart" theme="white" option={optionLine} height={433} />
    {/if}
  </div>
</div>

<style>
</style>
