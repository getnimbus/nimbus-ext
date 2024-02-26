<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { typeWallet, isDarkMode } from "~/store";
  import { chainList, linkExplorer, listSupported } from "~/lib/chains";

  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";

  import mobulaLogo from "~/assets/mobula-logo.png";
  import defaultToken from "~/assets/defaultToken.png";

  export let data;
  export let isLoading;
  export let pageToken;
  export let loadMore = (pageToken) => {};

  const formatTransactionTime = (date: Date) => {
    if (dayjs().diff(date, "days") >= 1) {
      return dayjs(date).format("YYYY-MM-DD, hh:mm A");
    }
    return dayjs(date).fromNow();
  };

  $: console.log("HELLO: ", data);
</script>

<div
  class={`rounded-[10px] border border_0000000d xl:overflow-hidden overflow-x-auto ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
  } ${
    (isLoading && pageToken?.length === 0) || (data && data?.length === 0)
      ? "h-screen"
      : ""
  }`}
>
  <table class="table-auto xl:w-full w-[1400px] h-full">
    <thead>
      <tr class="bg_f4f5f8">
        <th
          class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky top-0 left-0 z-9 bg_f4f5f8"
        >
          <div class="text-xl font-medium text-left uppercase xl:text-xs">
            Transaction
          </div>
        </th>
        <th class="py-3">
          <div class="text-xl font-medium text-left uppercase xl:text-xs">
            From
          </div>
        </th>
        <th class="py-3">
          <div class="text-xl font-medium text-left uppercase xl:text-xs">
            To
          </div>
        </th>
        <th class="py-3">
          <div
            class="text-left xl:text-xs text-xl uppercase font-medium min-w-[100px]"
          >
            Type
          </div>
        </th>
        <th class="pr-3 py-3 rounded-tr-[10px]">
          <div class="text-xl font-medium text-left uppercase xl:text-xs">
            Token change
          </div>
        </th>
      </tr>
    </thead>
    <tbody class="h-full">
      {#if isLoading && pageToken?.length === 0}
        <tr>
          <td colspan={5}>
            <div class="flex items-center justify-center h-full px-3 py-4">
              <Loading />
            </div>
          </td>
        </tr>
      {:else if data && data?.length === 0}
        <tr>
          <td colspan={5}>
            <div
              class="flex items-center justify-center h-full px-3 py-4 text-lg text-gray-400"
            >
              Empty
            </div>
          </td>
        </tr>
      {:else}
        {#each data || [] as item}
          <tr
            class="group transition-all border-b-[0.5px] border_0000000d last:border-none"
          >
            <td
              class={`pl-3 py-4 xl:static xl:bg-transparent sticky left-0 z-9 ${
                $isDarkMode
                  ? "bg-[#131313] group-hover:bg-[#000]"
                  : "bg-white group-hover:bg-gray-100"
              }`}
            >
              <div class="flex items-start gap-2 text-left w-max">
                <div class="flex flex-col space-y-2">
                  <div class="text-2xl xl:text-sm flex gap-2">
                    {#if $typeWallet !== "CEX" && $typeWallet !== "BTC"}
                      <img
                        src={chainList.find(
                          (chain) => chain.value === item?.chain
                        )?.logo || defaultToken}
                        alt=""
                        class="object-contain w-5 h-5 rounded-full"
                      />
                    {/if}
                    {#if $typeWallet === "EVM" || $typeWallet === "MOVE"}
                      <Copy
                        address={item?.transaction_hash}
                        textTooltip="Copy transaction to clipboard"
                        iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                        color={`${$isDarkMode ? "#fff" : "#000"}`}
                        isShorten={true}
                        isLink={true}
                        link={`${
                          item?.chain
                            ? linkExplorer(item?.chain, item?.transaction_hash)
                                .trx
                            : linkExplorer("SUI", item?.transaction_hash).trx
                        }`}
                      />
                    {:else}
                      <Copy
                        address={item?.transaction_hash}
                        textTooltip="Copy transaction to clipboard"
                        iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                        color={`${$isDarkMode ? "#fff" : "#000"}`}
                        isShorten={true}
                      />
                    {/if}
                  </div>
                  <div class="text-lg text-gray-400 xl:text-xs">
                    {formatTransactionTime(new Date(item?.detail.timestamp))}
                  </div>
                </div>
              </div>
            </td>

            <td
              class={`py-3  ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              {#if item?.detail?.from}
                <div class="text-2xl w-max xl:text-sm">
                  {#if $typeWallet === "EVM" || $typeWallet === "MOVE"}
                    <Copy
                      address={item?.detail?.from}
                      iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                      color={`${$isDarkMode ? "#fff" : "#000"}`}
                      textTooltip="Copy address"
                      isShorten={true}
                      isLink={true}
                      link={`${
                        linkExplorer(item?.chain, item?.detail?.from).address
                      }`}
                    />
                  {:else}
                    <Copy
                      address={item?.detail?.from}
                      textTooltip="Copy address"
                      iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                      color={`${$isDarkMode ? "#fff" : "#000"}`}
                      isShorten={true}
                    />
                  {/if}
                </div>
              {/if}
            </td>

            <td
              class={`py-3  ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              {#if item?.detail?.to}
                <div class="text-2xl w-max xl:text-sm">
                  {#if $typeWallet === "EVM" || $typeWallet === "MOVE"}
                    <Copy
                      address={item?.detail?.to}
                      iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                      color={`${$isDarkMode ? "#fff" : "#000"}`}
                      textTooltip="Copy address"
                      isShorten={true}
                      isLink={true}
                      link={`${
                        linkExplorer(item?.chain, item?.detail?.to).address
                      }`}
                    />
                  {:else}
                    <Copy
                      address={item?.detail?.to}
                      textTooltip="Copy address"
                      iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                      color={`${$isDarkMode ? "#fff" : "#000"}`}
                      isShorten={true}
                    />
                  {/if}
                </div>
              {/if}
            </td>

            <td
              class={`py-3 min-w-[100px] ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              <div
                class="flex justify-start text-2xl font-medium xl:text-sm text_00000099"
              >
                {#if item?.type}
                  <div
                    class="w-max px-2 py-1 text_27326F font-normal bg-[#6AC7F533] rounded-[5px] capitalize"
                  >
                    {item?.type}
                  </div>
                {/if}
              </div>
            </td>

            <td
              class={`py-3 pr-3 ${
                $isDarkMode
                  ? "group-hover:bg-[#000]"
                  : "group-hover:bg-gray-100"
              }`}
            >
              <div
                class="flex flex-col items-start gap-2 text-2xl font-medium xl:text-sm"
              >
                {#each item.changes as change}
                  <div class="flex items-center gap-2">
                    <img
                      src={change?.logo || defaultToken}
                      alt=""
                      class="object-contain overflow-hidden rounded-full w-7 h-7"
                    />
                    <div
                      class={`flex gap-1 ${
                        change?.total < 0 ? "text_00000099" : "text-[#00A878]"
                      }`}
                    >
                      <div class="flex gap-1">
                        <div class="flex">
                          {change?.total < 0 ? "-" : "+"}<TooltipNumber
                            number={Math.abs(change?.total)}
                            type="balance"
                          />
                        </div>
                        <div>
                          {change?.symbol || change?.name || "⎯"}
                        </div>
                      </div>
                      <div class="flex w-max">
                        (<TooltipNumber
                          number={Math.abs(
                            change?.total * change?.price?.price
                          )}
                          type="value"
                        />)
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

{#if pageToken && pageToken.length !== 0}
  <div class="mx-auto">
    <div class="w-[140px]">
      <Button
        variant="secondary"
        on:click={() => loadMore(pageToken)}
        disabled={isLoading}
        {isLoading}
        >Load more
      </Button>
    </div>
  </div>
{/if}

{#if !listSupported.includes($typeWallet)}
  <div class="flex items-center gap-2">
    <a href="https://mobula.fi/" target="_blank">
      <img
        src={mobulaLogo}
        alt=""
        class="xl:w-6 xl:h-6 w-10 h-10 rounded-full cursor-pointer"
      />
    </a>
    <span class="xl:text-sm text-xl">Data by Mobula</span>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
