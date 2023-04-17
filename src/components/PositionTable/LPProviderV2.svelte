<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import LpProviderItemV2 from "./TableItem/LPProviderItemV2.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  export let data;
  export let positions;
  export let position;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };

  let dataPositionFormat = [];

  $: {
    if (positions) {
      const formatData = positions.map((item) => {
        const price0 = item?.amount0Price?.price || 0;
        const price1 = item?.amount1Price?.price || 0;

        return {
          ...item,
          initialValue:
            Number(item.amount0out) * price0 + Number(item.amount1out) * price1,
        };
      });

      dataPositionFormat = formatData.sort((a, b) => {
        if (a.initialValue < b.initialValue) {
          return 1;
        }
        if (a.initialValue > b.initialValue) {
          return -1;
        }
        return 0;
      });
    }
  }
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
      {#each dataPositionFormat as item}
        <LpProviderItemV2 data={item} />
      {/each}
    </table>
  </div>
</div>

<style>
</style>
