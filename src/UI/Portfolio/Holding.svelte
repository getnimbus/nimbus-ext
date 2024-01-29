<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { i18n } from "~/lib/i18n";
  import {
    chain,
    typeWallet,
    isDarkMode,
    isShowModalNftList,
    isShowModalNftDeList,
    listingNft,
    selectedNftContractAddress,
    wallet,
    userPublicAddress,
  } from "~/store";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { filterTokenValueType, chunkArray } from "~/utils";
  import { listSupported } from "~/lib/chains";
  import { groupBy } from "lodash";
  import { priceMobulaSubscribe } from "~/lib/price-mobulaWs";
  import { priceSubscribe } from "~/lib/price-ws";
  import { Connection, Transaction } from "@solana/web3.js";
  import { nimbus } from "~/lib/network";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import {
    BackpackWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { Buffer as BufferPolyfill } from "buffer";

  export let selectedWallet;
  export let isLoadingNFT;
  export let isLoadingToken;
  export let holdingTokenData;
  export let holdingNFTData;
  export let dataVaults;
  export let selectedTokenHolding;
  export let selectedDataPieChart;
  export let totalAssets;
  export let unrealizedProfit;
  export let realizedProfit;

  import HoldingToken from "~/UI/Portfolio/HoldingToken.svelte";
  import HoldingNFT from "~/UI/Portfolio/HoldingNFT.svelte";
  import Select from "~/components/Select.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import SolanaAuth from "../Auth/SolanaAuth.svelte";
  import WalletModal from "~/UI/SolanaCustomWalletBtn/WalletModal.svelte";

  const marketList = [{ value: "SniperMarket", label: "Sniper Market" }];
  const marketDeList = [
    { value: "SniperMarket", label: "Sniper Market" },
    { value: "MagicEden", label: "Magic Eden" },
    { value: "CoralCube", label: "Coral Cube" },
    { value: "Hyperspace", label: "Hyperspace" },
    { value: "Tensorswap", label: "Tensorswap" },
  ];
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ];
  const maxNumberOfWallets = 5;

  let dataSubWS = [];
  let filteredUndefinedCmcHoldingTokenData = [];
  let filteredNullCmcHoldingTokenData = [];
  let marketPriceToken;
  let filteredHoldingDataToken = [];
  let filteredHoldingDataNFT = [];
  let formatData = [];
  let formatDataNFT = [];
  let sumTokens = 0;
  let sumAllTokens = 0;
  let sumNFT = 0;
  let tableTokenHeader;
  let isStickyTableToken = false;
  let tableNFTHeader;
  let isStickyTableNFT = false;

  let nftListPrice = 0;
  let selectedMarket;

  let selectedTypeTable = {
    label: "",
    value: "",
  };

  let filterTokenType = {
    label: "$1",
    value: 1,
  };

  let filterNFTType = {
    label: "$1",
    value: 1,
  };

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

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader?.top <= 0;
      const clientRectNFTHeader = tableNFTHeader?.getBoundingClientRect();
      isStickyTableNFT = clientRectNFTHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  // format initial data
  $: {
    if (
      selectedTokenHolding &&
      Object.keys(selectedTokenHolding).length !== 0 &&
      selectedTokenHolding.data.length !== 0
    ) {
      let data = [];
      if (selectedTypeTable && Object.keys(selectedTypeTable).length !== 0) {
        if (Array.isArray(selectedTokenHolding.data)) {
          data = selectedTokenHolding?.data.find(
            (item) => item.name === selectedTypeTable.value
          )?.data;
        } else {
          data = selectedTokenHolding.data.data;
        }
      }

      if (data && data.length !== 0) {
        formatData = data.map((item) => {
          return {
            ...item,
            market_price: item.chain === "ZETA" ? 10 : item?.rate || 0,
          };
        });
        filteredHoldingDataToken = formatData.filter((item) => item.value > 1);
        sumTokens = data.reduce((prev, item) => prev + item.value, 0);
      }
    }
    if (holdingNFTData) {
      formatDataNFT = holdingNFTData
        .map((item) => {
          return {
            ...item,
            current_native_token: item?.floorPrice * item?.tokens?.length,
            current_value:
              item?.floorPrice * item?.marketPrice * item?.tokens?.length,
          };
        })
        .sort((a, b) => {
          if (a.current_native_token < b.current_native_token) {
            return 1;
          }
          if (a.current_native_token > b.current_native_token) {
            return -1;
          }
          return 0;
        });
      sumNFT = formatDataNFT.reduce(
        (prev, item) => prev + item.current_value,
        0
      );
    }
  }

  // subscribe to ws
  $: {
    if (!isLoadingToken) {
      if (holdingTokenData?.length !== 0) {
        const dataTokenHolding = holdingTokenData?.filter(
          (item) =>
            item?.price?.source === undefined ||
            item?.price?.source !== "Modifed"
        );
        const filteredHoldingTokenData = dataTokenHolding?.filter(
          (item) =>
            item?.cmc_id !== undefined &&
            item?.cmc_id !== null &&
            item?.cmc_id > 0
        );

        dataSubWS = filteredHoldingTokenData.map((item) => {
          return {
            symbol: item.symbol,
            cmcId: item.cmc_id,
          };
        });

        filteredNullCmcHoldingTokenData = dataTokenHolding?.filter(
          (item) => item?.cmc_id === null || item?.cmc_id === 0
        );

        filteredUndefinedCmcHoldingTokenData = dataTokenHolding?.filter(
          (item) => item?.cmc_id === undefined
        );

        sumAllTokens = holdingTokenData?.reduce(
          (prev, item) => prev + item.value,
          0
        );
      }
    }
    if (!isLoadingNFT) {
      if (holdingNFTData?.length !== 0) {
        const formatHoldingNFTData = holdingNFTData
          ?.filter((item) => item?.nativeToken?.cmcId)
          ?.map((item) => {
            return {
              symbol: item.nativeToken.symbol,
              cmcId: item.nativeToken.cmcId,
            };
          });
        dataSubWS = dataSubWS.concat(formatHoldingNFTData);
      }
    }
  }

  $: {
    if (
      !isLoadingNFT &&
      !isLoadingToken &&
      filteredUndefinedCmcHoldingTokenData &&
      filteredUndefinedCmcHoldingTokenData.length !== 0 &&
      $typeWallet === "CEX"
    ) {
      const chunkedArray = chunkArray(
        filteredUndefinedCmcHoldingTokenData,
        100
      );
      chunkedArray.forEach((chunk) => {
        const listTokenSubWs = chunk.filter((item) => item?.symbol);
        if (listTokenSubWs && listTokenSubWs.length !== 0) {
          priceMobulaSubscribe(
            listTokenSubWs.map((item) => item?.symbol),
            "CEX",
            (data) => {
              marketPriceToken = {
                id: data.id,
                market_price: data.price,
              };
            }
          );
        }
      });
    }
  }

  $: {
    if (
      !isLoadingNFT &&
      !isLoadingToken &&
      filteredNullCmcHoldingTokenData &&
      filteredNullCmcHoldingTokenData.length !== 0
    ) {
      const groupFilteredNullCmcHoldingTokenData = groupBy(
        filteredNullCmcHoldingTokenData,
        "chain"
      );

      const chainList = Object.keys(groupFilteredNullCmcHoldingTokenData);
      chainList.map((chain) => {
        const chunkedArray = chunkArray(
          groupFilteredNullCmcHoldingTokenData[chain],
          100
        );
        chunkedArray.forEach((chunk) => {
          const listTokenSubWs = chunk.filter((item) => item?.contractAddress);
          if (listTokenSubWs && listTokenSubWs.length !== 0) {
            priceMobulaSubscribe(
              listTokenSubWs.map((item) => item.contractAddress),
              listTokenSubWs[0]?.chain,
              (data) => {
                marketPriceToken = {
                  id: data.id,
                  market_price: data.price,
                };
              }
            );
          }
        });
      });
    }
  }

  $: {
    if (
      !isLoadingNFT &&
      !isLoadingToken &&
      dataSubWS &&
      dataSubWS.length !== 0
    ) {
      let filteredData = [];
      const symbolSet = new Set();
      dataSubWS.forEach((item) => {
        if (!symbolSet.has(item.symbol)) {
          symbolSet.add(item.symbol);
          filteredData.push(item);
        }
      });
      filteredData?.map((item) => {
        priceSubscribe([Number(item?.cmcId)], item?.chain, (data) => {
          marketPriceToken = {
            id: data.id,
            market_price: data.price,
          };
        });
      });
    }
  }

  // check market price and update price real-time
  $: {
    if (marketPriceToken) {
      // update data token holding
      const formatDataWithMarketPrice = formatData.map((item) => {
        if (
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.cmc_id?.toString().toLowerCase() ||
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.contractAddress.toString().toLowerCase() ||
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.symbol?.toString().toLowerCase() ||
          marketPriceToken?.id.toString().toLowerCase() ===
            item?.price?.symbol?.toString().toLowerCase()
        ) {
          return {
            ...item,
            market_price: Number(marketPriceToken.market_price),
            value: Number(item?.amount) * Number(marketPriceToken.market_price),
          };
        }
        return { ...item };
      });
      formatData = formatDataWithMarketPrice.sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });
      filteredHoldingDataToken = formatData.filter((item) => item.value > 1);
      sumTokens = formatDataWithMarketPrice.reduce(
        (prev, item) => prev + item.value,
        0
      );
      sumAllTokens = formatDataWithMarketPrice.reduce(
        (prev, item) => prev + item.value,
        0
      );
      // update data nft holding
      const formatDataNFTWithMarketPrice = formatDataNFT.map((item) => {
        if (
          marketPriceToken?.id.toString().toLowerCase() ===
          item?.nativeToken?.cmcId.toString().toLowerCase()
        ) {
          return {
            ...item,
            marketPrice: Number(marketPriceToken.market_price),
            current_native_token: item?.floorPrice * item?.tokens?.length,
            current_value:
              item?.floorPrice *
              Number(marketPriceToken.market_price) *
              item?.tokens?.length,
          };
        }
        return { ...item };
      });
      formatDataNFT = formatDataNFTWithMarketPrice.sort((a, b) => {
        if (a.current_native_token < b.current_native_token) {
          return 1;
        }
        if (a.current_native_token > b.current_native_token) {
          return -1;
        }
        return 0;
      });
      sumNFT = formatDataNFTWithMarketPrice.reduce(
        (prev, item) => prev + item.current_value,
        0
      );
    }
  }

  $: {
    if (filterTokenType) {
      const formatDataWithVault = formatData?.map((item) => {
        try {
          const regex = new RegExp(`(^${item?.symbol}|-${item?.symbol})`);
          const filteredVaults = dataVaults?.filter((data) =>
            data.name.match(regex)
          );

          return {
            ...item,
            vaults: filteredVaults,
          };
        } catch (error) {
          return {
            ...item,
            vaults: [],
          };
        }
      });
      if (filterTokenType.value === 0) {
        filteredHoldingDataToken = formatDataWithVault;
      } else {
        filteredHoldingDataToken = formatDataWithVault?.filter(
          (item) => item?.amount * item.market_price > filterTokenType.value
        );
      }
    }
  }

  $: {
    if (filterNFTType) {
      if (filterNFTType.value === 0) {
        filteredHoldingDataNFT = formatDataNFT;
      } else {
        filteredHoldingDataNFT = formatDataNFT?.filter(
          (item) => item?.current_value > filterNFTType.value
        );
      }
    }
  }

  $: {
    if (formatData?.length === 0) {
      totalAssets = 0;
      sumTokens = 0;
      sumNFT = 0;
      unrealizedProfit = 0;
      realizedProfit = 0;
    } else {
      sumTokens = (formatData || []).reduce(
        (prev, item) => prev + item?.amount * item.market_price,
        0
      );

      sumNFT = (formatDataNFT || []).reduce(
        (prev, item) => prev + item?.current_value,
        0
      );

      realizedProfit = (formatData || [])
        .map((item) => {
          return {
            realized_profit: item?.profit?.realizedProfit || 0,
          };
        })
        .reduce((prev, item) => prev + Number(item.realized_profit), 0);

      unrealizedProfit = (formatData || [])
        ?.filter(
          (item) => Number(item?.amount) > 0 && Number(item?.avgCost) !== 0
        )
        ?.map((item) => {
          const price = Number(item?.market_price || item?.price?.price || 0);
          const pnl =
            Number(item?.balance || 0) * price +
            Number(item?.profit?.totalGain || 0) -
            Number(item?.profit?.cost || 0);
          const realizedProfit = item?.profit?.realizedProfit
            ? Number(item?.profit?.realizedProfit)
            : 0;

          return {
            unrealized_profit:
              Number(item?.avgCost) === 0 ? 0 : Number(pnl) - realizedProfit,
          };
        })
        .reduce((prev, item) => prev + Number(item.unrealized_profit), 0);
    }
  }

  $: {
    if (
      selectedTokenHolding &&
      Object.keys(selectedTokenHolding).length !== 0 &&
      selectedTokenHolding?.select.length === 0 &&
      (sumTokens || sumNFT)
    ) {
      totalAssets = sumNFT + sumTokens;
    }
  }

  $: colspan = listSupported.includes($typeWallet) ? 8 : 7;

  $: {
    if (selectedWallet || $chain) {
      if (selectedWallet?.length !== 0 && $chain?.length !== 0) {
        sumTokens = 0;
        sumAllTokens = 0;
        sumNFT = 0;
        formatData = [];
        formatDataNFT = [];
        filteredHoldingDataToken = [];
        filteredHoldingDataNFT = [];
        marketPriceToken = undefined;
      }
    }
  }

  $: {
    if (
      selectedTokenHolding &&
      Object.keys(selectedTokenHolding).length !== 0 &&
      selectedTokenHolding.data.length !== 0 &&
      selectedTokenHolding?.data?.data?.length === 0
    ) {
      filteredHoldingDataToken = [];
      sumTokens = 0;
    }
  }

  const dispatch = createEventDispatcher();

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      userPublicAddressChain = response?.data?.type;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 5;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    isSuccessToast = false;
  };

  let modalVisible = false;
  let userPublicAddressChain = "EVM";
  let userAddress = $userPublicAddress;

  onMount(() => {
    $walletStore.disconnect();
  });

  const openModal = () => {
    modalVisible = true;
    dispatch("connect");
  };

  const closeModal = () => (modalVisible = false);

  const connectWallet = async (event) => {
    closeModal();
    try {
      localStorage.removeItem("walletAdapter");
      await walletStore.resetWallet();
      await walletStore.setConnecting(false);
      await $walletStore.disconnect();
      await $walletStore.select(event.detail);
      await $walletStore.connect();
    } catch (error) {
      console.log(error);
    }
  };

  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  $: {
    if (solanaPublicAddress) {
      userAddress = solanaPublicAddress;
    } else {
      userAddress = $userPublicAddress;
    }
  }

  $: {
    if (userAddress) {
      handleValidateAddress(userAddress);
    }
  }

  const onSubmitListNFT = async () => {
    const params = {
      price: Number(nftListPrice),
      mintAddress: $selectedNftContractAddress,
      marketplace: selectedMarket?.value,
    };
    try {
      const res = await nimbus.get(`/v2/address/${$wallet}/nft/list`, {
        params,
      });
      if (res?.data && res?.data?.tx) {
        sendTrxOnSolChain(res?.data?.tx, "List");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmitDeListNFT = async () => {
    const params = {
      mintAddress: $selectedNftContractAddress,
      marketplace: $listingNft?.marketplace,
    };
    try {
      const res = await nimbus.get(`/v2/address/${$wallet}/nft/delist`, {
        params,
      });
      if (res?.data && res?.data?.tx) {
        sendTrxOnSolChain(res?.data?.tx, "De-list");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const sendTrxOnSolChain = async (trx: any, type: string) => {
    try {
      const txBuffer = BufferPolyfill.from(trx, "base64");
      const transaction = Transaction.from(txBuffer);

      const connection = new Connection(
        "https://devnet-rpc.shyft.to?api_key=gsusEvomKHQwwltu" // DEVNET
        // "https://rpc.shyft.to?api_key=b4feHxaBppbRqTHc" // PROD
        // "https://rpc.shyft.to?api_key=gsusEvomKHQwwltu"
      );
      const result = await $walletStore.sendTransaction(
        transaction,
        connection
      );
      console.log("result:", result);

      if (result) {
        toastMsg = `${type} your NFT successful`;
        isSuccessToast = true;
        trigger();
      } else {
        toastMsg = `Something wrong when ${type} your NFT. Please try again!`;
        isSuccessToast = false;
        trigger();
      }
    } catch (e) {
      console.log(e);
    }
  };
</script>

<div
  class={`flex flex-col gap-6 rounded-[20px] p-6 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
  }`}
>
  <ErrorBoundary>
    <div class="flex flex-col gap-6">
      <div class="flex items-end gap-3">
        <div class="xl:text-2xl text-4xl font-medium">
          {MultipleLang.holding}
        </div>
        <!-- <a
          href="https://forms.gle/HfmvSTzd5frPPYDz8"
          target="_blank"
          class="xl:text-sm text-2xl font-normal text-blue-500 mb-[2px] hover:text-blue-700 transition-all"
        >
          Get investment opportunities notification
        </a> -->
      </div>

      <div class="flex flex-col gap-6">
        <!-- token holding table -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <div class="xl:text-xl text-3xl font-medium">
                {MultipleLang.token}
              </div>
              {#if selectedTokenHolding && Object.keys(selectedTokenHolding).length !== 0 && selectedTokenHolding?.select.length !== 0}
                <Select
                  type="lang"
                  positionSelectList="left-0"
                  listSelect={selectedTokenHolding?.select || []}
                  bind:selected={selectedTypeTable}
                />
              {/if}
            </div>
            <div class="xl:text-3xl text-4xl font-medium text-right">
              <TooltipNumber number={sumTokens} type="value" personalValue />
              {#if selectedTokenHolding && Object.keys(selectedTokenHolding).length !== 0 && selectedTokenHolding?.select.length !== 0}
                <span class="xl:text-xl text-2xl font-medium text-gray-400">
                  <TooltipNumber
                    number={selectedDataPieChart?.series[0]?.data.filter(
                      (item) =>
                        item.name === selectedTypeTable?.value ||
                        item.name === selectedTypeTable?.label
                    )[0]?.value}
                    type="percent"
                  />%
                </span>
              {/if}
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-end gap-2">
              <div class="xl:text-sm text-2xl font-regular text-gray-400">
                Hide tokens less than
              </div>
              <Select
                type="filter"
                positionSelectList="right-0"
                listSelect={filterTokenValueType}
                bind:selected={filterTokenType}
              />
            </div>

            <div
              class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
                $isDarkMode
                  ? "bg-[#131313]"
                  : "bg-[#fff] border border_0000000d"
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
                      <div
                        class="text-left xl:text-xs text-xl uppercase font-medium"
                      >
                        {MultipleLang.assets}
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        {MultipleLang.price}
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        {MultipleLang.amount}
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        {MultipleLang.value}
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        Avg Cost
                      </div>
                    </th>
                    <th class="py-3">
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
                        Realized PnL
                      </div>
                    </th>
                    <th
                      class={`py-3 xl:pr-3 pr-6 ${
                        listSupported.includes($typeWallet)
                          ? ""
                          : "rounded-tr-[10px]"
                      }`}
                    >
                      <div
                        class="text-right xl:text-xs text-xl uppercase font-medium"
                      >
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
                      <HoldingToken
                        data={holding}
                        lastIndex={filteredHoldingDataToken.length - 1 ===
                          index}
                        {selectedWallet}
                        sumAllTokens={totalAssets - sumNFT}
                        index={index + 1}
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
                        {#each filteredHoldingDataToken as holding, index (holding.positionId)}
                          <HoldingToken
                            data={holding}
                            lastIndex={filteredHoldingDataToken.length - 1 ==
                              index}
                            {selectedWallet}
                            sumAllTokens={totalAssets - sumNFT}
                            index={index + 1}
                          />
                        {/each}
                      {/if}
                    </tbody>
                  {/if}
                {/if}
              </table>
            </div>
          </div>
        </div>

        <!-- nft holding table -->
        {#if $typeWallet !== "CEX"}
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <div class="xl:text-xl text-3xl font-medium">
                {MultipleLang.nft}
              </div>
              <div class="xl:text-3xl text-4xl font-medium text-right">
                <TooltipNumber number={sumNFT} type="value" />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-end gap-2">
                <div class="xl:text-sm text-2xl font-regular text-gray-400">
                  Hide NFT Collections less than
                </div>
                <Select
                  type="filter"
                  positionSelectList="right-0"
                  listSelect={filterTokenValueType}
                  bind:selected={filterNFTType}
                />
              </div>

              <div
                class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
                  $isDarkMode
                    ? "bg-[#131313]"
                    : "bg-[#fff] border border_0000000d"
                }`}
              >
                <table class="table-auto xl:w-full w-[2000px] h-full">
                  <thead
                    class={isStickyTableNFT ? "sticky top-0 z-10" : ""}
                    bind:this={tableNFTHeader}
                  >
                    <tr class="bg_f4f5f8">
                      <th
                        class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 xl:w-[220px] w-[350px]"
                      >
                        <div
                          class="text-left xl:text-xs text-xl uppercase font-medium"
                        >
                          {MultipleLang.collection}
                        </div>
                      </th>
                      <th
                        class="py-3 xl:static xl:bg-transparent sticky left-[350px] z-10 bg_f4f5f8 w-[200px]"
                      >
                        <div
                          class="text-left xl:text-xs text-xl uppercase font-medium"
                        >
                          {MultipleLang.Balance}
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-xl uppercase font-medium"
                        >
                          <TooltipTitle
                            tooltipText={false
                              ? "The Floor price from Magic Eden marketplace. "
                              : "The Floor price of last 24h, if there is no volume, the floor price is 0"}
                            link={false ? "https://magiceden.io/ordinals" : ""}
                          >
                            {MultipleLang.floor_price}
                          </TooltipTitle>
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-xl uppercase font-medium"
                        >
                          Cost
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-xl uppercase font-medium"
                        >
                          {MultipleLang.current_value}
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-xl uppercase font-medium"
                        >
                          <TooltipTitle
                            tooltipText="Price NFTs now - Price NFTs at time you spent"
                          >
                            {MultipleLang.profit}
                          </TooltipTitle>
                        </div>
                      </th>
                      <th class="py-3 xl:w-12 w-32 rounded-tr-[10px]" />
                    </tr>
                  </thead>

                  {#if $chain === "ALL"}
                    <tbody>
                      {#if filteredHoldingDataNFT && filteredHoldingDataNFT.length === 0 && !isLoadingNFT}
                        <tr>
                          <td colspan={7}>
                            <div
                              class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400 view-nft-detail"
                            >
                              {#if formatDataNFT && formatDataNFT.length === 0}
                                {MultipleLang.empty}
                              {:else}
                                All NFT Collections less than $1
                              {/if}
                            </div>
                          </td>
                        </tr>
                      {/if}
                      {#each filteredHoldingDataNFT as holding, index}
                        <HoldingNFT
                          data={holding}
                          {selectedWallet}
                          {index}
                          lastIndex={filteredHoldingDataNFT.length - 1 == index}
                        />
                      {/each}
                    </tbody>
                    {#if isLoadingNFT}
                      <tbody>
                        <tr>
                          <td colspan={7}>
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
                    {#if isLoadingNFT}
                      <tbody>
                        <tr>
                          <td colspan={7}>
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
                        {#if filteredHoldingDataNFT && filteredHoldingDataNFT.length === 0}
                          <tr>
                            <td colspan={7}>
                              <div
                                class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400 view-nft-detail"
                              >
                                {#if formatDataNFT && formatDataNFT.length === 0}
                                  {MultipleLang.empty}
                                {:else}
                                  All NFT Collections less than $1
                                {/if}
                              </div>
                            </td>
                          </tr>
                        {:else}
                          {#each filteredHoldingDataNFT as holding, index}
                            <HoldingNFT
                              lastIndex={filteredHoldingDataNFT.length - 1 ==
                                index}
                              data={holding}
                              {selectedWallet}
                              {index}
                            />
                          {/each}
                        {/if}
                      </tbody>
                    {/if}
                  {/if}
                </table>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </ErrorBoundary>
</div>

<!-- Modal list nft  -->
<AppOverlay
  clickOutSideToClose
  isOpen={$isShowModalNftList}
  on:close={() => {
    isShowModalNftList.update((n) => (n = false));
  }}
>
  {#if userPublicAddressChain === "SOL" && solanaPublicAddress}
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <div class="font-medium xl:title-3 title-1">List your NFT</div>
        <SolanaAuth text="Connect wallet" />
      </div>
      <form
        on:submit|preventDefault={onSubmitListNFT}
        class="flex flex-col xl:gap-3 gap-10"
      >
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            nftListPrice && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Price ({$typeWallet})
          </div>
          <input
            type="text"
            id="price"
            name="price"
            required
            placeholder="Your NFT price"
            value=""
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
              nftListPrice && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            }`}
            on:keyup={({ target: { value } }) => (nftListPrice = value)}
          />
        </div>

        <div class="flex items-center gap-3 px-3">
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Market
          </div>
          <Select
            type="lang"
            positionSelectList="left-0"
            listSelect={marketList}
            bind:selected={selectedMarket}
          />
        </div>

        <div class="flex justify-end lg:gap-2 gap-6">
          <div class="xl:w-[120px] w-full">
            <Button
              variant="secondary"
              on:click={() => {
                isShowModalNftList.update((n) => (n = false));
              }}
            >
              Cancel</Button
            >
          </div>
          <div class="xl:w-[120px] w-full">
            <Button
              type="submit"
              isLoading={false}
              disabled={userAddress !== $wallet}>Submit</Button
            >
            <!-- <Button type="submit" isLoading={false}>Submit</Button> -->
          </div>
        </div>
      </form>
    </div>
  {:else}
    <div class="flex flex-col items-center gap-4">
      <div class="font-medium xl:title-3 title-1">
        Connect your Solana wallet to list NFT
      </div>
      <div
        class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
          $isDarkMode
            ? "border-white text-white"
            : "border-[#27326f] text-[#27326f]"
        }`}
        on:click={() => {
          openModal();
        }}
      >
        <div class="font-semibold text-[15px]">Connect wallet</div>
      </div>
    </div>
  {/if}
</AppOverlay>

<!-- Modal de-list nft  -->
<AppOverlay
  clickOutSideToClose
  isOpen={$isShowModalNftDeList}
  on:close={() => {
    isShowModalNftDeList.update((n) => (n = false));
  }}
>
  {#if userPublicAddressChain === "SOL" && solanaPublicAddress}
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <div class="font-medium xl:title-3 title-1">Your list NFT</div>
        <SolanaAuth text="Connect wallet" />
      </div>
      <form
        on:submit|preventDefault={onSubmitDeListNFT}
        class="flex flex-col xl:gap-3 gap-10"
      >
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            nftListPrice && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Price ({$typeWallet})
          </div>
          <input
            type="text"
            id="price"
            name="price"
            required
            placeholder="Your NFT price"
            value={$listingNft?.price}
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
              !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            }`}
          />
        </div>

        <div class="flex items-center gap-3 px-3">
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Market
          </div>
          <Select
            type="chain"
            disabled
            positionSelectList="left-0"
            listSelect={marketDeList}
            selected={marketDeList.find(
              (item) => item.value === $listingNft?.marketplace
            )}
          />
        </div>

        <div class="flex justify-end lg:gap-2 gap-6">
          <div class="xl:w-[120px] w-full">
            <Button
              variant="secondary"
              on:click={() => {
                isShowModalNftList.update((n) => (n = false));
              }}
            >
              Cancel</Button
            >
          </div>
          <div class="xl:w-[120px] w-full">
            <Button
              type="submit"
              isLoading={false}
              disabled={userAddress !== $wallet}>Submit</Button
            >
            <!-- <Button type="submit" isLoading={false}>Submit</Button> -->
          </div>
        </div>
      </form>
    </div>
  {:else}
    <div class="flex flex-col items-center gap-4">
      <div class="font-medium xl:title-3 title-1">
        Connect your Solana wallet to de-list NFT
      </div>
      <div
        class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
          $isDarkMode
            ? "border-white text-white"
            : "border-[#27326f] text-[#27326f]"
        }`}
        on:click={() => {
          openModal();
        }}
      >
        <div class="font-semibold text-[15px]">Connect wallet</div>
      </div>
    </div>
  {/if}
</AppOverlay>

<WalletProvider
  localStorageKey="walletAdapter"
  {wallets}
  autoConnect
  onError={console.log}
/>

{#if modalVisible}
  <WalletModal
    on:close={closeModal}
    on:connect={connectWallet}
    {maxNumberOfWallets}
  />
{/if}

{#if showToast}
  <div class="fixed w-full top-3 right-3" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style>
</style>
