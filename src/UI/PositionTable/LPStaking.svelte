<script lang="ts">
  import LpStakingItem from "./TableItem/LPStakingItem.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let positions;
  export let position;
  export let sum;
  export let sum_claimable;
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="text-xl font-semibold">{position}</div>
    <div class="text-3xl font-semibold flex justify-end">
      $<TooltipNumber number={sum} type="balance" />
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px]">
    <table class="table-auto w-full">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th class="pl-3 py-3">
            <div class="text-xs font-semibold text-black uppercase text-left">
              Pool
            </div>
          </th>

          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Balance
            </div>
          </th>

          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Rewards
            </div>
          </th>

          <th class="pr-3 py-3">
            <div class="text-xs font-semibold text-black uppercase text-right">
              Value
            </div>
          </th>

          <!-- <th class="pr-3 py-3">
            <div class="text-xs font-semibold text-black uppercase text-right">
              Profit & Loss
            </div>
          </th> -->
        </tr>
      </thead>
      <tbody>
        {#each positions as item}
          <LpStakingItem data={item} />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
</style>
