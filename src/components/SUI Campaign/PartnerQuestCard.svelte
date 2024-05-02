<script lang="ts">
  import flowXFinance from "~/assets/campaign/FLX-logo-black-square.png";
  import SUILogo from "~/assets/chains/sui.png";
  import gmPoint from "~/assets/Gold4.svg";
</script>

<div
  class="relative flex flex-col bg-white border rounded-[20px] w-[320px] p-8"
>
  <div
    class="absolute top-6 left-8 text-sm bg-green-300 text-green-600 rounded-xl px-2 py-1"
  >
    New
  </div>

  <div class="p-4">
    <img src={flowXFinance} alt="" class="object-contain w-[140px] m-auto" />
  </div>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-1">
      <img src={SUILogo} alt="" class="w-6 h-6 rounded-full" />
      <div class="font-medium text-lg">Flow Finance</div>
    </div>
    <div class="flex">
      <div
        class="flex items-center gap-2 font-medium bg-[#27326F] rounded-lg text-white py-1 px-4"
      >
        1000 <img src={gmPoint} alt="" class="w-4 h-4" />
      </div>
    </div>
    <div class="text_00000080">
      FlowX is the ultimate destination for all your trading needs, designed to
      provide a seamless, user-friendly experience for all.
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
