<script>
  import {
    formatBigBalance,
    checkFormatBalance,
    formatCurrency,
  } from "~/utils";

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
  {#if numberSize === "K"}
    <span>{formatCurrency(number)}</span>
  {:else}
    <span>{numberFormat}</span><span>{numberSize}</span>
  {/if}
  {#if showTooltip && ((numberSize && numberSize !== "K") || checkFormatBalance(number) === "NaN")}
    <span
      class="absolute -top-7 left-1/2 transform -translate-x-1/2"
      style="z-index: 2147483648;"
    >
      <tooltip-detail text={formatCurrency(number)} />
    </span>
  {/if}
</span>

<style></style>
