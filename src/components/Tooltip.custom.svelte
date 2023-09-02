<svelte:options tag="tooltip-detail" />

<script>
  export let text = "";
  export let link = "";
</script>

<div
  class="text-white font-normal bg-black py-1 px-2 text-xs rounded relative max-w-96 w-max normal-case border-[0.5px] border-[#cdcdcd59]"
  style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
>
  {#if link.length !== 0}
    {text}
    <a
      href={link}
      target="_blank"
      class="hover:text-blue-500 cursor-pointer text-white"
    >
      Learn more
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
