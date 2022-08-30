<svelte:options tag="trx-highlight" />

<script>
  import tooltip from "./tooltip";
  import "./TrxInfo.svelte";
  export let hash;
</script>

<span class="inline-flex items-center">
  <slot />
  <span
    use:tooltip={{
      interactive: true,
      delay: [300, null],
      trigger: "click",
      appendTo: () => document.body,
      // content: popperElement,
      content: `<trx-info hash="${hash}" />`,
      allowHTML: true,
      placement: "bottom-start",
      arrow: false,
      animation: "shift-away",
      maxWidth: "none",
    }}
    class="ml-[0.5em] inline-block whitespace-nowrap transition-all text-sky-400 rounded-[5px] py-[2px] px-1 max-w-[8em] cursor-pointer overflow-hidden bg-sky-100 hover:max-w-[7rem] select-none"
  >
    <!-- 🌩 -->
    ⚡️
    <!-- <svg
      xmlns="http://www.w3.org/2000/svg"
      class="text-sky-400 w-[1.2em] h-[1.2em] transform translate-y-[20%]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg> -->

    <span class="font-sans">More info</span>
  </span>
</span>

<style>
</style>
