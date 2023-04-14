<script lang="ts">
  export let data;
  import LpProviderItemV2 from "./TableItem/LPProviderItemV2.svelte";

  let dataPositionFormat = [];

  $: {
    if (data) {
      const formatData = data.map((item) => {
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

<style>
</style>
