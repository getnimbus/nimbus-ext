<script>
  import { getLocalImg } from "~/utils";
  import Button from "~/components/Button.svelte";
  export let skip = () => {};
  import TrxAddressDetailFeat from "../../assets/trx_address_detail_feat.svg";
</script>

<div class="h-[95vh] flex justify-center items-center">
  <div class="h-4/5 flex flex-col justify-between items-center">
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="flex flex-col items-center gap-2">
        <div class="text-3xl text-black font-normal">
          Know what inside an address or a transaction
        </div>
        <div class="text-sm text-black font-normal">
          Just click on that popup, we deliver understandable info right away
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <img src={getLocalImg(TrxAddressDetailFeat)} alt="" />
        <div class="flex items-center gap-3">
          <div class="text-[#F37021] font-normal">
            0x1236d48f04823E0792dB0607A9Ca678224FE6766
          </div>
          <div>More info</div>
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
</style>
