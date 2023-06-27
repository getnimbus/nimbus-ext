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
            <div class="text-xs font-semibold text-black uppercase text-right">
              Value
            </div>
          </th>

          <th class="py-3">
            <div class="text-xs font-semibold text-black uppercase text-right">
              <TooltipTitle
                link="https://docs.getnimbus.io/metrics/impermanent_loss/"
                >Impermanent Loss</TooltipTitle
              >
            </div>
          </th>

          <th class="pr-3 py-3">
            <div class="text-xs font-semibold text-black uppercase text-right">
              <TooltipTitle
                tooltipText="Profit and loss is calculated by buying & hold on every time you
            add/remove liquidity"
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
