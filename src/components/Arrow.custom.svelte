<svelte:options tag="app-arrow" />

<script></script>

<div class="line-arrow relative">
  <slot />
  <div
    class="absolute -bottom-[4.5px] -right-[8px] h-0 w-0 transform rotate-90 arrow"
  />
</div>

<style>
  .line-arrow {
    border-bottom: 1px solid #27326f66;
    padding-bottom: 2px;
  }

  .arrow {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid #27326f66;
  }
</style>
