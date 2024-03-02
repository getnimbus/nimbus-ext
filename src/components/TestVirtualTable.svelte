<script>
  import { onMount } from "svelte";
  import { isDarkMode, typeWallet, chain, totalAssets } from "~/store";
  import { i18n } from "~/lib/i18n";
  import { listSupported } from "~/lib/chains";
  import VirtualList from "svelte-tiny-virtual-list";

  import Loading from "./Loading.svelte";
  import HoldingToken from "~/UI/Portfolio/HoldingToken.svelte";

  export let sumNFT;
  export let defaultData;
  export let data;
  export let isLoading;
  export let triggerFireworkBonus = (data) => {};

  const MultipleLang = {
    holding: i18n("newtabPage.holding", "Holding"),
    token: i18n("newtabPage.token", "Tokens"),
    nft: i18n("newtabPage.nft", "NFTs"),
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
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let tableTokenHeader;
  let isStickyTableToken = false;

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

  $: colspan = listSupported.includes($typeWallet) ? 8 : 7;
</script>

<!-- <div
  class={`rounded-[10px] xl:overflow-visible overflow-x-auto ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
  }`}
>
  <table class="table-auto xl:w-full w-[2000px] h-full">
    <thead
      class={isStickyTableToken ? "sticky top-0 z-10" : ""}
      bind:this={tableTokenHeader}
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
            {MultipleLang.amount}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            {MultipleLang.value}
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            Avg Cost
          </div>
        </th>
        <th class="py-3">
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            Realized PnL
          </div>
        </th>
        <th
          class={`py-3 xl:pr-3 pr-6 ${
            listSupported.includes($typeWallet) ? "" : "rounded-tr-[10px]"
          }`}
        >
          <div class="text-right xl:text-xs text-xl uppercase font-medium">
            Unrealized PnL
          </div>
        </th>
        {#if listSupported.includes($typeWallet)}
          <th
            class={`py-3 pr-3 rounded-tr-[10px] ${
              ["BUNDLE", "SOL"].includes($typeWallet)
                ? "xl:max-w-20 w-16"
                : "xl:w-12 w-32"
            }`}
          />
        {/if}
      </tr>
    </thead>

    {#if $chain === "ALL"}
      <tbody>
        {#if data && data.length === 0 && !isLoading}
          <tr>
            <td {colspan}>
              <div
                class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
              >
                {#if defaultData && defaultData.length === 0}
                  {MultipleLang.empty}
                {:else}
                  All tokens less than $1
                {/if}
              </div>
            </td>
          </tr>
        {/if}
        {#each data as holding, index}
          <HoldingToken
            data={holding}
            lastIndex={data.length - 1 === index}
            sumAllTokens={$totalAssets - sumNFT}
            index={index + 1}
            {triggerFireworkBonus}
          />
        {/each}
      </tbody>
      {#if isLoading}
        <tbody>
          <tr>
            <td {colspan}>
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {/if}
    {/if}

    {#if $chain !== "ALL"}
      {#if isLoading}
        <tbody>
          <tr>
            <td {colspan}>
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if data && data.length === 0}
            <tr>
              <td {colspan}>
                <div
                  class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                >
                  {#if defaultData && defaultData.length === 0}
                    {MultipleLang.empty}
                  {:else}
                    All tokens less than $1
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            {#each data as holding, index (holding.positionId)}
              <HoldingToken
                data={holding}
                lastIndex={data.length - 1 == index}
                sumAllTokens={$totalAssets - sumNFT}
                index={index + 1}
                {triggerFireworkBonus}
              />
            {/each}
          {/if}
        </tbody>
      {/if}
    {/if}
  </table>
</div> -->

<VirtualList width="100%" height={960} itemCount={data.length} itemSize={50}>
  <div slot="item" let:index let:style {style}>
    #{index}: {data[index].symbol}
  </div>
</VirtualList>

<style>
</style>
