<script>
  import System from "svelte-system-info";
  import { getLocalImg } from "~/utils";
  export let skip = () => {};
  import Button from "~/components/Button.svelte";
  import SearchFeat from "../../assets/search_feat.svg";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-[85%] flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="flex flex-col items-center gap-2">
        <div class="text-4xl text-black font-normal">Search from any where</div>
        <div class="text-base text-[#00000099] font-normal">
          Click the arrow on left right edge or use shortcut
          <span
            class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
            >{System.OSName === "macOS" ? "⌘" : "Ctrl"}</span
          >
          +
          <span
            class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
            >Shift</span
          >
          +
          <span
            class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
            >K</span
          >

          to open the sidebar
        </div>
      </div>
      <img src={getLocalImg(SearchFeat)} alt="" />
    </div>
    <div class="flex items-center gap-3">
      <Button variant="secondary" on:click={skip}>Skip</Button>
      <Button className="next">Continue</Button>
    </div>
  </div>
</div>

<style>
</style>
