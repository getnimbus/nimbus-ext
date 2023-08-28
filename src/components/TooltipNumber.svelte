<script lang="ts">
  import { formatBigBalance, formatPercent, formatCurrency } from "~/utils";
  import numeral from "numeral";
  import tooltip from "~/entries/contentScript/views/tooltip";

  export let number;
  export let type: "amount" | "balance" | "percent" = "balance";

  let numberFormat = 0;
  let numberSize = "";

  $: {
    const { number_format, number_size } = formatBigBalance(number);
    numberFormat = number_format;
    numberSize = number_size;
  }
</script>

{#if type === "percent"}
  <span class="w-max">
    {formatPercent(number) === "NaN" ? 0 : formatPercent(number)}
  </span>
{:else}
  <span class="w-max">
    {#if (numberSize && numberSize !== "K") || formatPercent(number) === "NaN"}
      <span
        use:tooltip={{
          content: `<tooltip-detail text="${formatCurrency(number)}" />`,
          allowHTML: true,
          placement: "top",
        }}
      >
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
    {:else}
      <span>{formatCurrency(number)}</span>
    {/if}
  </span>
{/if}

<style>
</style>
