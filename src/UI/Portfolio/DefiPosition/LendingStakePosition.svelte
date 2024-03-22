<script lang="ts">
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { isDarkMode } from "~/store";
  import { protocolData } from "../hardCodeDefiData";
  import { onMount } from "svelte";

  export let selectedTypeProtocol: "lending" | "stake" = "lending";

  let isStickyTableToken = false;
  let tableTokenHeader;

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<div class="flex flex-col gap-4">
  {#each protocolData as data}
    <div
      class={`flex flex-col gap-6 rounded-[20px] xl:p-6 py-4 px-3 ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
      }`}
    >
      <div
        class="flex justify-between items-center p-4 rounded-[10px] font-medium bg-blue-100"
      >
        <div>
          {data.meta.protocol.name}
        </div>
      </div>
      <!-- talbe  -->
      <div
        class={`rounded-[10px] overflow-hidden w-full ${
          $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
        }`}
      >
        <div
          class={`bg_f4f5f8 grid grid-cols-6 ${isStickyTableToken ? "sticky top-0 z-9" : ""}`}
          bind:this={tableTokenHeader}
        >
          <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
            <div class="text-left xl:text-xs text-xl uppercase font-medium">
              Invested
            </div>
          </div>

          <div class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Current value
            </div>
          </div>

          <div class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Reward
            </div>
          </div>

          <div class="py-3 pr-3 rounded-tr-[10px]">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              PnL
            </div>
          </div>
        </div>

        {#each data.input as item}
          <div class={`grid grid-cols-6 group transition-all`}>
            <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
              <div class="text-left xl:text-xs text-xl uppercase font-medium">
                {item.token.chain}
              </div>
            </div>

            <div class="py-3">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                <TooltipNumber number={item.token.price} type="value" />
              </div>
            </div>

            <div class="py-3">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                <TooltipNumber number={item.amount} type="amount" />
              </div>
            </div>

            <div class="py-3">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                $<TooltipNumber
                  number={item.amount * item.token.price}
                  type="value"
                />
              </div>
            </div>

            <div class="py-3 pr-3 rounded-tr-[10px]">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                <TooltipNumber number={0} type="value" />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style windi:preflights:global windi:safelist:global></style>
