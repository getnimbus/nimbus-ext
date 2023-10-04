<svelte:options tag="tooltip-detail" />

<script>
  import { isDarkMode } from "~/store";

  export let text = "";
  export let link = "";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });
</script>

<div
  class={`text-white font-normal text-left normal-case text-xs py-1 px-2 rounded-lg w-max xl:max-w-md max-w-screen-sm border-[0.5px] border-[#cdcdcd59] ${
    darkMode ? "bg-[#0f0f0f]" : "bg-black"
  }`}
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
</div>

<style>
</style>
