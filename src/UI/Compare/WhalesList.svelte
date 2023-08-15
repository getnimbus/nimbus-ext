<script lang="ts">
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import WhaleItem from "./WhaleItem.svelte";

  export let data;
  export let copyAddress = (address) => {};
  export let closeModal = () => {};
</script>

<div
  class="border border-[#0000000d] rounded-[10px] overflow-visible overflow-y-auto h-[563px] relative"
>
  <table class="table-auto xl:w-full w-[1800px]">
    <thead>
      <tr class="bg-[#f4f5f8]">
        <th
          class="pl-3 py-3 rounded-tl-[10px] 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8]"
        >
          <div
            class="text-left xl:text-xs text-base uppercase font-medium text-black"
          >
            Address
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            Net Worth
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            1D
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            7D
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            30D
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            1Y
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            <TooltipTitle
              tooltipText={"Volatility measures the extent of price fluctuations for an asset over time."}
              isBigIcon
            >
              Volatility
            </TooltipTitle>
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            <TooltipTitle
              tooltipText={"Max drawdown is the biggest loss experienced by an investment or portfolio."}
              isBigIcon
            >
              Max drawdown
            </TooltipTitle>
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-medium text-black"
          >
            <TooltipTitle
              tooltipText={"The Sharpe ratio measures how well an investment performs relative to its risk."}
              isBigIcon
            >
              Sharpe ratio
            </TooltipTitle>
          </div>
        </th>
        <th class="py-3 pr-3 rounded-tr-[10px]" />
      </tr>
    </thead>
    <tbody>
      {#if data && data?.length === 0}
        <tr>
          <td colspan="11">
            <div
              class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
            >
              Empty
            </div>
          </td>
        </tr>
      {:else}
        {#each data as item}
          <WhaleItem data={item} {copyAddress} {closeModal} />
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
