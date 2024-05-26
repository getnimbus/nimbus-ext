<script lang="ts">
  import { Circle } from "svelte-loading-spinners";

  export let size = 30;
</script>

<Circle {size} color="#38bdf8" unit="px" duration="1s" />

<style windi:preflights:global windi:safelist:global>
</style>
