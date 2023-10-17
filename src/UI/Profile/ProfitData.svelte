<script>
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let selectedAddress;
</script>

<div
  class="xl:col-span-4 col-span-2 grid xl:grid-cols-6 grid-cols-3 gap-3 border border_0000001a rounded-xl p-6"
>
  <div class="flex flex-col">
    <span class="text-xs">Balance</span>
    <span>
      <TooltipNumber number={7600} type="value" />
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-xs">ETH Balance</span>
    <span class="flex items-center gap-1">
      <span class="flex items-center gap-1">
        <TooltipNumber number={4.84} type="percent" />ETH
      </span>
      <!-- <span class="text-xs">
        (<TooltipNumber number={7671.83} type="value" />)
      </span> -->
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-xs">Unrealized Profit</span>
    <span>
      <TooltipNumber number={76000} type="value" />
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-xs">30D Realized Profit</span>
    <span>
      <TooltipNumber number={176000} type="value" />
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-xs">30D PnL</span>
    <span>
      <TooltipNumber number={0.12} type="percent" />X
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-xs">30D TXs</span>
    <span>
      <span class="text-green-400">30</span>
      /
      <span class="text-red-500">20 </span>
    </span>
  </div>
</div>

<style></style>
