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
  use:tooltip={{
    content: `<tooltip-detail text="${formatBalance(number)}" />`,
    allowHTML: true,
    placement: "top",
  }}
>
  <span {id}>{numberFormat}</span><span>{numberSize}</span>
</span>

<style></style>
