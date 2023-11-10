<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { typeWallet, isDarkMode, wallet } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import NFTHistoryItem from "./NFTHistoryItem.svelte";

  export let selectedNftCollectionChain;
  export let selectedNftCollectionId;

  const handleGetTradeHistory = async (id, address, chain) => {
    const response: any = await nimbus.get(
      `/v2/address/${address}/nft/${id}/trade-history?chain=${chain}`
    );
    return response?.data;
  };

  let dataHistoryNftDetail = [];

  // $: queryHistoryNftDetail = createQuery({
  //   queryKey: ["nft-trade-history", selectedNftCollectionId, $wallet, selectedNftCollectionChain],
  //   queryFn: () => handleGetTradeHistory(selectedNftCollectionId, $wallet, selectedNftCollectionChain),
  //   staleTime: Infinity,
  //   retry: false,
  //   enabled:
  //     data !== undefined &&
  //     Object.keys(data).length !== 0 &&
  //     $wallet.length !== 0,
  //   onError(err) {
  //     localStorage.removeItem("evm_token");
  //     user.update((n) => (n = {}));
  //   },
  // });

  // $: {
  //   if (
  //     !$queryHistoryTokenDetail.isError &&
  //     $queryHistoryTokenDetail.data !== undefined &&
  //     $queryHistoryTokenDetail.data.length !== 0
  //   ) {
  //     dataHistoryNftDetail = $queryHistoryTokenDetail.data;
  //   }
  // }
</script>

<div
  class={`rounded-[20px] p-6 flex flex-col gap-4 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <div class="xl:text-2xl text-4xl font-medium">History</div>
  <div
    class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <table class="table-auto xl:w-full w-[1400px] h-full">
      <thead>
        <tr class="bg_f4f5f8">
          <th
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[100px]"
          >
            <div class="text-left xl:text-xs text-xl uppercase font-medium">
              Amount
            </div>
          </th>

          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Cost/Gain
            </div>
          </th>

          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Price
            </div>
          </th>

          <th
            class={`py-3 rounded-tr-[10px] ${
              $typeWallet === "SOL" ||
              $typeWallet === "EVM" ||
              $typeWallet === "BUNDLE"
                ? ""
                : "pr-3"
            }`}
          >
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Time
            </div>
          </th>

          {#if $typeWallet === "SOL" || $typeWallet === "EVM" || $typeWallet === "BUNDLE"}
            <th class="py-3 w-10" />
          {/if}
        </tr>
      </thead>
      <!-- {#if $queryHistoryNftDetail.isFetching}
        <tbody>
          <tr>
            <td colspan="4">
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if dataHistoryNftDetail && dataHistoryNftDetail?.length === 0}
            <tr>
              <td colspan="4">
                <div
                  class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                >
                  Empty
                </div>
              </td>
            </tr>
          {:else}
            {#each dataHistoryNftDetail as item}
              <TokenHistoryItem
                data={item}
                contractAddress={data?.contractAddress}
              />
            {/each}
          {/if}
        </tbody>
      {/if} -->
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
