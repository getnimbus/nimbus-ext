<script lang="ts">
  import LpProviderItemV2 from "./TableItem/LPProviderItemV2.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  export let positions;
  export let position;
  export let sum;
  export let sum_claimable;
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="text-xl font-semibold">{position}</div>
    <div class="text-3xl font-semibold flex justify-end">
      $<TooltipBalance number={sum} />
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
              Balance
            </div>
          </th>
          <th class="pr-3 py-3">
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
      <tbody>
        {#each positions as item}
          <LpProviderItemV2 data={item} />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
</style>
