<script>
  import { onMount } from "svelte";
  import { CountUp } from "countup.js";
  import {
    formatBigBalance,
    formatCurrency,
    checkFormatBalance,
    formatCurrencyV2,
  } from "~/utils";

  export let id;
  export let number;
  export let format = 2;

  let countUp = null;
  let options = {
    decimalPlaces: format,
    duration: 1,
    startVal: 0,
  };
  let numberFormat = 0;
  let numberSize = "";
  let showTooltip = false;
  let numberToCount = 0;

  onMount(() => {
    countUp = new CountUp(id, numberToCount, options);
    countUp.start();
  });

  $: {
    const { number_format, number_size } = formatBigBalance(number, false);
    numberFormat = number_format;
    numberSize = number_size;

    numberToCount = number_size === "K" ? number : number_format;

    options = {
      ...options,
      startVal: (numberToCount * 70) / 100,
    };

    if (countUp) {
      countUp.update(numberToCount);
    }
  }

  $: {
    if (number === 0 && countUp) {
      countUp.reset();
    }
  }
</script>

<span
  class="relative"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
>
  <span {id}>
    {#if numberSize === "K"}
      {formatCurrencyV2(number)}
    {:else}
      {numberFormat}
    {/if}
  </span>
  {#if numberSize !== "K"}
    <span>{numberSize}</span>
  {/if}
  {#if showTooltip && ((numberSize && numberSize !== "K") || checkFormatBalance(number) === "NaN")}
    <span class="absolute -top-7 left-0" style="z-index: 2147483648;">
      <tooltip-detail text={formatCurrency(number)} />
    </span>
  {/if}
</span>

<style></style>
