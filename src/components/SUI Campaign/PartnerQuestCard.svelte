<script lang="ts">
  import { isDarkMode } from "~/store";

  import flowXFinance from "~/assets/campaign/FLX-logo-black-square.png";
  import SUILogo from "~/assets/chains/sui.png";
  import gmPoint from "~/assets/Gold4.svg";

  export let data;
  export let handleUpdatePartnerQuestsId = (id) => {};
</script>

<div
  class={`relative flex flex-col border border_0000000d rounded-[10px] xl:w-[320px] lg:w-[290px] md:w-[330px] w-full py-8 px-6 transition-all hover:shadow-md cursor-pointer ${$isDarkMode ? "bg-[#000] hover:shadow-gray-600" : "bg-[#fff] hover:shadow-gray-400"}`}
  on:click={() => {
    handleUpdatePartnerQuestsId(data);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + `?tab=quests&id=${data}`
    );
  }}
>
  <div
    class="absolute top-6 left-6 text-sm bg-[#CBFDE1] text-[#49A37B] rounded-[30px] px-2 py-1"
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
        class="flex items-center gap-2 font-medium bg-[#27326F] rounded-[10px] text-white py-1 px-4"
      >
        1,000 <img src={gmPoint} alt="" class="w-4 h-4" />
      </div>
    </div>
    <div class="text-[#7A7A7A]">
      FlowX is the ultimate destination for all your trading needs, designed to
      provide a seamless, user-friendly experience for all.
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
