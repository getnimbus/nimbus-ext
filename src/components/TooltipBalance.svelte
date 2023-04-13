<script>
  import { checkFormatBalance } from "~/utils";

  export let text;
  export let originalText;

  let showTooltip = false;
</script>

<div
  class="relative w-max"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
>
  {text}
  {#if showTooltip && checkFormatBalance(text) === "NaN"}
    <div class="absolute -top-7 left-0" style="z-index: 2147483648;">
      <tooltip-detail text={originalText} />
    </div>
  {/if}
</div>

<style>
</style>
