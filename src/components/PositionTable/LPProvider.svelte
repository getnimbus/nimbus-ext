<script lang="ts">
  export let data;
  import LpProviderItem from "./TableItem/LPProviderItem.svelte";

  let dataPositionFormat = [];

  $: {
    if (data) {
      const formatData = data.map((item) => {
        return {
          ...item,
          initialValue:
            (Number(item.amount0out) * item?.amount0Price?.price ||
              0 + item.claimable0Amount * item?.amount0Price?.price ||
              0) +
            (Number(item.amount0out) * item?.amount0Price?.price ||
              0 + item.claimable0Amount * item?.amount0Price?.price ||
              0),
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
        Liquidity Range
      </div>
    </th>
    <th class="py-3">
      <div class="text-right text-sm font-semibold text-black uppercase">
        Balance ($)
      </div>
    </th>
    <th class="py-3">
      <div class="text-right text-sm font-semibold text-black uppercase">
        Claimable ($)
      </div>
    </th>
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
{#each dataPositionFormat as item}
  <LpProviderItem data={item} />
{/each}

<style>
</style>
