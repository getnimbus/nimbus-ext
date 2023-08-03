<script lang="ts">
  import CheckIcon from "./CheckIcon.svelte";
  import DangerIcon from "./DangerIcon.svelte";

  export let isGood: boolean = true;
</script>

{#if isGood}
  <CheckIcon />
{:else}
  <DangerIcon />
{/if}
