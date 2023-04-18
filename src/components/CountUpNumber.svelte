<svelte:options tag="countup-number" />

<script>
  import { CountUp } from "countup.js";
  import { formatBigBalance, formatBalance } from "~/utils";

  import tooltip from "~/entries/contentScript/views/tooltip";

  export let id;
  export let number;
  export let format = 2;

  let countUp = null;
  let numberFormat = 0;
  let numberSize = "";
  let showTooltip = false;

  const easingFn = function (t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  $: {
    const { number_format, number_size } = formatBigBalance(number);
    numberFormat = number_format;
    numberSize = number_size;

    countUp = new CountUp(id, number_format, {
      decimalPlaces: format,
      duration: 1,
      startVal: (number_format * 70) / 100,
      easingFn,
    });
    countUp.start();
  }
</script>

<span
  class="relative"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
>
  <span {id}>{numberFormat}</span><span>{numberSize}</span>
  {#if showTooltip && numberSize}
    <span class="absolute -top-7 left-0" style="z-index: 2147483648;">
      <tooltip-detail text={formatBalance(number)} />
    </span>
  {/if}
</span>

<style></style>
