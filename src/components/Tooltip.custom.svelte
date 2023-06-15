<svelte:options tag="tooltip-detail" />

<script>
  export let text;
  export let link = "";

  $: console.log({
    link,
    text,
  });
</script>

<div
  class="text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
>
  {#if link.length !== 0}
    <a
      href={link}
      target="_blank"
      class="hover:text-blue-500 cursor-pointer text-white"
    >
      {text}
    </a>
  {:else}
    {text}
  {/if}
  <!-- <div class="tooltip-arrow" /> -->
</div>

<!-- <style>
  .tooltip-arrow {
    position: absolute;
    left: 60%;
    top: -4px;
    height: 8px;
    width: 8px;
    background: transparent;
  }

  .tooltip-arrow::before {
    content: "";
    transform: rotate(45deg);
    background: black;
    height: 8px;
    width: 8px;
    position: absolute;
  }
</style> -->
