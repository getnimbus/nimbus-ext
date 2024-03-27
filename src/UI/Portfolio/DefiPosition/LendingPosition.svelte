<script lang="ts">
  import { isDarkMode } from "~/store";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Image from "~/components/Image.svelte";
  import type { Lending } from "./hardCodeDefiData";

  import defaultToken from "~/assets/defaultToken.png";

  export let data;

  const handleCalculatePnl = (data: any) => {
    if (data?.yieldCollected?.length === 0 || !data?.yieldCollected) {
      return 0;
    }

    const totalInputValue = data?.input?.reduce(
      (prev, item) => prev + Number(item.value),
      0
    );

    const totalYieldCollected = data?.yieldCollected?.reduce(
      (prev, item) => prev + Number(item.value),
      0
    );

    return totalInputValue === 0
      ? 0
      : totalYieldCollected / Math.abs(totalInputValue);
  };
</script>

<div
  class={`rounded-[10px] overflow-hidden w-full ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <div class="bg_f4f5f8 grid grid-cols-6">
    <div class="col-spans-2 pl-3 py-3 rounded-tl-[10px]">
      <div class="text-left text-xs uppercase font-medium">Invested</div>
    </div>

    <div class="py-3">
      <div class="text-xs uppercase font-medium">Token</div>
    </div>

    <div class="py-3">
      <div class="text-xs uppercase font-medium">Yield</div>
    </div>

    <div class="py-3">
      <div class="text-xs uppercase font-medium">Reward</div>
    </div>

    <div class="py-3 pr-3 rounded-tr-[10px]">
      <div class="text-right text-xs uppercase font-medium">PnL</div>
    </div>
  </div>

  {#each data as itemRow}
    <div class="grid grid-cols-6 group transition-all">
      <div
        class={`col-spans-2 pl-3 py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div class="flex items-center gap-2 m-auto h-full">
          <div class="flex flex-col gap-2">
            {#each itemRow?.input || [] as item}
              <div class="flex items-center gap-3">
                <div class="rounded-full w-6 h-6 overflow-hidden">
                  <Image
                    defaultLogo={defaultToken}
                    logo={item?.token?.logo || defaultToken}
                  />
                </div>
                <div class="text-left text-sm font-medium">
                  {item?.token?.name || ""}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div
        class={`py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-left text-sm text_00000099 font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each itemRow?.current?.tokens || [] as token}
              <div class="flex items-center gap-1">
                <div class="rounded-full w-6 h-6 overflow-hidden">
                  <Image
                    defaultLogo={defaultToken}
                    logo={token?.token?.logo || defaultToken}
                  />
                </div>
                <TooltipNumber number={token?.amount || 0} type="amount" />
                {token?.token?.symbol || ""}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div
        class={`py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-left text-sm text_00000099 font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each itemRow?.current?.yield || [] as yieldData}
              {#if yieldData?.amount !== 0}
                <div class="flex items-center gap-1">
                  <div class="rounded-full w-6 h-6 overflow-hidden">
                    <Image
                      defaultLogo={defaultToken}
                      logo={yieldData?.token?.logo || defaultToken}
                    />
                  </div>
                  <TooltipNumber
                    number={yieldData?.amount || 0}
                    type="amount"
                  />
                  {yieldData?.token?.symbol || ""}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <div
        class={`py-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-left text-sm text_00000099 font-medium gap-2 flex items-center gap-4 h-full"
        >
          <div class="flex flex-col gap-2">
            {#each itemRow?.yieldCollected || [] as reward}
              {#if reward?.amount !== 0}
                <div class="flex items-center gap-1">
                  <div class="rounded-full w-6 h-6 overflow-hidden">
                    <Image
                      defaultLogo={defaultToken}
                      logo={reward?.token?.logo || defaultToken}
                    />
                  </div>

                  <TooltipNumber number={reward?.amount} type="amount" />
                  {reward?.token?.symbol || ""}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <div
        class={`py-3 pr-3 ${
          $isDarkMode
            ? "bg-[#131313] group-hover:bg-[#000]"
            : "bg-white group-hover:bg-gray-100"
        }`}
      >
        <div
          class="text-right text-sm text_00000099 font-medium flex justify-end h-full"
        >
          <div class="my-auto">
            <TooltipNumber number={handleCalculatePnl(itemRow)} type="value" />
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style windi:preflights:global windi:safelist:global></style>
