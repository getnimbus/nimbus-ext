<script lang="ts">
  import { openScreenBonusScore, bonusScore } from "~/store";
  import goldImg from "~/assets/Gold4.svg";
</script>

<slot />

{#if $openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore.update((n) => (n = false));
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={goldImg} alt="" class="w-40 h-40 block" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {$bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}
