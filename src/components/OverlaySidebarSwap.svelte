<script>
  export let isOpen;

  // Prevent layout flick
  $: {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }
</script>

<div
  class={`w-full h-full fixed top-0 left-0 bg-[#000000cc] ${
    isOpen
      ? "opacity-100 transform translate-x-[0px]"
      : "opacity-0 transform translate-x-[100vw]"
  }`}
  style="z-index: 50;"
>
  <div
    class={`h-full fixed top-0 right-0 xl:w-[30%] w-[100%] flex flex-col gap-6 p-6 sidebar sidebar-container ${
      isOpen
        ? "opacity-100 transform translate-x-[0px]"
        : "opacity-0 transform translate-x-[100vw]"
    }`}
    id="sidebar-token-swap"
  >
    <slot />
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  .sidebar {
    z-index: 2147483649;
    backdrop-filter: blur(12px);

    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

    --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
      0 8px 10px -6px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
      var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  :global(body) .sidebar-container {
    background: #fff;
  }
  :global(body.dark) .sidebar-container {
    background: #0f0f0f;
  }

  #sidebar-token-swap {
    overflow-y: auto !important;
  }
</style>
