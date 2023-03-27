<script>
  import { getLocalImg } from "~/utils";
  import Button from "~/components/Button.svelte";
  export let skip = () => {};
  import PerformanceOneFeat from "../../assets/performance_one_feat.svg";
  import PerformanceTwoFeat from "../../assets/performance_two_feat.svg";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-[90%] flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="flex flex-col items-center gap-2">
        <div class="text-3xl text-black font-normal">Add your address</div>
        <div class="text-sm text-black font-normal">
          So you can easily track Profit and Loss for every move
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <div class="relative">
          <img src={getLocalImg(PerformanceOneFeat)} alt="" />
          <div class="absolute bottom-10 -left-18">
            <img src={getLocalImg(PerformanceTwoFeat)} alt="" />
          </div>
        </div>
        <div class="bg-white rounded-xl p-3 border relative">
          <div
            class="absolute top-0 right-3 text-4xl text-gray-500 cursor-pointer"
          >
            &times;
          </div>
          <div class="title-3 text-gray-600 font-semibold">Add your wallet</div>
          <form class="flex flex-col gap-3 mt-4">
            <div class="flex flex-col gap-1">
              <div class="flex flex-col gap-1">
                <div
                  class="flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3"
                >
                  <div class="text-xs text-[#666666] font-medium">Address</div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Address"
                    class="p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B]"
                  />
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex flex-col gap-1">
                <div
                  class="flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3"
                >
                  <div class="text-xs text-[#666666] font-medium">Label</div>
                  <input
                    type="text"
                    id="label"
                    name="label"
                    placeholder="Label"
                    value=""
                    class="p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B]"
                  />
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="secondary" width={70}>Cancel</Button>
              <Button width={70}>Add</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="secondary" on:click={skip}>Skip</Button>
      <Button className="next">Continue</Button>
    </div>
  </div>
</div>

<style>
  .test {
    border: 1px solid red;
  }
</style>
