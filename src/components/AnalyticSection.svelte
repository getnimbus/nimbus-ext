<script lang="ts">
  import { isDarkMode, selectedPackage, typeWallet } from "~/store";

  export let address = "";
  export let isShowSoon = false;
</script>

<div class="flex flex-col gap-5">
  <slot name="title" />
  <div class="grid xl:grid-cols-6 grid-cols-1 gap-6 relative">
    <div
      class={`xl:col-span-2 col-span-1 rounded-[20px] ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
      }`}
    >
      <slot name="overview" />
    </div>
    <div
      class={`xl:col-span-4 col-span-1 rounded-[20px] ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
      }`}
    >
      <slot name="chart" />
    </div>

    {#if isShowSoon && address !== "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"}
      <div
        class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center gap-3 pt-62 z-8 backdrop-blur-md ${
          $isDarkMode ? "bg-black/90" : "bg-white/95"
        }`}
      >
        {#if $selectedPackage === "FREE"}
          <div class="flex flex-col items-center gap-1">
            <div class="text-lg font-medium">
              Use Nimbus at its full potential
            </div>
            <div class="text-base text-gray-500">
              Upgrade to Premium to access Analytics feature
            </div>
          </div>
        {/if}
        {#if $selectedPackage !== "FREE" && $typeWallet === "BTC"}
          <div class="text-lg">Coming soon 🚀</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style></style>
