<script>
  import { CountUp } from "countup.js";

  export let id;
  export let number;
  export let format = 2;

  let countUp = null;

  $: {
    if (number) {
      countUp = new CountUp(id, number, {
        decimalPlaces: format,
        duration: 1,
      });
      countUp.start();
    }
  }
</script>

<span {id} />

<style></style>
