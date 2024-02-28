<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { groupBy, flatten } from "lodash";
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { drivePortfolio, typePortfolioPage } from "~/utils";
  import { chainList, chainMoveList } from "~/lib/chains";
  import { wait } from "../entries/background/utils";
  import {
    tab,
    wallet,
    chain,
    typeWallet,
    selectedBundle,
    triggerUpdateBundle,
    pastProfit,
  } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { nimbus } from "~/lib/network";
  import {
    createQuery,
    createQueries,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";

  import type { NewData, NewDataRes } from "~/types/NewData";
  import type { OverviewData, OverviewDataRes } from "~/types/OverviewData";
  import type { PositionData, PositionDataRes } from "~/types/PositionData";
  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";
  import type { NFTData, HoldingNFTRes } from "~/types/HoldingNFTData";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Overview from "~/UI/Portfolio/Overview.svelte";
  import Testimonial from "~/UI/Testimonial/Testimonial.svelte";
  import Charts from "~/UI/Portfolio/Charts.svelte";
  import Holding from "~/UI/Portfolio/Holding.svelte";
  import PerformanceSummary from "~/UI/Portfolio/PerformanceSummary.svelte";
  import RiskReturn from "~/UI/Portfolio/RiskReturn.svelte";
  import News from "~/UI/Portfolio/News.svelte";
  import Positions from "~/UI/Portfolio/Positions.svelte";
  import Button from "~/components/Button.svelte";
  import "~/components/Tooltip.custom.svelte";

  import Reload from "~/assets/reload.svg";
  import defaultToken from "~/assets/defaultToken.png";

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

  let enabledFetchAllData = false;
  let isErrorAllData = false;
  let isLoadingSync = false;

  let overviewData: any = {
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

  let newsData: any = [];

  let formatHoldingTokenData: any = [];
  let holdingTokenData: any = [];
  let holdingNFTData: any = [];

  let positionsData: any = [];
  let overviewDataPerformance = {
    performance: [],
    portfolioChart: [],
  };
  let dataOverviewBundlePieChart = [];
  let dataUpdatedTime;
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

  let chainListQueries = [];

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return response?.data;
    } catch (e) {
      console.error(e);
      return {
        address: "",
        type: "",
      };
    }
  };

  const getSync = async () => {
    try {
      const validateAccount = await handleValidateAddress($wallet);
      await nimbus
        .get(
          `/v2/address/${$wallet}/sync?chain=${
            validateAccount?.type === "BUNDLE" ? "" : validateAccount?.type
          }`
        )
        .then((response) => response);
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const getSyncStatus = async () => {
    try {
      const validateAccount = await handleValidateAddress($wallet);
      const response: any = await nimbus
        .get(
          `/v2/address/${$wallet}/sync-status?chain=${
            validateAccount?.type === "BUNDLE" ? "" : validateAccount?.type
          }`
        )
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
      let syncStatus: any = await getSyncStatus();

      // sync data again
      if (type === "reload" || !syncStatus?.data?.lastSync) {
        await handleSync();
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
        } else {
          isErrorAllData = true;
        }
      }

      // check data from db
      if (!syncStatus?.data?.lastSync) {
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
        }

        if (!syncStatus?.data?.canWait) {
          // Cut call when we can not wait
          syncMsg = syncStatus?.data?.error;
          isLoadingSync = false;
          isErrorAllData = true;
        }
      }
    } catch (e) {
      console.error("error: ", e);
      isLoadingSync = false;
      isErrorAllData = true;
    }
  };

  //// POSITIONS
  const getPositions = async (address, chain) => {
    const response: any = await nimbus
      .get(`/address/${address}/positions?chain=${chain}`)
      .then((response) => response?.data?.positions);
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

  //// OVERVIEW
  const getOverview = async (address, chain) => {
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = await handleValidateAddress(address);
      addressChain = validateAccount?.type;
    }

    const response: any = await nimbus
      .get(
        `/v2/address/${address}/overview?chain=${
          addressChain === "BUNDLE" ? "" : addressChain
        }`
      )
      .then((response) => response?.data);
    return response;
  };

  $: queryOverview = createQuery({
    queryKey: ["overview", $wallet, $chain],
    queryFn: () => getOverview($wallet, $chain),
    staleTime: Infinity,
    enabled: Boolean(enabledFetchAllData && $wallet && $wallet?.length !== 0),
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

  const formatDataOverviewBundlePieChart = (data) => {
    const networth = (data || []).reduce(
      (prev, item) => prev + Number(item.value),
      0
    );
    dataOverviewBundlePieChart = data
      .map((item) => {
        const selectAccount = $selectedBundle?.accounts.find(
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

  //// NFT HOLDING
  const getHoldingNFT = async (address, chain) => {
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = await handleValidateAddress(address);
      addressChain = validateAccount?.type;
    }

    const response: any = await nimbus
      .get(
        `/v2/address/${address}/nft-holding?chain=${
          addressChain === "BUNDLE" ? "" : addressChain
        }`
      )
      .then((response) => response?.data);
    return response;
  };

  $: queryNftHolding = createQuery({
    queryKey: ["nft-holding", $wallet, $chain],
    queryFn: () => getHoldingNFT($wallet, $chain),
    staleTime: Infinity,
    enabled: Boolean(
      enabledFetchAllData &&
        $wallet &&
        $wallet?.length !== 0 &&
        $chain.length !== 0 &&
        $chain !== "ALL" &&
        $tab === "nft"
    ),
  });

  $: queryAllNftHolding = createQueries(
    chainListQueries.map((item) => {
      return {
        queryKey: ["nft-holding", $wallet, $chain, item],
        queryFn: () => getHoldingNFT($wallet, item),
        staleTime: Infinity,
        enabled: Boolean(
          enabledFetchAllData &&
            $wallet &&
            $wallet?.length !== 0 &&
            $chain.length !== 0 &&
            $chain === "ALL" &&
            $tab === "nft"
        ),
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

  const formatDataHoldingNFT = (data) => {
    holdingNFTData = data;
    formatNFTBreakdown(holdingNFTData);
  };

  //// VAULTS
  const getVaults = async (address, chain) => {
    return []; // TODO: Fix the api query time later
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = await handleValidateAddress(address);
      addressChain = validateAccount?.type;
    }

    const response: any = await nimbus.get(
      `/v2/investment/${address}/vaults?chain=${
        addressChain === "BUNDLE" ? "" : addressChain
      }`
    );
    return response?.data;
  };

  $: queryVaults = createQuery({
    queryKey: ["vaults", $wallet, $chain],
    queryFn: () => getVaults($wallet, $chain),
    staleTime: Infinity,
    enabled: Boolean(enabledFetchAllData && $wallet && $wallet?.length !== 0),
    placeholderData: [],
  });

  //// TOKEN HOLDING
  const getHoldingToken = async (address, chain) => {
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = await handleValidateAddress(address);
      addressChain = validateAccount?.type;
    }

    const response: any = await nimbus
      .get(
        `/v2/address/${address}/holding?chain=${
          addressChain === "BUNDLE" ? "" : addressChain
        }`
      )
      .then((response) => response?.data);
    return response;
  };

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", $wallet, $chain],
    queryFn: () => getHoldingToken($wallet, $chain),
    staleTime: Infinity,
    enabled: Boolean(
      enabledFetchAllData &&
        $wallet &&
        $wallet?.length !== 0 &&
        $chain.length !== 0 &&
        $chain !== "ALL" &&
        $tab === "token"
    ),
  });

  $: queryAllTokenHolding = createQueries(
    chainListQueries.map((item) => {
      return {
        queryKey: ["token-holding", $wallet, $chain, item],
        queryFn: () => getHoldingToken($wallet, item),
        staleTime: Infinity,
        enabled: Boolean(
          enabledFetchAllData &&
            $wallet &&
            $wallet?.length !== 0 &&
            $chain.length !== 0 &&
            $chain === "ALL" &&
            $tab === "token"
        ),
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
        formatDataHoldingToken(allTokens);
      }
    }
  }

  $: {
    if (!$queryTokenHolding.isError && $queryTokenHolding.data !== undefined) {
      formatDataHoldingToken($queryTokenHolding.data);
    }
  }

  const formatDataHoldingToken = (data) => {
    formatHoldingTokenData = data
      ?.map((item) => {
        return {
          ...item,
          value: Number(item?.amount) * Number(item?.price?.price),
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

    holdingTokenData = formatHoldingTokenData?.filter(
      (item) => Number(item.amount) > 0
    );

    formatTokenBreakdown(holdingTokenData);
  };

  const formatNFTBreakdown = (data) => {
    if (data?.length === 0) {
      isEmptyDataPieNfts = true;
    } else {
      isEmptyDataPieNfts = false;
    }

    const formatData = data
      .map((item) => {
        return {
          ...item,
          current_value:
            item?.floorPrice * item?.marketPrice * item?.tokens?.length,
        };
      })
      .filter((item) => Number(item.current_value) > 0);

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
    if (data && data?.length === 0) {
      isEmptyDataPieTokens = true;
    } else {
      isEmptyDataPieTokens = false;
    }

    const formatData = data
      .map((item) => {
        return {
          ...item,
          value: Number(item?.amount || 0) * Number(item?.price?.price || 0),
        };
      })
      .filter((item) => Number(item.value) > 0);

    const sumToken = (formatData || []).reduce(
      (prev, item) => prev + Number(item?.value),
      0
    );

    const sortBreakdownToken = formatData?.sort((a, b) => {
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
        logo: defaultToken,
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
          logo: item.logo || defaultToken,
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

  //// COMPARE
  const getAnalyticCompare = async (address) => {
    const response: any = await nimbus.get(
      `/v2/analysis/${address}/compare?compareAddress=${""}`
    );
    return response?.data || [];
  };

  $: queryCompare = createQuery({
    queryKey: ["compare", $wallet, $chain],
    queryFn: () => getAnalyticCompare($wallet),
    staleTime: Infinity,
    // enabled: enabledFetchAllData && $wallet && $wallet?.length !== 0,
    enabled: false,
  });

  onMount(() => {
    mixpanel.track("portfolio_page", {
      address: $wallet,
    });
  });

  const handleSelectedTableTokenHolding = (data, selectDatPieChart) => {
    if (data.data && data.data.length !== 0) {
      selectedTokenHolding = data;
      selectedDataPieChart = selectDatPieChart;
    }
  };

  $: {
    if ($wallet || $chain) {
      if ($wallet?.length !== 0 && $chain?.length !== 0) {
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
    $chain === "ALL"
      ? $queryAllTokenHolding &&
        $queryAllTokenHolding.some((item) => item.isFetching === true) &&
        $queryAllNftHolding &&
        $queryAllNftHolding.some((item) => item.isFetching === true) &&
        $queryVaults.isFetching &&
        $queryOverview.isFetching
      : !isErrorAllData &&
        $queryTokenHolding.isFetching &&
        $queryNftHolding.isFetching &&
        $queryVaults.isFetching &&
        $queryOverview.isFetching;

  $: isPortfolioReady =
    $chain === "ALL"
      ? $queryAllTokenHolding.every((item) => item.isFetched) &&
        $queryAllNftHolding.every((item) => item.isFetched) &&
        $queryVaults.isFetched &&
        $queryOverview.isFetched
      : $queryTokenHolding.isFetched &&
        $queryNftHolding.isFetched &&
        $queryVaults.isFetched &&
        $queryOverview.isFetched;

  $: {
    if ($typeWallet?.length !== 0 && $typeWallet === "EVM") {
      chainListQueries = chainList.slice(1).map((item) => item.value);
    } else if ($typeWallet?.length !== 0 && $typeWallet === "MOVE") {
      chainListQueries = chainMoveList.slice(1).map((item) => item.value);
    } else {
      chainListQueries = [chainMoveList[0]?.value];
    }
  }

  $: {
    if ($triggerUpdateBundle) {
      handleGetAllData("reload");
      triggerUpdateBundle.update((n) => (n = false));
    }
  }

  $: {
    if (!localStorage.getItem("view-portfolio-tour") && isPortfolioReady) {
      drivePortfolio().drive();
      localStorage.setItem("view-portfolio-tour", "true");
    }
  }
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
      <Overview data={overviewData} />
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
              <div class="flex items-center gap-1">
                <AnimateSharedLayout>
                  {#each typePortfolioPage as type}
                    <div
                      class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                      on:click={() => {
                        tab.update((n) => (n = type.value));
                        window.history.replaceState(
                          null,
                          "",
                          window.location.pathname +
                            `?tab=${type.value}&type=${$typeWallet}&chain=${$chain}&address=${$wallet}`
                        );
                      }}
                    >
                      <div
                        class={`relative z-2 ${
                          $tab === type.value && "text-white"
                        }`}
                      >
                        {type.label}
                      </div>
                      {#if type.value === $tab}
                        <Motion
                          let:motion
                          layoutId="active-pill"
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <div
                            class="absolute inset-0 rounded-full bg-[#1E96FC] z-1"
                            use:motion
                          />
                        </Motion>
                      {/if}
                    </div>
                  {/each}
                </AnimateSharedLayout>
              </div>

              {#if $tab !== "summary"}
                <Charts
                  {handleSelectedTableTokenHolding}
                  isLoading={$queryOverview.isFetching}
                  isLoadingBreakdownTokens={$queryAllTokenHolding.some(
                    (item) => item.isFetching === true
                  )}
                  isLoadingBreakdownNfts={$queryAllNftHolding.some(
                    (item) => item.isFetching === true
                  )}
                  {holdingTokenData}
                  {overviewDataPerformance}
                  {dataPieChartToken}
                  {dataPieChartNft}
                  {isEmptyDataPieTokens}
                  {isEmptyDataPieNfts}
                  {dataOverviewBundlePieChart}
                  selectedType={$tab}
                />

                <!-- {#if $typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "CEX" || $typeWallet === "BUNDLE"}
                  <RiskReturn
                    isLoading={$queryCompare.isFetching}
                    isError={$queryCompare.isError}
                    data={$queryCompare.data}
                  />
                {/if} -->

                <Holding
                  isLoadingNFT={$chain === "ALL"
                    ? $queryAllNftHolding.some(
                        (item) => item.isFetching === true
                      )
                    : $queryNftHolding.isFetching}
                  isLoadingToken={$chain === "ALL"
                    ? $queryAllTokenHolding.some(
                        (item) => item.isFetching === true
                      )
                    : $queryTokenHolding.isFetching}
                  {holdingTokenData}
                  {holdingNFTData}
                  dataVaults={$queryVaults.data}
                  {selectedTokenHolding}
                  {selectedDataPieChart}
                  selectedType={$tab}
                  {formatHoldingTokenData}
                />
              {/if}

              {#if $tab === "summary"}
                <PerformanceSummary />
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
