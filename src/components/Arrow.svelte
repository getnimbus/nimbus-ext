<svelte:options tag="app-arrow" />

<script></script>

<div class="line-arrow relative">
  <slot />
  <div class="absolute -bottom-[5px] h-0 w-0 transform -right-[5.5px] rotate-90 arrow" />
</div>

<style>
  .line-arrow {
    border-bottom: 1px solid gray;
  }

  .arrow {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid gray;
  }
</style>
