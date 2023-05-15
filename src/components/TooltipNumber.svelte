<script>
  import {
    formatBigBalance,
    checkFormatBalance,
    formatCurrency,
    formatCurrencyV2,
  } from "~/utils";
  import numeral from "numeral";

  export let number;
  export let type = "balance";

  let numberFormat = 0;
  let numberSize = "";
  let showTooltip = false;

  $: {
    const { number_format, number_size } = formatBigBalance(number, type);
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
    <span>{formatCurrencyV2(number)}</span>
  {:else}
    <span>
      {#if type === "amount" && number < 100000}
        <span
          >{numeral(number).format("0,0.0[000000]") === "NaN"
            ? number
            : numeral(number).format("0,0.0[000000]")}</span
        >
      {:else}
        <span>{numberFormat}</span><span>{numberSize}</span>
      {/if}
    </span>
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
