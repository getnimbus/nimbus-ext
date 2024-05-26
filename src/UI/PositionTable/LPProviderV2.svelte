<script lang="ts">
  import LpProviderItemV2 from "./TableItem/LPProviderItemV2.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let positions;
  export let position;
  export let sum;
  export let sum_claimable;
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="xl:text-xl text-3xl font-semibold">{position}</div>
    <div class="xl:text-3xl text-4xl font-semibold flex justify-end">
      $<TooltipNumber number={sum} type="balance" />
    </div>
  </div>

  <div class="border border_0000000d rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1600px]">
      <thead>
        <tr class="bg_f4f5f8">
          <th
            class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8"
          >
            <div class="xl:text-xs text-xl font-semibold uppercase text-left">
              Pool
            </div>
          </th>

          <th class="py-3">
            <div class="text-right xl:text-xs text-xl font-semibold uppercase">
              Balance
            </div>
          </th>

          <th class="py-3">
            <div class="xl:text-xs text-xl font-semibold uppercase text-right">
              Value
            </div>
          </th>

          <th class="py-3">
            <div class="xl:text-xs text-xl font-semibold uppercase text-right">
              <TooltipTitle
                link="https://docs.getnimbus.io/metrics/impermanent_loss/"
                tooltipText="Total Value If Holding - Current Position Value"
                >Impermanent Loss</TooltipTitle
              >
            </div>
          </th>

          <th class="pr-3 py-3">
            <div class="xl:text-xs text-xl font-semibold uppercase text-right">
              <TooltipTitle
                tooltipText="Current Position Value - (Total value each time Add Liquidation - Total value each time Remove Liquidation)"
              >
                Profit & Loss
              </TooltipTitle>
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
