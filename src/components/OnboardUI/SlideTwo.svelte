<script>
  import { getLocalImg } from "~/utils";
  export let skip = () => {};
  import Button from "~/components/Button.svelte";
  import PinEx from "~/assets/GIFPin.gif";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-[90%] flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-6">
        <div class="text-5xl text-black font-normal">Pin the extension</div>
        <div class="text-lg text-[#00000099] font-normal">
          Search for any tokens when you click on the extension icon
        </div>
      </div>
      <img src={getLocalImg(PinEx)} alt="" width="280" height="280" />
    </div>
    <div class="flex items-center gap-3">
      <Button variant="secondary" on:click={skip}>Skip</Button>
      <Button className="next">Continue</Button>
    </div>
  </div>
</div>

<style>
</style>
