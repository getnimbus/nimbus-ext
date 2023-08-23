<script>
  import { getLocalImg } from "~/utils";
  import Button from "~/components/Button.svelte";
  export let skip = () => {};
  import TrxAddressDetailFeat from "~/assets/GIFDetect.gif";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-[90%] flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-6">
      <div class="flex flex-col items-center gap-6">
        <div class="text-5xl font-normal">
          Know what inside an address or a transaction
        </div>
        <div class="text-lg text_00000099 font-normal">
          Just click on that popup, we deliver understandable info right away
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <img
          src={getLocalImg(TrxAddressDetailFeat)}
          alt=""
          width="500"
          height="200"
        />
        <!-- <div class="flex items-center gap-3">
          <div class="text-[#F37021] font-normal">
            0x1236d48f04823E0792dB0607A9Ca678224FE6766
          </div>
          <div
            class="rounded-[1000px] py-1 px-2 bg-[#1E96FC4D] select-none flex items-center gap-1"
          >
            <div class="text_27326F text-xs font-medium">More info</div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 5.13635L6 9.49999L10 5.13635"
                stroke="#27326F"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div> -->
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="w-[140px]">
        <Button variant="secondary" on:click={skip}>Skip</Button>
      </div>
      <div class="w-[140px]">
        <Button className="next">Continue</Button>
      </div>
    </div>
  </div>
</div>

<style>
</style>
