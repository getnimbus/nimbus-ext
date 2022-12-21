<svelte:options tag="reset-style" />

<script>
</script>

<div class="text-base leading-[28px] nimbus-reset-style">
  <slot />
</div>

<style>
  .nimbus-reset-style {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,
      Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  }

  .nimbus-reset-style input {
    background: #fff;
  }

  .nimbus-reset-style a {
    text-decoration: none;
  }
</style>
