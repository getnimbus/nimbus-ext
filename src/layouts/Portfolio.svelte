<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { groupBy, isEmpty, flatten } from "lodash";
  import { onDestroy, onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { disconnectWs, initWS } from "~/lib/price-ws";
  import { chainList, driverObj } from "~/utils";
  import { wait } from "../entries/background/utils";
  import {
    wallet,
    chain,
    typeWallet,
    selectedBundle,
    userPublicAddress,
  } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { nimbus } from "~/lib/network";
  import {
    createQuery,
    createQueries,
    useQueryClient,
  } from "@tanstack/svelte-query";

  import type { NewData, NewDataRes } from "~/types/NewData";
  import type { OverviewData, OverviewDataRes } from "~/types/OverviewData";
  import type { PositionData, PositionDataRes } from "~/types/PositionData";
  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";
  import type { NFTData, HoldingNFTRes } from "~/types/HoldingNFTData";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Overview from "~/UI/Portfolio/Overview.svelte";
  import Testimonial from "~/UI/Testimonial/Testimonial.svelte";
  import Charts from "~/UI/Portfolio/Charts.svelte";
  import RiskReturn from "~/UI/Portfolio/RiskReturn.svelte";
  import Holding from "~/UI/Portfolio/Holding.svelte";
  import ClosedTokenPosition from "~/UI/Portfolio/ClosedTokenPosition.svelte";
  import News from "~/UI/Portfolio/News.svelte";
  import Positions from "~/UI/Portfolio/Positions.svelte";
  import Button from "~/components/Button.svelte";
  import "~/components/Tooltip.custom.svelte";

  import Reload from "~/assets/reload.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytics"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    market: i18n("newtabPage.market", "Market"),
    settings: i18n("newtabPage.settings", "Settings"),
    overview: i18n("newtabPage.overview", "Overview"),
    dailyCheckin: i18n("newtabPage.dailyCheckin", "Daily Checkin"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
    data_updated: i18n("newtabPage.data-updated", "Data updated"),
    updating_data: i18n("newtabPage.updating-data", "Updating data"),
    search_placeholder: i18n("newtabPage.search-placeholder", "Search address"),
    missed_protocol: i18n(
      "newtabPage.missed-protocol",
      "Missing your protocol?"
    ),
  };

  const queryClient = useQueryClient();

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let selectBundle = {};
  selectedBundle.subscribe((value) => {
    selectBundle = value;
  });

  let enabledFetchAllData = false;
  let isErrorAllData = false;
  let isLoadingSync = false;

  let overviewData: OverviewData = {
    breakdownToken: [],
    breakdownNft: [],
    overview: {
      assets: 0,
      assetsChange: 0,
      change: "",
      claimable: 0,
      claimableChange: 0,
      debts: 0,
      debtsChange: 0,
      networth: 0,
      networthChange: 0,
      postionNetworth: 0,
      postionNetworthChange: 0,
    },
    portfolioChart: [],
    performance: [],
    updatedAt: "",
  };
  let newsData: NewData = [];
  let holdingTokenData: TokenData = [];
  let closedHoldingPosition: TokenData = [];
  let holdingNFTData: NFTData = [];
  let positionsData: PositionData = [];
  let overviewDataPerformance = {
    performance: [],
    portfolioChart: [],
  };
  let dataOverviewBundlePieChart = [];
  let dataUpdatedTime;
  let totalPositions = 0;
  let totalAssets = 0;
  let isEmptyDataPieTokens = false;
  let isEmptyDataPieNfts = false;
  let syncMsg = "";
  let dataPieChartToken = {
    sumOrderBreakdownToken: 0,
    formatDataPieChartTopFiveToken: [],
    dataPieChartOrderBreakdownToken: [],
  };
  let dataPieChartNft = {
    sumOrderBreakdownNft: 0,
    formatDataPieChartTopFiveNft: [],
    dataPieChartOrderBreakdownNft: [],
  };
  let selectedTokenHolding = {
    data: [],
    select: [],
  };
  let selectedDataPieChart = {};

  $: {
    // if (!$queryTokenHolding.isFetching) {
    console.log(
      "HEELLO: ",
      selectedChain === "ALL"
        ? $queryAllTokenHolding &&
            $queryAllTokenHolding.some((item) => item.isFetching === true) &&
            $queryAllNftHolding &&
            $queryAllNftHolding.some((item) => item.isFetching === true)
        : !isErrorAllData &&
            $queryTokenHolding.isFetching &&
            $queryVaults.isFetching &&
            $queryOverview.isFetching &&
            $queryNftHolding.isFetching
    );
    if (
      $userPublicAddress &&
      !localStorage.getItem("view-portfolio-tour") &&
      (selectedChain === "ALL"
        ? $queryAllTokenHolding &&
          $queryAllTokenHolding.some((item) => item.isFetching === true) &&
          $queryAllNftHolding &&
          $queryAllNftHolding.some((item) => item.isFetching === true)
        : !isErrorAllData &&
          $queryTokenHolding.isFetching &&
          $queryVaults.isFetching &&
          $queryOverview.isFetching &&
          $queryNftHolding.isFetching)
    ) {
      driverObj.drive();
    }
    // localStorage.setItem("view-portfolio-tour", "true");
    // }
  }

  // overview
  const getOverview = async (address, chain) => {
    const response: OverviewDataRes = await nimbus
      .get(`/v2/address/${address}/overview?chain=${chain}`)
      .then((response) => response?.data);
    return response;
  };

  const formatNFTBreakdown = (data) => {
    if (data?.length === 0) {
      isEmptyDataPieNfts = true;
    } else {
      isEmptyDataPieNfts = false;
    }

    const formatData = data.map((item) => {
      return {
        ...item,
        current_value:
          item?.floorPrice * item?.marketPrice * item?.tokens?.length,
      };
    });

    const sumNft = (formatData || []).reduce(
      (prev, item) => prev + Number(item?.current_value),
      0
    );

    const sortBreakdownNft = formatData.sort((a, b) => {
      if (a.current_value < b.current_value) {
        return 1;
      }
      if (a.current_value > b.current_value) {
        return -1;
      }
      return 0;
    });

    const topFiveBreakdownNft = sortBreakdownNft?.slice(0, 5).map((item) => {
      return {
        ...item,
        id: item.collection.id || "N/A",
        name: item.collection.name || "N/A",
      };
    });

    const orderBreakdownNft = sortBreakdownNft?.slice(
      5,
      sortBreakdownNft.length
    );

    const sumOrderBreakdownNft = (orderBreakdownNft || []).reduce(
      (prev, item) => prev + Number(item.current_value),
      0
    );

    const dataPieChartOrderBreakdownNft = [
      {
        name: "Other NFT Collection",
        name_ratio: "Ratio",
        value: (sumOrderBreakdownNft / sumNft) * 100 || 0,
        name_value: "Value",
        value_value: sumOrderBreakdownNft,
        name_balance: "",
        value_balance: 0,
      },
    ];

    const formatDataPieChartTopFiveNft = topFiveBreakdownNft?.map((item) => {
      return {
        name: item.name || item.collection.name,
        name_ratio: "Ratio",
        value: (Number(item.current_value) / sumNft) * 100 || 0,
        name_value: "Value",
        value_value: Number(item.current_value),
        name_balance: "Balance",
        value_balance: Number(item?.tokens?.length),
      };
    });

    dataPieChartNft = {
      sumOrderBreakdownNft,
      formatDataPieChartTopFiveNft,
      dataPieChartOrderBreakdownNft,
    };
  };

  const formatTokenBreakdown = (data) => {
    if (data?.filter((item) => item?.value !== 0).length === 0) {
      isEmptyDataPieTokens = true;
    } else {
      isEmptyDataPieTokens = false;
    }

    const sumToken = (data || []).reduce(
      (prev, item) => prev + Number(item.value),
      0
    );

    const sortBreakdownToken = data?.sort((a, b) => {
      if (a.value < b.value) {
        return 1;
      }
      if (a.value > b.value) {
        return -1;
      }
      return 0;
    });

    const topFiveBreakdownToken = sortBreakdownToken
      ?.slice(0, 5)
      .map((item) => {
        return {
          ...item,
          id: item.id || "N/A",
          symbol: item.symbol || "N/A",
          name: item.name || "N/A",
        };
      });

    const orderBreakdownToken = sortBreakdownToken?.slice(
      5,
      sortBreakdownToken.length
    );

    const sumOrderBreakdownToken = (orderBreakdownToken || []).reduce(
      (prev, item) => prev + Number(item.value),
      0
    );

    const dataPieChartOrderBreakdownToken = [
      {
        logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
        name: "Other tokens",
        symbol: "",
        name_ratio: "Ratio",
        value: (sumOrderBreakdownToken / sumToken) * 100,
        name_value: "Value",
        value_value: sumOrderBreakdownToken,
        name_balance: "",
        value_balance: 0,
      },
    ];

    const formatDataPieChartTopFiveToken = topFiveBreakdownToken?.map(
      (item) => {
        return {
          logo:
            item.logo ||
            "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
          name: item.name || item.symbol,
          symbol: item.symbol,
          name_ratio: "Ratio",
          value: (Number(item.value) / sumToken) * 100,
          name_value: "Value",
          value_value: Number(item.value),
          name_balance: "Balance",
          value_balance: Number(item.amount || item.balance),
        };
      }
    );

    dataPieChartToken = {
      sumOrderBreakdownToken,
      formatDataPieChartTopFiveToken,
      dataPieChartOrderBreakdownToken,
    };
  };

  // compare
  const getAnalyticCompare = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${""}`
    );
    if (response?.error) {
      throw new Error(response?.error);
    }
    return response?.data || [];
  };

  // token holding
  const getVaults = async (address, chain) => {
    const response = await nimbus.get(
      `/v2/investment/${address}/vaults?chain=${
        typeWalletAddress === "SOL" ? "SOL" : ""
      }`
    );
    return response?.data;
  };

  const getHoldingToken = async (address, chain) => {
    const response: HoldingTokenRes = await nimbus
      .get(`/v2/address/${address}/holding?chain=${chain}`)
      .then((response) => response.data);
    return response;
  };

  const formatDataHoldingToken = (dataTokenHolding, dataVaults) => {
    const formatDataTokenHolding = dataTokenHolding?.map((item) => {
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

    const formatData = formatDataTokenHolding
      ?.map((item) => {
        return {
          ...item,
          value:
            Number(item?.amount) * Number(item?.price?.price || item?.rate),
        };
      })
      .sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

    holdingTokenData = formatData;

    closedHoldingPosition = formatData
      ?.filter((item) => item?.profit?.realizedProfit)
      ?.filter((item) => Number(item.amount) === 0);

    formatTokenBreakdown(holdingTokenData);
  };

  // nft holding
  const getHoldingNFT = async (address, chain) => {
    const response: HoldingNFTRes = await nimbus
      .get(`/v2/address/${address}/nft-holding?chain=${chain}`)
      .then((response) => response?.data);
    return response;
  };

  const formatDataHoldingNFT = (data) => {
    holdingNFTData = data;
    formatNFTBreakdown(holdingNFTData);
  };

  // positions
  const getPositions = async (address, chain) => {
    const response: PositionDataRes = await nimbus
      .get(`/address/${address}/positions?chain=${chain}`)
      .then((response) => response.data.positions);
    return response;
  };

  const formatDataPositions = (data) => {
    const formatData = data.map((item) => {
      const groupPosition = groupBy(item.positions, "type");
      return {
        ...item,
        positions: groupPosition,
      };
    });
    positionsData = formatData;
  };

  const getSync = async () => {
    try {
      const response = await nimbus
        .post(`/v2/address/${selectedWallet}/sync?chain=${selectedChain}`, {})
        .then((response) => response);
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const getSyncStatus = async () => {
    try {
      const response = await nimbus
        .get(`/address/${selectedWallet}/sync-status?chain=${selectedChain}`)
        .then((response) => response);
      dataUpdatedTime = response?.data?.lastSync;
      return response;
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const handleSync = async () => {
    console.log("Going to full sync");
    await getSync();
    queryClient.invalidateQueries(["overview"]);
    queryClient.invalidateQueries(["vaults"]);
    queryClient.invalidateQueries(["token-holding"]);
    queryClient.invalidateQueries(["nft-holding"]);
    queryClient.invalidateQueries(["compare"]);
  };

  const handleGetAllData = async (type: string) => {
    isLoadingSync = false;
    enabledFetchAllData = false;

    try {
      let syncStatus = await getSyncStatus();

      // sync data again
      if (type === "reload" || !syncStatus?.data?.lastSync) {
        handleSync();
      }

      // already sync data from db
      if (syncStatus?.data?.lastSync) {
        console.log("start load data (already sync)");
        enabledFetchAllData = true;
        if (
          !$queryOverview.isError &&
          !$queryTokenHolding.isError &&
          !$queryVaults.isError &&
          !$queryNftHolding.isError &&
          !$queryCompare.isError
        ) {
          syncMsg = "";
          isLoadingSync = false;
          isErrorAllData = false;
          return "success";
        } else {
          isErrorAllData = true;
        }
      }

      // check data from db
      if (syncStatus?.data?.canWait) {
        syncMsg = syncStatus?.data?.error;
        isLoadingSync = true;
        // keep call api /sync-status until we can not wait
        while (true) {
          if (syncStatus?.data?.lastSync) {
            console.log("start load data (newest sync)");
            enabledFetchAllData = true;
            if (
              !$queryOverview.isError &&
              !$queryTokenHolding.isError &&
              !$queryVaults.isError &&
              !$queryNftHolding.isError &&
              !$queryCompare.isError
            ) {
              syncMsg = "";
              isLoadingSync = false;
              isErrorAllData = false;
              return "success";
            } else {
              isErrorAllData = true;
            }
            break;
          } else {
            isLoadingSync = true;
            await wait(5000);
            syncStatus = await getSyncStatus();
          }
        }
      } else {
        // Cut call when we can not wait
        syncMsg = syncStatus?.data?.error;
        isLoadingSync = false;
        isErrorAllData = true;
        return "fail";
      }
    } catch (e) {
      console.error("error: ", e);
      isLoadingSync = false;
      isErrorAllData = true;
      return "fail";
    }
  };

  const formatDataOverviewBundlePieChart = (data) => {
    const networth = (data || []).reduce(
      (prev, item) => prev + Number(item.value),
      0
    );
    dataOverviewBundlePieChart = data
      .map((item) => {
        const selectAccount = selectBundle?.accounts.find(
          (data) =>
            data?.id?.toLowerCase() === item?.owner?.toLowerCase() ||
            data?.value?.toLowerCase() === item?.owner?.toLowerCase()
        );
        return {
          logo: selectAccount?.logo,
          label: selectAccount?.label,
          type: selectAccount?.type,
          value: item?.value,
        };
      })
      .map((item) => {
        return {
          logo: item?.logo,
          name: item?.label,
          name_balance: "",
          name_ratio: "Ratio",
          name_value: "Value",
          symbol: item?.type,
          value: (Number(item?.value || 0) / Number(networth || 0)) * 100,
          value_balance: 0,
          value_value: Number(item?.value || 0),
        };
      })
      .sort((a, b) => {
        if (a.value_value < b.value_value) {
          return 1;
        }
        if (a.value_value > b.value_value) {
          return -1;
        }
        return 0;
      });
  };

  // query overview
  $: queryOverview = createQuery({
    queryKey: ["overview", selectedWallet, selectedChain],
    queryFn: () => getOverview(selectedWallet, selectedChain),
    staleTime: Infinity,
    enabled: enabledFetchAllData && selectedWallet.length !== 0,
  });

  $: {
    if (!$queryOverview.isError && $queryOverview.data !== undefined) {
      overviewData = $queryOverview.data;
      overviewDataPerformance = {
        performance: $queryOverview?.data?.performance,
        portfolioChart: $queryOverview?.data?.portfolioChart,
      };

      if (
        $queryOverview?.data?.accounts &&
        $queryOverview?.data?.accounts?.length !== 0
      ) {
        formatDataOverviewBundlePieChart($queryOverview?.data?.accounts);
      }
    }
  }

  // query nft holding
  $: queryNftHolding = createQuery({
    queryKey: ["nft-holding", selectedWallet, selectedChain],
    queryFn: () => getHoldingNFT(selectedWallet, selectedChain),
    staleTime: Infinity,
    enabled:
      enabledFetchAllData &&
      selectedWallet.length !== 0 &&
      selectedChain !== "ALL",
  });

  $: queryAllNftHolding = createQueries(
    chainListQueries.map((item) => {
      return {
        queryKey: ["nft-holding", selectedWallet, selectedChain, item],
        queryFn: () => getHoldingNFT(selectedWallet, item),
        staleTime: Infinity,
        enabled:
          enabledFetchAllData &&
          selectedWallet.length !== 0 &&
          selectedChain === "ALL",
      };
    })
  );

  $: {
    if ($queryAllNftHolding.length !== 0) {
      const allNfts = flatten(
        $queryAllNftHolding
          ?.filter((item) => Array.isArray(item.data))
          ?.map((item) => item.data)
      );
      if (allNfts && allNfts.length !== 0) {
        formatDataHoldingNFT(allNfts);
      }
    }
  }

  $: {
    if (!$queryNftHolding.isError && $queryNftHolding.data !== undefined) {
      formatDataHoldingNFT($queryNftHolding.data);
    }
  }

  // query vaults token holding
  $: queryVaults = createQuery({
    queryKey: ["vaults", selectedWallet, selectedChain],
    queryFn: () => getVaults(selectedWallet, selectedChain),
    staleTime: Infinity,
    enabled: enabledFetchAllData && selectedWallet.length !== 0,
    placeholderData: [],
  });

  // query token holding
  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedWallet, selectedChain],
    queryFn: () => getHoldingToken(selectedWallet, selectedChain),
    staleTime: Infinity,
    enabled:
      enabledFetchAllData &&
      selectedWallet.length !== 0 &&
      selectedChain !== "ALL",
  });

  $: queryAllTokenHolding = createQueries(
    chainListQueries.map((item) => {
      return {
        queryKey: ["token-holding", selectedWallet, selectedChain, item],
        queryFn: () => getHoldingToken(selectedWallet, item),
        staleTime: Infinity,
        enabled:
          enabledFetchAllData &&
          selectedWallet.length !== 0 &&
          selectedChain === "ALL",
      };
    })
  );

  $: {
    if ($queryAllTokenHolding.length !== 0) {
      const allTokens = flatten(
        $queryAllTokenHolding
          ?.filter((item) => Array.isArray(item.data))
          ?.map((item) => item.data)
      );
      if (allTokens && allTokens.length !== 0) {
        formatDataHoldingToken(allTokens, $queryVaults.data);
      }
    }
  }

  $: {
    if (!$queryTokenHolding.isError && $queryTokenHolding.data !== undefined) {
      formatDataHoldingToken($queryTokenHolding.data, $queryVaults.data);
    }
  }

  // query compare
  $: queryCompare = createQuery({
    queryKey: ["compare", selectedWallet, selectedChain],
    queryFn: () => getAnalyticCompare(selectedWallet),
    staleTime: Infinity,
    // enabled: enabledFetchAllData && selectedWallet.length !== 0,
    enabled: false,
  });

  onMount(() => {
    initWS();
    mixpanel.track("portfolio_page", {
      address: selectedWallet,
    });
  });

  onDestroy(() => {
    disconnectWs();
  });

  const handleSelectedTableTokenHolding = (data, selectDatPieChart) => {
    if (data.data && data.data.length !== 0) {
      selectedTokenHolding = data;
      selectedDataPieChart = selectDatPieChart;
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        overviewDataPerformance = {
          performance: [],
          portfolioChart: [],
        };
        selectedTokenHolding = {
          data: [],
          select: [],
        };
        selectedDataPieChart = {};
        dataPieChartToken = {
          sumOrderBreakdownToken: 0,
          formatDataPieChartTopFiveToken: [],
          dataPieChartOrderBreakdownToken: [],
        };
        dataPieChartNft = {
          sumOrderBreakdownNft: 0,
          formatDataPieChartTopFiveNft: [],
          dataPieChartOrderBreakdownNft: [],
        };
        overviewData = {
          breakdownToken: [],
          breakdownNft: [],
          overview: {
            assets: 0,
            assetsChange: 0,
            change: "",
            claimable: 0,
            claimableChange: 0,
            debts: 0,
            debtsChange: 0,
            networth: 0,
            networthChange: 0,
            postionNetworth: 0,
            postionNetworthChange: 0,
          },
          performance: [],
          portfolioChart: [],
          updatedAt: "",
        };
        positionsData = [];
        newsData = [];
        holdingNFTData = [];
        holdingTokenData = [];
        isErrorAllData = false;
        isLoadingSync = false;
        enabledFetchAllData = false;

        handleGetAllData("sync");
      }
    }
  }

  $: loading =
    selectedChain === "ALL"
      ? $queryAllTokenHolding.some((item) => item.isFetching === true) &&
        $queryAllNftHolding.some((item) => item.isFetching === true)
      : !isErrorAllData &&
        $queryTokenHolding.isFetching &&
        $queryVaults.isFetching &&
        $queryOverview.isFetching &&
        !$queryNftHolding.isFetching;

  $: chainListQueries =
    typeWalletAddress?.length !== 0 && typeWalletAddress !== "EVM"
      ? [chainList[0].value]
      : chainList.slice(1).map((item) => item.value);
</script>

<AddressManagement title={MultipleLang.overview}>
  <span slot="reload">
    <div class="flex items-center gap-2 mb-1">
      <div
        class="cursor-pointer"
        class:loading
        on:click={() => {
          handleGetAllData("reload");
          mixpanel.track("user_reload");
        }}
      >
        <img src={Reload} alt="" class="w-4 h-4 xl:w-3 xl:h-3" />
      </div>
      <div class="text-lg font-medium text-white xl:text-xs">
        {#if loading}
          {MultipleLang.updating_data}
        {:else}
          {MultipleLang.data_updated}
          {dayjs(dataUpdatedTime).fromNow()}
        {/if}
      </div>
    </div>
  </span>

  <span slot="overview">
    {#if !isLoadingSync}
      <Overview
        data={overviewData}
        dataTokenHolding={holdingTokenData}
        {totalPositions}
        {totalAssets}
      />
    {/if}
  </span>

  <span slot="body">
    <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-26">
      {#if isLoadingSync}
        <div
          class="portfolio_container text-xl font-medium flex flex-col gap-5 justify-center items-center rounded-[20px] p-6 h-screen"
        >
          {syncMsg}
          {#if syncMsg !== "Invalid address"}
            <Testimonial />
          {/if}
        </div>
      {:else}
        <div>
          {#if syncMsg}
            <div
              class="portfolio_container text-xl font-medium flex flex-col gap-5 justify-center items-center rounded-[20px] p-6 h-screen"
            >
              {syncMsg}
              {#if syncMsg !== "Invalid address"}
                <Testimonial />
              {/if}
            </div>
          {:else}
            <div
              class="portfolio_container flex flex-col gap-7 rounded-[20px] xl:p-8 p-6"
            >
              <Charts
                {handleSelectedTableTokenHolding}
                isLoading={$queryOverview.isFetching}
                isLoadingBreakdownTokens={$queryAllTokenHolding.some(
                  (item) => item.isFetching === true
                )}
                isLoadingBreakdownNfts={$queryAllNftHolding.some(
                  (item) => item.isFetching === true
                )}
                holdingTokenData={holdingTokenData?.filter(
                  (item) => Number(item.amount) > 0
                )}
                {overviewDataPerformance}
                {dataPieChartToken}
                {dataPieChartNft}
                {isEmptyDataPieTokens}
                {isEmptyDataPieNfts}
                {dataOverviewBundlePieChart}
              />

              <!-- {#if typeWalletAddress === "EVM" || typeWalletAddress === "CEX" || typeWalletAddress === "BUNDLE"}
                <RiskReturn
                  isLoading={$queryCompare.isFetching}
                  isError={$queryCompare.isError}
                  data={$queryCompare.data}
                />
              {/if} -->

              <Holding
                {selectedWallet}
                isLoadingNFT={selectedChain === "ALL"
                  ? $queryAllNftHolding.some((item) => item.isFetching === true)
                  : $queryNftHolding.isFetching}
                isLoadingToken={selectedChain === "ALL"
                  ? $queryAllTokenHolding.some(
                      (item) => item.isFetching === true
                    )
                  : $queryTokenHolding.isFetching}
                holdingTokenData={holdingTokenData?.filter(
                  (item) => Number(item.amount) > 0
                )}
                {selectedTokenHolding}
                {selectedDataPieChart}
                {holdingNFTData}
                bind:totalAssets
              />

              {#if typeWalletAddress !== "BTC"}
                <ClosedTokenPosition
                  {selectedWallet}
                  isLoadingNFT={selectedChain === "ALL"
                    ? $queryAllNftHolding.some(
                        (item) => item.isFetching === true
                      )
                    : $queryNftHolding.isFetching}
                  isLoadingToken={selectedChain === "ALL"
                    ? $queryAllTokenHolding.some(
                        (item) => item.isFetching === true
                      )
                    : $queryTokenHolding.isFetching}
                  holdingTokenData={closedHoldingPosition}
                  {holdingNFTData}
                />
              {/if}

              <!-- <News isLoading={false} data={newsData} /> -->
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </span>
</AddressManagement>

<style>
  .loading {
    animation-name: loading;
    animation-duration: 1.4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @keyframes loading {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  :global(body) .portfolio_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .portfolio_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }
</style>
