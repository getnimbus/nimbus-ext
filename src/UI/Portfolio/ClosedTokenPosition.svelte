<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { chain, wallet, typeWallet, isDarkMode, pastProfit } from "~/store";
  import { filterTokenValueType } from "~/utils";
  import { listSupported } from "~/lib/chains";

  export let isLoadingToken;
  export let holdingTokenData;
  export let sumClosedTokenHolding;

  import ClosedHoldingTokenPosition from "~/UI/Portfolio/ClosedHoldingTokenPosition.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";
  import Select from "~/components/Select.svelte";

  let filteredHoldingDataToken = [];

  let tableClosedTokenHeader;
  let isStickyTableClosedToken = false;

  let filterTokenType = {
    label: "$1",
    value: 1,
  };

  const MultipleLang = {
    token_position: i18n("newtabPage.token_position", "Closed Positions"),
    token: i18n("newtabPage.token", "Tokens"),
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit & Loss"),
    total_spent: i18n("newtabPage.total_spent", "Total Spent"),
    collection: i18n("newtabPage.collection", "Collection"),
    floor_price: i18n("newtabPage.floor_price", "Floor Price"),
    current_value: i18n("newtabPage.current_value", "Current Value"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    hide_roi_token: i18n(
      "newtabPage.hide-token-has-roi-less-than-1",
      "Hide tokens has ROI less than $1"
    ),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader =
        tableClosedTokenHeader?.getBoundingClientRect();
      isStickyTableClosedToken = clientRectTokenHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: {
    if (filterTokenType) {
      if (filterTokenType.value === 0) {
        filteredHoldingDataToken = holdingTokenData;
      } else {
        filteredHoldingDataToken = holdingTokenData?.filter(
          (item) =>
            Math.abs(Number(item?.profit.realizedProfit)) >
            filterTokenType.value
        );
      }
    }
  }

  $: colspan = listSupported.includes($typeWallet) ? 5 : 4;

  $: {
    if ($wallet || $chain) {
      if ($wallet?.length !== 0 && $chain?.length !== 0) {
        filteredHoldingDataToken = [];
      }
    }
  }
</script>

<div
  class={`flex flex-col gap-4 rounded-[20px] p-6 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <ErrorBoundary>
    <div class="flex justify-between items-start">
      <div class="flex items-end gap-3">
        {#if $typeWallet !== "EVM" && $typeWallet !== "MOVE"}
          <div class="xl:text-2xl text-4xl font-medium">
            {MultipleLang.token_position}
          </div>
        {:else}
          <TooltipTitle
            tooltipText="Closed positions for BNB and AVAX might not accuracy, we're working to fix it"
            type="warning"
          >
            <div class="xl:text-2xl text-4xl font-medium">
              {MultipleLang.token_position}
            </div>
          </TooltipTitle>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <div
          class={`xl:text-3xl text-4xl font-medium text-right ${
            sumClosedTokenHolding !== 0
              ? sumClosedTokenHolding >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : $isDarkMode
                ? "text-white"
                : "text-black"
          }`}
        >
          <TooltipNumber
            number={Math.abs(sumClosedTokenHolding)}
            type="value"
            personalValue
          />
        </div>
        <div class="flex items-center justify-end gap-2">
          <div class="xl:text-sm text-2xl font-regular text-gray-400">
            Hide tokens has ROI less than
          </div>
          <Select
            type="filter"
            positionSelectList="right-0"
            listSelect={filterTokenValueType}
            bind:selected={filterTokenType}
          />
        </div>
      </div>
    </div>

    <div
      class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
        $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
      }`}
    >
      <table class="table-auto xl:w-full w-[1400px] h-full">
        <thead
          class={isStickyTableClosedToken ? "sticky top-0 z-10" : ""}
          bind:this={tableClosedTokenHeader}
        >
          <tr class="bg_f4f5f8">
            <th
              class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[420px]"
            >
              <div class="text-left xl:text-xs text-xl uppercase font-medium">
                {MultipleLang.assets}
              </div>
            </th>
            <th class="py-3">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                {MultipleLang.price}
              </div>
            </th>
            <th class="py-3">
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                Avg Cost
              </div>
            </th>
            <th
              class={`py-3 ${
                listSupported.includes($typeWallet)
                  ? ""
                  : "pr-3 rounded-tr-[10px]"
              }`}
            >
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                ROI
              </div>
            </th>
            {#if listSupported.includes($typeWallet)}
              <th class="py-3 xl:w-14 w-32 rounded-tr-[10px]" />
            {/if}
          </tr>
        </thead>

        {#if $chain === "ALL"}
          <tbody>
            {#if filteredHoldingDataToken && filteredHoldingDataToken.length === 0 && !isLoadingToken}
              <tr>
                <td {colspan}>
                  <div
                    class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                  >
                    {#if holdingTokenData && holdingTokenData.length === 0}
                      {MultipleLang.empty}
                    {:else}
                      All tokens less than $1
                    {/if}
                  </div>
                </td>
              </tr>
            {/if}
            {#each filteredHoldingDataToken as holding, index}
              <ClosedHoldingTokenPosition
                lastIndex={filteredHoldingDataToken.length - 1 === index}
                data={holding}
              />
            {/each}
          </tbody>
          {#if isLoadingToken}
            <tbody>
              <tr>
                <td {colspan}>
                  <div
                    class="flex justify-center items-center h-full py-3 px-3"
                  >
                    <Loading />
                  </div>
                </td>
              </tr>
            </tbody>
          {/if}
        {/if}

        {#if $chain !== "ALL"}
          {#if isLoadingToken}
            <tbody>
              <tr>
                <td {colspan}>
                  <div
                    class="flex justify-center items-center h-full py-3 px-3"
                  >
                    <Loading />
                  </div>
                </td>
              </tr>
            </tbody>
          {:else}
            <tbody>
              {#if filteredHoldingDataToken && filteredHoldingDataToken.length === 0}
                <tr>
                  <td {colspan}>
                    <div
                      class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                    >
                      {#if holdingTokenData && holdingTokenData.length === 0}
                        {MultipleLang.empty}
                      {:else}
                        All tokens less than $1
                      {/if}
                    </div>
                  </td>
                </tr>
              {:else}
                {#each filteredHoldingDataToken as holding, index}
                  <ClosedHoldingTokenPosition
                    lastIndex={filteredHoldingDataToken.length - 1 === index}
                    data={holding}
                  />
                {/each}
              {/if}
            </tbody>
          {/if}
        {/if}
      </table>
    </div>
  </ErrorBoundary>
</div>

<style>
</style>
