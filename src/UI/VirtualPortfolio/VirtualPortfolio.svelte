<script lang="ts">
  export let listTokenHolding;
  export let isLoading;

  import Allocation from "./Allocation.svelte";
  import Performance from "./Performance.svelte";
  import Holding from "./Holding.svelte";
</script>

<div class="flex flex-col gap-6">
  <div class="grid xl:grid-cols-2 grid-cols-1 gap-6">
    <Allocation {isLoading} {listTokenHolding} />
    <Performance {isLoading} />
  </div>
  <Holding {isLoading} {listTokenHolding} />
</div>

<style windi:preflights:global windi:safelist:global></style>
