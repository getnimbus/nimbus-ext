<script lang="ts">
  import {
    formatBigBalance,
    checkFormatBalance,
    formatCurrency,
    formatCurrencyV2,
  } from "~/utils";
  import numeral from "numeral";

  export let number;
  export let type: "amount" | "balance" | "percent" = "balance";

  let numberFormat = 0;
  let numberSize = "";
  let showTooltip = false;

  $: {
    const { number_format, number_size } = formatBigBalance(number);
    numberFormat = number_format;
    numberSize = number_size;
  }

  $: console.log({
    number,
    type,
    numberFormat,
  });
</script>

{#if type === "percent"}
  <span class="w-max">
    {checkFormatBalance(number) === "NaN" ? 0 : checkFormatBalance(number)}
  </span>
{:else}
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
            >{numeral(number).format("0,0.000000") === "NaN"
              ? number
              : numeral(number).format("0,0.000000")}</span
          >
        {:else}
          <span
            >{numeral(numberFormat).format("0,0.00") === "NaN"
              ? numberFormat
              : numeral(numberFormat).format("0,0.00")}</span
          ><span>{numberSize}</span>
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
{/if}

<style>
</style>
