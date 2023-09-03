<script lang="ts">
  import {
    formatBigBalance,
    formatPercent,
    formatCurrency,
    formatValue,
  } from "~/utils";
  import numeral from "numeral";
  import tooltip from "~/entries/contentScript/views/tooltip";

  export let number;
  export let type: "amount" | "balance" | "percent" | "value" = "value";

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
        class="flex items-center"
      >
        <span>
          {#if type === "value"}${/if}{numeral(numberFormat).format(
            "0,0.00"
          ) === "NaN"
            ? numberFormat
            : numeral(numberFormat).format("0,0.00")}
        </span>
        <span>
          {numberSize}
        </span>
      </span>
    {:else}
      <span>
        {#if type === "value"}
          <span>
            {#if number !== 0 && number > 0 && number < 0.01}
              <span
                use:tooltip={{
                  content: `<tooltip-detail text="${formatCurrency(
                    number
                  )}" />`,
                  allowHTML: true,
                  placement: "top",
                }}
              >
                {formatValue(number)}
              </span>
            {:else}
              {formatValue(number)}
            {/if}
          </span>
        {:else}
          {formatCurrency(number)}
        {/if}
      </span>
    {/if}
  </span>
{/if}

<style>
</style>
