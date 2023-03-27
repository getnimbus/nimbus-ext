<script>
  import { getLocalImg } from "~/utils";
  import Button from "~/components/Button.svelte";
  export let skip = () => {};
  import PerformanceOneFeat from "../../assets/performance_one_feat.svg";
  import PerformanceTwoFeat from "../../assets/performance_two_feat.svg";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-4/5 flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="flex flex-col items-center gap-2">
        <div class="text-3xl text-black font-normal">Add your address</div>
        <div class="text-sm text-black font-normal">
          So you can easily track Profit and Loss for every move
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="relative">
          <img src={getLocalImg(PerformanceOneFeat)} alt="" />
          <div class="absolute bottom-10 -left-18">
            <img src={getLocalImg(PerformanceTwoFeat)} alt="" />
          </div>
        </div>
        <div>form add address</div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="secondary" on:click={skip}>Skip</Button>
      <Button className="next">Continue</Button>
    </div>
  </div>
</div>

<style>
</style>
