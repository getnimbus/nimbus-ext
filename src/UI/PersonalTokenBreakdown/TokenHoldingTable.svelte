<script lang="ts">
  import { onMount } from "svelte";
  import { detectedChain, shorterName } from "~/utils";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode, typeWallet } from "~/store";
  import { Progressbar } from "flowbite-svelte";

  import "~/components/Tooltip.custom.svelte";
  import "~/components/Loading.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";

  export let toggleSortOrderTag = () => {};
  export let isLoadingToken;
  export let searchDataResult;
  export let selectedWallet;
  export let sumTokens;

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let tableTokenHeader;
  let isStickyTableToken = false;
  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let selectedHover = "";

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
  class={`rounded-[10px] xl:overflow-visible overflow-x-auto min-h-[600px] ${
    darkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <table class="table-auto xl:w-full w-[1400px]">
    <thead
      class={isStickyTableToken ? "sticky top-0 z-10" : ""}
      bind:this={tableTokenHeader}
    >
      <tr class="bg_f4f5f8">
        <th
          class="rounded-tl-[10px] py-3 pl-3 xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 xl:w-[230px] w-[280px]"
        >
          <div class="text-left xl:text-xs text-base uppercase font-semibold">
            {MultipleLang.assets}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-base uppercase font-semibold">
            {MultipleLang.price}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-base uppercase font-semibold">
            {MultipleLang.amount}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-base uppercase font-semibold">
            {MultipleLang.value}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-base uppercase font-semibold">
            <TooltipTitle tooltipText="Ratio based on total token holding">
              Ratio
            </TooltipTitle>
          </div>
        </th>
        <th class="rounded-tr-[10px] py-3 pr-3">
          <div
            class="text-right xl:text-xs text-base uppercase font-semibold flex items-center justify-end gap-2"
          >
            Tag
            <div on:click={toggleSortOrderTag} class="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1.2em"
                viewBox="0 0 320 512"
                fill={darkMode ? "#fff" : "#000"}
                ><path
                  d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                /></svg
              >
            </div>
          </div>
        </th>
      </tr>
    </thead>
    {#if isLoadingToken}
      <tbody>
        <tr>
          <td colspan={6}>
            <div class="flex justify-center items-center py-3 px-3">
              <loading-icon />
            </div>
          </td>
        </tr>
      </tbody>
    {:else}
      <tbody>
        {#if searchDataResult && searchDataResult.length === 0}
          <tr>
            <td colspan={6}>
              <div
                class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
              >
                {MultipleLang.empty}
              </div>
            </td>
          </tr>
        {:else}
          {#each searchDataResult as data}
            <tr class="group transition-all">
              <td
                class={`py-3 pl-3 xl:static xl:bg-transparent sticky left-0 z-9 xl:w-[230px] w-[280px] ${
                  darkMode
                    ? "bg-[#131313] group-hover:bg-[#000]"
                    : "bg-white group-hover:bg-gray-100"
                }`}
              >
                <div class="text-left flex items-center gap-3">
                  <div class="relative">
                    <img
                      src={data.logo}
                      alt=""
                      width="30"
                      height="30"
                      class="rounded-full"
                    />
                    {#if typeWalletAddress !== "BTC"}
                      <div class="absolute -top-2 -right-1">
                        <img
                          src={detectedChain(data.chain)}
                          alt=""
                          width="15"
                          height="15"
                          class="rounded-full"
                        />
                      </div>
                    {/if}
                  </div>
                  <div class="flex flex-col gap-1">
                    <div
                      class=" xl:text-sm text-xl font-medium relative"
                      on:mouseover={() => {
                        if (data?.name?.length > 20) {
                          selectedHover = data.name;
                          isShowTooltipName = true;
                        }
                      }}
                      on:mouseleave={() => {
                        if (data?.name?.length > 20) {
                          selectedHover = "";
                          isShowTooltipName = false;
                        }
                      }}
                    >
                      {#if data.name === undefined}
                        N/A
                      {:else}
                        {data?.name?.length > 20
                          ? shorterName(data.name, 20)
                          : data.name}
                      {/if}
                      {#if isShowTooltipName && selectedHover === data?.name && data?.name?.length > 20}
                        <div
                          class="absolute -top-8 left-0"
                          style="z-index: 2147483648;"
                        >
                          <tooltip-detail text={data.name} />
                        </div>
                      {/if}
                    </div>
                    <div
                      class="text_00000080 text-xs font-medium relative"
                      on:mouseover={() => {
                        if (data?.symbol?.length > 20) {
                          selectedHover = data.symbol;
                          isShowTooltipSymbol = true;
                        }
                      }}
                      on:mouseleave={() => {
                        if (data?.symbol?.length > 20) {
                          selectedHover = "";
                          isShowTooltipSymbol = false;
                        }
                      }}
                    >
                      {#if data.symbol === undefined}
                        N/A
                      {:else}
                        {shorterName(data.symbol, 20)}
                      {/if}
                      {#if isShowTooltipSymbol && selectedHover === data?.symbol && data?.symbol?.length > 20}
                        <div
                          class="absolute -top-8 left-0"
                          style="z-index: 2147483648;"
                        >
                          <tooltip-detail text={data.symbol} />
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </td>

              <td
                class={`py-3 ${
                  darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="xl:text-sm text-xl text_00000099 font-medium flex justify-end"
                >
                  $<TooltipNumber number={data.market_price} type="balance" />
                </div>
              </td>

              <td
                class={`py-3 ${
                  darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="xl:text-sm text-xl text_00000099 font-medium flex justify-end"
                >
                  <TooltipNumber number={data.amount} type="balance" />
                </div>
              </td>

              <td
                class={`py-3 ${
                  darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="xl:text-sm text-xl text_00000099 font-medium flex justify-end"
                >
                  <TooltipNumber
                    number={data?.amount * data?.market_price}
                    type="value"
                  />
                </div>
              </td>

              <td
                class={`py-3 ${
                  darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
                }`}
              >
                <div class="flex flex-col gap-1 justify-end items-end">
                  <div
                    class="xl:text-sm text-xl text_00000099 font-medium flex justify-end"
                  >
                    <TooltipNumber
                      number={((data?.amount * data?.market_price) /
                        sumTokens) *
                        100}
                      type="percent"
                    />%
                  </div>
                  <div class="w-3/4 max-w-40">
                    <Progressbar
                      progress={Number(
                        ((data?.amount * data?.market_price) / sumTokens) * 100
                      )}
                      size="h-1"
                    />
                  </div>
                </div>
              </td>

              <td
                class={`py-3 pr-3 ${
                  darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
                }`}
              >
                <div class="flex justify-end">
                  <div
                    class="bg-[#6AC7F533] text_27326F xl:text-sm text-xl w-max px-3 py-1 rounded-[5px]"
                  >
                    {data.tag}
                  </div>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    {/if}
  </table>
</div>

<style global windi:preflights:global windi:safelist:global></style>
