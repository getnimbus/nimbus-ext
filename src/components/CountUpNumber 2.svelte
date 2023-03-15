<script>
  import { onMount, onDestroy } from "svelte";
  import { CountUp } from "countup.js";

  export let id;
  export let number;
  export let format = 2;

  let countUp = null;

  onMount(() => {
    countUp = new CountUp(id, number, {
      decimalPlaces: format,
      duration: 1,
    });
    countUp.start();
  });

  onDestroy(() => {
    countUp.destroy();
  });
</script>

<span {id} />

<style></style>
