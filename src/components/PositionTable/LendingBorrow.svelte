<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import LendingProviderItem from "./TableItem/LendingProviderItem.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  export let data;
  export let positions;
  export let position;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="text-xl font-semibold">{position}</div>
    <div class="flex flex-col gap-1">
      <div class="text-3xl font-semibold flex justify-end">
        $<TooltipBalance number={data.currentValue} />
      </div>
      <div class="text-lg font-medium text-gray-600 flex justify-end gap-1">
        {MultipleLang.claimable}: $<TooltipBalance number={data.claimable} />
      </div>
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px]">
    <table class="table-auto w-full">
      <thead>
        <tr class="bg-[#f4f5f880]">
          <th class="pl-3 py-3">
            <div class="text-sm font-semibold text-black uppercase text-left">
              Pool
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Entry ($)
            </div>
          </th>
          <!-- <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Entry Time
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              APY (%)
            </div>
          </th> -->
          <th class="py-3">
            <div class="text-sm font-semibold text-black uppercase text-right">
              Value ($)
            </div>
          </th>
          <th class="pr-3 py-3">
            <div class="text-sm font-semibold text-black uppercase text-right">
              Profit & Loss
            </div>
          </th>
        </tr>
      </thead>
      {#each positions as item}
        <LendingProviderItem data={item} />
      {/each}
    </table>
  </div>
</div>

<style>
</style>
