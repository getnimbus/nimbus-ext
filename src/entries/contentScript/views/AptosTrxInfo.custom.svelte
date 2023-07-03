<svelte:options tag="aptos-trx-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { concurrent } from "svelte-typewriter";

  import ExplainIcon from "~/assets/explain.png";

  export let id;
  export let popup: boolean = true;

  let isLoading = false;
  let explain = "";

  const loadAptosTrxExplain = async () => {
    isLoading = true;
    try {
      const response: any = await sendMessage("AptosTrxExplain", {
        id,
      });
      if (response) {
        explain = response.data;
      }
      isLoading = false;
    } catch (e) {
      console.log(e);
      isLoading = false;
    }
  };

  onMount(() => {
    loadAptosTrxExplain();
  });
</script>

<reset-style>
  <div
    class={`bg-white font-sans text-sm text-gray-600 transition-all w-[600px] rounded-[20px] pt-6 px-6 pb-4 ${
      isLoading && popup && "max-h-[120px]"
    } ${popup ? "max-h-[680px]" : ""}`}
    class:shadow={popup}
  >
    <div class="flex items-start gap-2">
      <img src={ExplainIcon} alt="" width="18" height="18" class="spin" />
      {#if explain}
        <div
          use:concurrent={{ interval: 15 }}
          class="text-[#5E656B] font-normal -mt-4"
        >
          {explain}
        </div>
      {:else}
        <div class="text-[#5E656B] font-normal -mt-[2px]">Loading...</div>
      {/if}
    </div>
  </div>
</reset-style>

<style>
  .spin {
    animation-name: loading;
    animation-duration: 3.4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
  @keyframes loading {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
