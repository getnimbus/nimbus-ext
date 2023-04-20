<script>
  import { formatBigBalance, formatBalance } from "~/utils";

  export let number;
  export let isFormatPercent = false;

  let numberFormat = 0;
  let numberSize = "";
  let showTooltip = false;

  $: {
    const { number_format, number_size } = formatBigBalance(
      number,
      isFormatPercent
    );
    numberFormat = number_format;
    numberSize = number_size;
  }
</script>

<span
  class="relative w-max"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
>
  <span>{numberFormat}</span><span>{numberSize}</span>
  {#if showTooltip && numberSize}
    <span class="absolute -top-7 left-0" style="z-index: 2147483648;">
      <tooltip-detail text={formatBalance(number)} />
    </span>
  {/if}
</span>

<style></style>
