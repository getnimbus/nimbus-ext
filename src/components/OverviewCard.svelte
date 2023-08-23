<script lang="ts">
  export let title;
  export let tooltipText = "";
  export let link = "";
  export let isTooltip = false;

  import TooltipTitle from "~/components/TooltipTitle.svelte";
</script>

<div
  class="overview_card_container flex-1 py-4 px-6 rounded-lg flex flex-col items-start xl:gap-1 gap-3"
>
  {#if isTooltip}
    <TooltipTitle {tooltipText} {link} isBigIcon>
      <div class="text_00000099 xl:text-base text-3xl font-medium">
        {title}
      </div>
    </TooltipTitle>
  {:else}
    <div class="text_00000099 xl:text-base text-3xl font-medium">
      {title}
    </div>
  {/if}
  <slot />
</div>

<style>
  :global(body) .overview_card_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .overview_card_container {
    background: #110c2a;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 1);
  }
</style>
