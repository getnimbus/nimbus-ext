<script lang="ts">
  import { onMount } from "svelte";
  import VirtualList from "svelte-tiny-virtual-list";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Image from "~/components/Image.svelte";
  import Tooltip from "~/components/Tooltip.svelte";
  import { detectedChain, listSupported } from "~/lib/chains";
  import { isDarkMode, typeWallet } from "~/store";
  import { typeDefiPosition } from "~/utils";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { protocolData } from "./hardCodeDefiData";
  import LendingStakePosition from "./DefiPosition/LendingStakePosition.svelte";

  let selectedTypeProtocol:
    | "amm"
    | "clmm"
    | "lending"
    | "borrow"
    | "stake"
    | "vest"
    | "farm" = "lending";
</script>

<div class="flex flex-col gap-4">
  <ErrorBoundary>
    <div class="flex flex-row">
      <AnimateSharedLayout>
        {#each typeDefiPosition as type}
          <div
            class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
            on:click={() => (selectedTypeProtocol = type.value)}
          >
            <div
              class={`relative z-1 ${
                selectedTypeProtocol === type.value && "text-white"
              }`}
            >
              {type.label}
            </div>
            {#if type.value === selectedTypeProtocol}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class="absolute inset-0 rounded-full bg-[#1E96FC] z-0"
                  use:motion
                />
              </Motion>
            {/if}
          </div>
        {/each}
      </AnimateSharedLayout>
    </div>

    {#if selectedTypeProtocol === "lending" || selectedTypeProtocol === "stake"}
      <LendingStakePosition {selectedTypeProtocol} />
    {/if}
  </ErrorBoundary>
</div>

<style windi:preflights:global windi:safelist:global></style>
