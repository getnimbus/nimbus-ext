<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import LpProviderItem from "./TableItem/LPProviderItem.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";

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
        $<TooltipNumber number={sum} type="balance" />
      </div>
      <div class="text-lg font-medium text-gray-600 flex justify-end gap-1">
        {MultipleLang.claimable}:
        <span>
          $<TooltipNumber number={sum_claimable} type="balance" />
        </span>
      </div>
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1200px]">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th
            class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8]"
          >
            <div class="text-xs font-semibold text-black uppercase text-left">
              Pool
            </div>
          </th>

          <th class="py-3 w-[110px]">
            <div class="text-left text-xs font-semibold text-black uppercase">
              Liquidity Range
            </div>
          </th>

          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Balance
            </div>
          </th>

          <th class="py-3">
            <div class="text-right text-xs font-semibold text-black uppercase">
              Claimable
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
            add/remove liquidity">Profit & Loss</TooltipTitle
              >
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each positions as item}
          <LpProviderItem data={item} />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
</style>
