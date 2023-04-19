<script>
  import { checkFormatBalance, formatBalance, formatCurrency } from "~/utils";

  export let number;

  let showTooltip = false;
</script>

<span
  class="relative w-max"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
>
  {formatBalance(number)}
  {#if showTooltip && checkFormatBalance(number) === "NaN"}
    <div class="absolute -top-7 left-0" style="z-index: 2147483648;">
      <tooltip-detail text={formatCurrency(number)} />
    </div>
  {/if}
</span>

<style>
</style>
