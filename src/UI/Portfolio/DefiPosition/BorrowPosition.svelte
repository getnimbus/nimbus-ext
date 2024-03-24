<script lang="ts">
  import { isDarkMode } from "~/store";

  import Image from "~/components/Image.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import type { Borrow } from "./hardCodeDefiData";

  import defaultToken from "~/assets/defaultToken.png";
  import { onMount } from "svelte";

  export let data: Borrow;

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

<div
  class={`flex flex-col gap-4 rounded-[20px] xl:p-6 py-4 px-3 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="flex justify-between items-center">
    <div>
      {data?.meta?.protocol?.name || ""}
    </div>
    <div></div>
  </div>

  <div
    class={`rounded-[10px] overflow-hidden w-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <div class="bg_f4f5f8 grid grid-cols-6">
      <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
        <div class="text-left xl:text-xs text-xl uppercase font-medium">
          Invested
        </div>
      </div>

      <div class="py-3">
        <div class="xl:text-xs text-xl uppercase font-medium">Token</div>
      </div>

      <div class="py-3">
        <div class="xl:text-xs text-xl uppercase font-medium">Yield</div>
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

    <div class={`grid grid-cols-6 group transition-all`}>
      <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
        <div class="flex flex-col gap-2 m-auto h-full">
          {#each data.input as item1}
            <div class="flex flex-col gap-2">
              {#each item1?.input || [] as item}
                <div class="flex items-center gap-3">
                  <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                    <Image
                      defaultLogo={defaultToken}
                      logo={item?.token?.logo || defaultToken}
                    />
                  </div>
                  <div
                    class="text-left xl:text-xs text-xl uppercase font-medium"
                  >
                    {item?.token?.chain || ""}
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>

      <div class="py-3">
        <div
          class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each data.current.tokens as token}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image
                    defaultLogo={defaultToken}
                    logo={token?.token?.logo || defaultToken}
                  />
                </div>
                <TooltipNumber number={token?.amount || 0} type="amount" />
                {token?.token?.chain || ""}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="py-3">
        <div
          class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each data?.current?.yield || [] as yieldData}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image
                    defaultLogo={defaultToken}
                    logo={yieldData?.token?.logo || defaultToken}
                  />
                </div>
                <TooltipNumber number={yieldData?.amount || 0} type="amount" />
                {yieldData?.token?.chain || ""}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="py-3">
        <div
          class="text-left xl:text-xs text-xl uppercase font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each data?.yieldCollected || [] as reward}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                  <Image
                    defaultLogo={defaultToken}
                    logo={reward?.token?.logo || defaultToken}
                  />
                </div>
                <TooltipNumber number={reward?.amount || 0} type="amount" />
                {reward?.token?.chain || ""}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="py-3 pr-3 rounded-tr-[10px]">
        <div
          class="text-right xl:text-xs text-xl uppercase font-medium flex justify-end h-full"
        >
          <div class="my-auto">
            <TooltipNumber number={0} type="value" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
