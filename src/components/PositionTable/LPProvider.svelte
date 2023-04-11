<script lang="ts">
  export let data;
  import LpProviderItem from "./TableItem/LPProviderItem.svelte";
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
        Balance
      </div>
    </th>
    <th class="py-3">
      <div class="text-right text-sm font-semibold text-black uppercase">
        Claimable
      </div>
    </th>
    <th class="pr-3 py-3">
      <div class="text-sm font-semibold text-black uppercase text-right">
        Value (USD)
      </div>
    </th>
    <th class="pr-3 py-3">
      <div class="text-sm font-semibold text-black uppercase text-right">
        Profit & Loss
      </div>
    </th>
  </tr>
</thead>
{#each data as item}
  <LpProviderItem data={item} />
{/each}

<style>
</style>
