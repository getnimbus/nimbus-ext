<script lang="ts">
  import { onMount } from "svelte";
  import { isDarkMode } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import ClosedAndRuggedHoldingTradeItem from "./ClosedAndRuggedHoldingTradeItem.svelte";

  export let holdingTokenData;
  export let isLoading;
</script>

<div
  class="col-span-4 border border_0000001a rounded-xl flex flex-col gap-3 p-6"
>
  <div class="flex justify-start text-3xl font-medium xl:text-xl">
    Closed Trades
  </div>

  <div
    class={`rounded-[10px] xl:overflow-y-auto overflow-auto max-h-[350px] ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <table class="table-auto xl:w-full w-[2000px] h-full">
      <thead class="sticky top-0 z-10">
        <tr class="bg_f4f5f8">
          <th
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[250px]"
          >
            <div class="text-left xl:text-xs text-xl uppercase font-medium">
              Assets
            </div>
          </th>
          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Avg Cost
            </div>
          </th>
          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              ROI
            </div>
          </th>
          <th class="py-3 pr-3 rounded-tr-[10px]">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Last activity
            </div>
          </th>
        </tr>
      </thead>

      {#if isLoading}
        <tbody>
          <tr>
            <td colspan={4}>
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if holdingTokenData && holdingTokenData.length === 0}
            <tr>
              <td colspan={4}>
                <div
                  class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                >
                  Empty
                </div>
              </td>
            </tr>
          {:else}
            {#each holdingTokenData as data, index}
              <ClosedAndRuggedHoldingTradeItem
                {data}
                lastIndex={holdingTokenData.length - 1 === index}
              />
            {/each}
          {/if}
        </tbody>
      {/if}
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
