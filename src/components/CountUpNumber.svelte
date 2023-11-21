<script lang="ts">
  import numeral from "numeral";
  import {
    formatBigBalance,
    formatPercent,
    formatCurrency,
    formatValue,
  } from "~/utils";
  import { isHidePortfolio } from "~/store";
  import { tweened } from "svelte/motion";
  import { quintOut } from "svelte/easing";
  import { derived } from "svelte/store";

  import Tooltip from "~/components/Tooltip.svelte";

  export let number;
  export let type: "amount" | "balance" | "percent" | "value" = "balance";
  export let personalValue: boolean = false;

  let myNumber = tweened(0, { duration: 1200, easing: quintOut });
  let numberFormat = 0;
  let numberSize = "";
  let showTooltip = false;

  $: {
    myNumber.set(number);
  }

  $: formatted = derived(myNumber, ($myNumber) => $myNumber);

  $: numberSize = formatBigBalance($formatted).number_size;
  $: numberFormat = formatBigBalance($formatted).number_format;
</script>

{#if $isHidePortfolio && personalValue}
  <span>******</span>
{:else}
  <span class="flex relative">
    <span
      on:mouseenter={() => (showTooltip = true)}
      on:mouseleave={() => (showTooltip = false)}
    >
      {#if type === "balance" || type === "percent"}
        <span>
          {#if numberSize === "K"}
            <span class="tabular-nums">{formatCurrency($formatted)}</span>
          {:else}
            <span class="tabular-nums">{numberFormat}</span>
          {/if}
        </span>
      {/if}

      {#if type === "value"}
        <span>
          {#if numberSize === "K"}
            <span class="tabular-nums">{formatValue($formatted)}</span>
          {:else}
            <span class="tabular-nums">${numberFormat}</span>
          {/if}
        </span>
      {/if}

      {#if type === "amount"}
        <span>
          {#if numberSize === "K"}
            <span class="tabular-nums">{formatCurrency($formatted)}</span>
          {:else}
            <span>
              {#if number < 100000}
                <span class="tabular-nums"
                  >{numeral($formatted).format("0,0.0[000000]") === "NaN"
                    ? $formatted
                    : numeral($formatted).format("0,0.0[000000]")}</span
                >
              {:else}
                <span class="tabular-nums">{numberFormat}</span>
              {/if}
            </span>
          {/if}
        </span>
      {/if}
    </span>
    {#if numberSize !== "K"}
      <span>{numberSize}</span>
    {/if}
    {#if showTooltip && ((numberSize && numberSize !== "K") || formatPercent($formatted) === "NaN")}
      <span class="absolute -top-7 left-0" style="z-index: 2147483648;">
        <Tooltip text={formatCurrency($formatted)} />
      </span>
    {/if}
  </span>
{/if}

<style>
</style>
