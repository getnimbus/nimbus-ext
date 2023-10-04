<script lang="ts">
  import { onMount } from "svelte";
  import { CountUp } from "countup.js";
  import numeral from "numeral";
  import { formatBigBalance, formatPercent, formatCurrency } from "~/utils";
  import { isHidePortfolio } from "~/store";

  export let id;
  export let number;
  export let format = 2;
  export let type: "amount" | "balance" | "percent" = "balance";
  export let personalValue: boolean = false;

  let hiddenPortfolio = false;
  isHidePortfolio.subscribe((value) => (hiddenPortfolio = value));

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

  $: console.log("number hello mấy cưng: ", number);

  onMount(() => {
    countUp = new CountUp(id, numberToCount, options);
    // countUp.start();
  });

  $: console.log({ numberToCount, countUp });

  $: {
    if (countUp) {
      countUp.start();
    }
  }

  $: {
    console.log({ number });
  }

  $: {
    if (number) {
      const { number_format, number_size } = formatBigBalance(number);
      numberFormat = number_format;
      numberSize = number_size;

      if (type === "amount") {
        if (number < 100000) {
          numberToCount =
            numeral(number).format("0,0.0[000000]") === "NaN"
              ? number
              : numeral(number).format("0,0.0[000000]");
        } else {
          numberToCount = number_size === "K" ? number : number_format;
        }
      }

      if (type === "balance" || type === "percent") {
        // console.log("set number to count", type, numberToCount);
        numberToCount = number_size === "K" ? number : number_format;
      }

      options = {
        ...options,
        startVal: (Number(numberToCount) * 70) / 100,
      };

      if (countUp) {
        countUp.update(Number(numberToCount));
      }
    }
  }
</script>

{#if hiddenPortfolio && personalValue === true}
  <span>******</span>
{:else}
  <span class="relative">
    <span class="flex">
      <span
        {id}
        on:mouseenter={() => (showTooltip = true)}
        on:mouseleave={() => (showTooltip = false)}
      >
        {#if type === "balance" || type === "percent"}
          <span>
            {#if numberSize === "K"}
              <span {id}>{formatCurrency(number)}</span>
            {:else}
              <span {id}>{numberFormat}</span>
            {/if}
          </span>
        {/if}

        {#if type === "amount"}
          <span>
            {#if numberSize === "K"}
              <span>{formatCurrency(number)}</span>
            {:else}
              <span>
                {#if number < 100000}
                  <span
                    >{numeral(number).format("0,0.0[000000]") === "NaN"
                      ? number
                      : numeral(number).format("0,0.0[000000]")}</span
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
      {#if showTooltip && ((numberSize && numberSize !== "K") || formatPercent(number) === "NaN")}
        <span class="absolute -top-7 left-0" style="z-index: 2147483648;">
          <tooltip-detail text={formatCurrency(number)} />
        </span>
      {/if}
    </span>
  </span>
{/if}

<style>
</style>
