<script lang="ts">
  import { wait } from "~/entries/background/utils";
  import { triggerFirework } from "~/utils";

  import goldImg from "~/assets/Gold4.svg";

  let openScreenBonusScore = false;
  let bonusScore = 0;

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };
</script>

<div
  class="flex items-center gap-2 text-white bg-[#4BA2FF] py-1 px-2 rounded-[10px] cursor-pointer"
>
  Connect SUI
  <div
    class="flex items-center gap-1 text-sm font-medium bg-[#27326F] py-1 px-2 text-white rounded-[10px]"
  >
    1,000
    <img src={goldImg} alt="" class="w-6 h-6" />
  </div>
</div>

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
