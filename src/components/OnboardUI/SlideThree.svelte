<script>
  import System from "svelte-system-info";
  import { getLocalImg } from "~/utils";
  export let skip = () => {};
  import Button from "~/components/Button.svelte";
  import SearchFeat from "~/assets/GIFSidebar.gif";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-[90%] flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-6">
        <div class="text-5xl text-black font-normal">Search from any where</div>
        <div class="text-lg text-[#00000099] font-normal">
          Click the arrow on left right edge or use shortcut
          <span
            class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
          >
            {System.OSName === "macOS" ? "⌘" : "Ctrl"}
          </span>
          +
          <span
            class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
          >
            Shift
          </span>
          +
          <span
            class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
          >
            K
          </span>
          to open the sidebar
        </div>
      </div>
      <img src={getLocalImg(SearchFeat)} alt="" width="500" height="200" />
    </div>
    <div class="flex items-center gap-3">
      <Button variant="secondary" on:click={skip}>Skip</Button>
      <Button className="next">Continue</Button>
    </div>
  </div>
</div>

<style>
</style>
