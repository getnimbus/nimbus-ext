<script lang="ts">
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { isDarkMode } from "~/store";
  import { protocolData } from "../hardCodeDefiData";
  import { onMount } from "svelte";
  import Image from "~/components/Image.svelte";
  import defaultToken from "~/assets/defaultToken.png";

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
      class={`flex flex-col gap-4 rounded-[20px] xl:p-6 py-4 px-3 ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
      }`}
    >
      <div
        class={`flex justify-between items-center p-4 rounded-[10px] font-medium  ${$isDarkMode ? "bg-gray-700" : "bg-blue-100"}`}
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
          class={`bg_f4f5f8 grid grid-cols-5 ${isStickyTableToken ? "sticky top-0 z-9" : ""}`}
          bind:this={tableTokenHeader}
        >
          <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
            <div class="text-left xl:text-xs text-xl uppercase font-medium">
              Invested
            </div>
          </div>

          <div class="py-3">
            <div class="xl:text-xs text-xl uppercase font-medium">
              Token
            </div>
          </div>

          <div class="py-3">
            <div class="xl:text-xs text-xl uppercase font-medium">
              Yield
            </div>
          </div>

          <div class="py-3">
            <div class="xl:text-xs text-xl uppercase font-medium">Reward</div>
          </div>

          <div class="py-3 pr-3 rounded-tr-[10px]">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              PnL
            </div>
          </div>
        </div>

        <div class={`grid grid-cols-5 group transition-all`}>
          <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
            <div
              class="text-left xl:text-xs text-xl uppercase font-medium flex items-center gap-2 m-auto h-full"
            >
              <div class="flex -space-x-2">
                {#each data.input as item, index}
                  <div class={`h-7 w-7 bg-white rounded-full z-[${index}]`}>
                    <Image defaultLogo={defaultToken} logo={item.token.logo} />
                  </div>
                {/each}
              </div>

              {data.input.map((item) => item.token.chain).join(" - ")}
            </div>
          </div>

          <div class={`grid grid-cols-5 group transition-all`}>
            <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
              <div
                class="text-left xl:text-xs text-xl uppercase font-medium flex items-center gap-2 m-auto h-full"
              >
                <div class="flex -space-x-2">
                  {#each data.input as item, index}
                    <div class={`h-7 w-7 bg-white rounded-full z-[${index}]`}>
                      <Image defaultLogo={defaultToken} logo={item.token.logo} />
                    </div>
                  {/each}
                </div>
  
                {data.input.map((item) => item.token.chain).join(" - ")}
              </div>
            </div>

          <div class="py-3">
            <!-- <div class="text-right xl:text-xs text-xl uppercase font-medium">
               <TooltipNumber number={item.token.price} type="value" /> 
            </div> -->
            <div
              class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4"
            >
              <div class="flex flex-col gap-2">
                {#each data.current.tokens as token}
                  <div class="flex items-center gap-1">
                    <div class="h-7 w-7 bg-white rounded-full">
                      <Image defaultLogo={defaultToken} logo={defaultToken} />
                    </div>
                    <TooltipNumber number={token.amount} type="amount" />
                    {token.token.chain}
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <div class="py-3">
            <div class="xl:text-xs text-xl uppercase font-medium">
              <!-- <TooltipNumber number={item.amount} type="amount" /> -->
            </div>
          </div>

          <div class="py-3 pr-3 rounded-tr-[10px]">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              <TooltipNumber number={0} type="value" />
            </div>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style windi:preflights:global windi:safelist:global></style>
