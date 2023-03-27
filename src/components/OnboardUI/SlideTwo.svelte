<script>
  import { getLocalImg } from "~/utils";
  export let skip = () => {};
  import Button from "~/components/Button.svelte";
  import PinEx from "../../assets/pin_ex.svg";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-4/5 flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="flex flex-col items-center gap-2">
        <div class="text-3xl text-black font-normal">Pin the extension</div>
        <div class="text-sm text-black font-normal">
          Search for any tokens when you click on the extension icon
        </div>
      </div>
      <img src={getLocalImg(PinEx)} alt="" />
    </div>
    <div class="flex items-center gap-3">
      <Button variant="secondary" on:click={skip}>Skip</Button>
      <Button className="next">Continue</Button>
    </div>
  </div>
</div>

<style>
</style>
