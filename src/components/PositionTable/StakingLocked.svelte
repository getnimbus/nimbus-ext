<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import StakingLockedItem from "./TableItem/StakingLockedItem.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let positions;
  export let position;
  export let sum;
  export let sum_claimable;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="text-xl font-semibold">{position}</div>
    <div class="flex flex-col gap-1">
      <div class="text-3xl font-semibold flex justify-end">
        $<TooltipNumber number={sum} />
      </div>
      <div class="text-lg font-medium text-gray-600 flex justify-end gap-1">
        {MultipleLang.claimable}:
        <span>
          $<TooltipNumber number={sum_claimable} />
        </span>
      </div>
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px]">
    <table class="table-auto w-full">
      <thead>
        <tr class="bg-[#f4f5f880]">
          <th class="pl-3 py-3">
            <div class="text-xs font-semibold text-black uppercase text-left">
              Pool
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Entry
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Entry Time
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Unlock Time
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Claimable ($)
            </div>
          </th>
          <th class="py-3">
            <div class="text-xs font-semibold text-black uppercase text-right">
              Value ($)
            </div>
          </th>
          <th class="pr-3 py-3">
            <div class="text-xs font-semibold text-black uppercase text-right">
              Profit & Loss
            </div>
          </th>
        </tr>
      </thead>
      {#each positions as item}
        <StakingLockedItem data={item} />
      {/each}
    </table>
  </div>
</div>

<style>
</style>
