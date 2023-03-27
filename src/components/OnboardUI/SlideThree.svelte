<script>
  import { getLocalImg } from "~/utils";
  export let skip = () => {};
  import Button from "~/components/Button.svelte";
  import SearchFeat from "../../assets/search_feat.svg";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-[90%] flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="flex flex-col items-center gap-2">
        <div class="text-3xl text-black font-normal">Search from any where</div>
        <div class="text-sm text-black font-normal">
          Click the arrow on the right edge or use shortcut Cmd + Shift + K to
          open the sidebar
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
