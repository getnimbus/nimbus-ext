<script lang="ts">
  import { onMount } from "svelte";
  import { CountUp } from "countup.js";
  import numeral from "numeral";
  import { formatBigBalance, formatPercent, formatCurrency } from "~/utils";
  import { isHidePortfolio } from "~/store";
  import { tweened } from "svelte/motion";
  import { quintOut } from "svelte/easing";
  import { derived } from "svelte/store";

  let myNumber = tweened(0, { duration: 1200, easing: quintOut });
  let formatted = derived(myNumber, ($myNumber) => $myNumber);

  export let id;
  export let number;
  export let format = 2;
  export let type: "amount" | "balance" | "percent" = "balance";
  export let personalValue: boolean = false;

  let hiddenPortfolio = false;
  isHidePortfolio.subscribe((value) => (hiddenPortfolio = value));

  let numberFormat = 0;
  let numberSize = "";
  let showTooltip = false;

  $: numberSize = formatBigBalance($formatted).number_size;
  $: numberFormat = formatBigBalance($formatted).number_format;
</script>

{#if hiddenPortfolio && personalValue === true}
  <span>******</span>
{:else}
  <span class="relative">
    <span class="flex">
      <span
        on:mouseenter={() => (showTooltip = true)}
        on:mouseleave={() => (showTooltip = false)}
      >
        {#if type === "balance" || type === "percent"}
          <span>
            {#if numberSize === "K"}
              <span {id}>{formatCurrency($formatted)}</span>
            {:else}
              <span {id}>{numberFormat}</span>
            {/if}
          </span>
        {/if}

        {#if type === "amount"}
          <span>
            {#if numberSize === "K"}
              <span>{formatCurrency($formatted)}</span>
            {:else}
              <span>
                {#if number < 100000}
                  <span
                    >{numeral($formatted).format("0,0.0[000000]") === "NaN"
                      ? $formatted
                      : numeral($formatted).format("0,0.0[000000]")}</span
                  >
                {:else}
                  <span>{numberFormat}</span>
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
          <tooltip-detail text={formatCurrency($formatted)} />
        </span>
      {/if}
    </span>
  </span>
{/if}

<style>
</style>
