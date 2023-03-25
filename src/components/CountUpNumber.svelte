<svelte:options tag="countup-number" />

<script>
  import { CountUp } from "countup.js";

  export let id;
  export let number;
  export let format = 2;

  let countUp = null;

  const easingFn = function (t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  $: {
    if (number) {
      countUp = new CountUp(id, number, {
        decimalPlaces: format,
        duration: 1,
        startVal: (number * 70) / 100,
        easingFn,
      });
      countUp.start();
    }
  }
</script>

<span {id} />

<style></style>
