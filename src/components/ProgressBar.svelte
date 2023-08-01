<script lang="ts">
  import { Progressbar } from "flowbite-svelte";

  export let progress;
  export let leftLabel;
  export let rightLabel;
</script>

<div class="flex items-center gap-2">
  <div>left</div>
  <Progressbar progress="50" size="h-4" labelInside />
  <div>right</div>
</div>

<style></style>
