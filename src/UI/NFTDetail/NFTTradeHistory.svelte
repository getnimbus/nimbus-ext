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

  let dataHistoryNftDetail = [
    {
      id: "ab557a32-9713-4e05-9636-79e2db71cb15",
      transactionHash:
        "0x044951039281ec412dcc36b8bf95a1eddb7a5bd08b017d8055574ff454eefda3",
      owner: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      fromAddress: "0x9ada4d7c6c05dd2eca87ce866c46793a4dd4a93f",
      toAddress: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      chain: "ETH",
      address: "0x6a4732395e70634dc1a5d4e5620340c311f08c01",
      tokenId: "51",
      price: 0.925,
      priceUst: 1684.37,
      timestamp: "2023-08-04T20:46:47.000Z",
    },
    {
      id: "01016da7-cf38-45b0-8fe3-13d6e20e1ba3",
      transactionHash:
        "0x5e88e516939a94e282bd522bd8e3c63247a08eccce14b01ac0c6325a0d0c97ee",
      owner: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      fromAddress: "0x3fb65feeab83bf60b0d1ffbc4217d2d97a35c8d4",
      toAddress: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      chain: "ETH",
      address: "0x3f0b6fe90aa17c59d200fa4baedc8935cea24f7c",
      tokenId: "17",
      price: 0.1595,
      priceUst: 263.62,
      timestamp: "2023-08-24T20:20:35.000Z",
    },
    {
      id: "ab1f5aa7-d2f7-4491-a7db-7c6e33d5fc75",
      transactionHash:
        "0x5e88e516939a94e282bd522bd8e3c63247a08eccce14b01ac0c6325a0d0c97ee",
      owner: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      fromAddress: "0x3fb65feeab83bf60b0d1ffbc4217d2d97a35c8d4",
      toAddress: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      chain: "ETH",
      address: "0x3f0b6fe90aa17c59d200fa4baedc8935cea24f7c",
      tokenId: "305",
      price: 0.16,
      priceUst: 264.45,
      timestamp: "2023-08-24T20:20:35.000Z",
    },
    {
      id: "3165aabc-35f2-416b-b458-e7aaf6f45416",
      transactionHash:
        "0x5e88e516939a94e282bd522bd8e3c63247a08eccce14b01ac0c6325a0d0c97ee",
      owner: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      fromAddress: "0x3fb65feeab83bf60b0d1ffbc4217d2d97a35c8d4",
      toAddress: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      chain: "ETH",
      address: "0x3f0b6fe90aa17c59d200fa4baedc8935cea24f7c",
      tokenId: "307",
      price: 0.16,
      priceUst: 264.45,
      timestamp: "2023-08-24T20:20:35.000Z",
    },
    {
      id: "d7fa242a-687a-4d8b-96f7-e05cc1f2b4fe",
      transactionHash:
        "0x6f39cdc8d7a2d552f0f167ab544d3a8024247b51f27dfbc8d4bea06fb4df2651",
      owner: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      fromAddress: "0xe2591bd3d77e4ab6a477b8fc776a36f7aee13a1d",
      toAddress: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      chain: "ETH",
      address: "0x3f0b6fe90aa17c59d200fa4baedc8935cea24f7c",
      tokenId: "107",
      price: 0.128,
      priceUst: 211.31,
      timestamp: "2023-08-24T21:11:23.000Z",
    },
    {
      id: "71a5e4f9-ccd3-4981-b208-2345eb5687d3",
      transactionHash:
        "0x6f39cdc8d7a2d552f0f167ab544d3a8024247b51f27dfbc8d4bea06fb4df2651",
      owner: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      fromAddress: "0xe2591bd3d77e4ab6a477b8fc776a36f7aee13a1d",
      toAddress: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      chain: "ETH",
      address: "0x3f0b6fe90aa17c59d200fa4baedc8935cea24f7c",
      tokenId: "318",
      price: 0.1295,
      priceUst: 213.78,
      timestamp: "2023-08-24T21:11:23.000Z",
    },
    {
      id: "66832b91-45dd-4516-97ce-008e3abbdeb6",
      transactionHash:
        "0x6f39cdc8d7a2d552f0f167ab544d3a8024247b51f27dfbc8d4bea06fb4df2651",
      owner: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      fromAddress: "0xe2591bd3d77e4ab6a477b8fc776a36f7aee13a1d",
      toAddress: "0x8bc924a4c07b4369a58cf35f6dc3ba16c41fc999",
      chain: "ETH",
      address: "0x3f0b6fe90aa17c59d200fa4baedc8935cea24f7c",
      tokenId: "415",
      price: 0.1295,
      priceUst: 213.78,
      timestamp: "2023-08-24T21:11:23.000Z",
    },
  ];

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
              Token ID
            </div>
          </th>

          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Cost
            </div>
          </th>

          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Type
            </div>
          </th>

          <th class="py-3 rounded-tr-[10px]">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Time
            </div>
          </th>

          <th class="py-3 w-10" />
        </tr>
      </thead>
      <!-- {#if $queryHistoryNftDetail.isFetching}
        <tbody>
          <tr>
            <td colspan="7">
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
              <td colspan="7">
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
      <tbody>
        {#each dataHistoryNftDetail as item}
          <NFTHistoryItem data={item} />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
