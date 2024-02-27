<script lang="ts">
  import {
    totalAssets,
    unrealizedProfit,
    realizedProfit,
    pastProfit,
    chain,
    typeWallet,
  } from "~/store";
  import { createQueries, createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { chainList, chainMoveList } from "~/lib/chains";
  import { flatten } from "lodash";

  import TokenHoldingTrades from "./TokenHoldingTrades.svelte";
  import ClosedHoldingTrades from "./ClosedHoldingTrades.svelte";
  import RuggedHoldingTrades from "./RuggedHoldingTrades.svelte";

  export let selectedAddress;
  export let isSync = false;
  export let enabledFetchAllData = false;

  let chainListQueries = [];
  let holdingTokenData = [];
  let closedHoldingPosition = [];
  let ruggedHoldingPosition = [];

  let sumTokens = 0;
  let sumNFT = 0;

  $: isFetch = isSync ? enabledFetchAllData : true;

  const handleValidateAddress = async (address: string) => {
    try {
      const response: any = await nimbus.get(`/v2/address/${address}/validate`);
      return response?.data;
    } catch (e) {
      console.error(e);
      return {
        address: "",
        type: "",
      };
    }
  };

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
      .then((response: any) => response?.data);
    return response;
  };

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedAddress, $chain],
    queryFn: () => getHoldingToken(selectedAddress, $chain),
    staleTime: Infinity,
    enabled: Boolean(
      enabledFetchAllData &&
        selectedAddress &&
        selectedAddress?.length !== 0 &&
        $chain.length !== 0 &&
        $chain !== "ALL" &&
        isFetch
    ),
  });

  $: queryAllTokenHolding = createQueries(
    chainListQueries.map((item) => {
      return {
        queryKey: ["token-holding", selectedAddress, $chain, item],
        queryFn: () => getHoldingToken(selectedAddress, item),
        staleTime: Infinity,
        enabled: Boolean(
          enabledFetchAllData &&
            selectedAddress &&
            selectedAddress?.length !== 0 &&
            $chain.length !== 0 &&
            $chain === "ALL" &&
            isFetch
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
    const formatData = data
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

    sumTokens = formatData.reduce((prev, item) => prev + item.value, 0);

    holdingTokenData = formatData?.filter((item) => Number(item.amount) > 0);

    realizedProfit.update(
      (n) =>
        (n = (formatData || [])
          ?.filter((item) => item?.profit?.realizedProfit !== undefined)
          ?.map((item) => {
            return {
              realized_profit: item?.profit?.realizedProfit || 0,
            };
          })
          .reduce((prev, item) => prev + Number(item.realized_profit), 0))
    );

    unrealizedProfit.update(
      (n) =>
        (n = (formatData || [])
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
          .reduce((prev, item) => prev + Number(item.unrealized_profit), 0))
    );

    pastProfit.update(
      (n) =>
        (n = (formatData || [])
          .filter((item) => item?.profit?.realizedProfit !== undefined)
          .reduce(
            (prev, item) => prev + Number(item?.profit?.realizedProfit),
            0
          ))
    );

    closedHoldingPosition = formatData?.filter(
      (item) =>
        item?.profit?.realizedProfit !== undefined && Number(item.amount) === 0
    );

    ruggedHoldingPosition = formatData?.filter(
      (item) =>
        item?.profit?.realizedProfit !== undefined &&
        Number(item?.price?.price || item?.rate) === 0 &&
        Number(item.amount) === 0
    );
  };

  $: {
    if ($typeWallet?.length !== 0 && $typeWallet === "EVM") {
      chainListQueries = chainList.slice(1).map((item) => item.value);
    } else if ($typeWallet?.length !== 0 && $typeWallet === "MOVE") {
      chainListQueries = chainMoveList.slice(1).map((item) => item.value);
    } else {
      chainListQueries = [chainMoveList[0]?.value];
    }
  }

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
    queryKey: ["nft-holding", selectedAddress, $chain],
    queryFn: () => getHoldingNFT(selectedAddress, $chain),
    staleTime: Infinity,
    enabled: Boolean(
      enabledFetchAllData &&
        selectedAddress &&
        selectedAddress?.length !== 0 &&
        $chain.length !== 0 &&
        $chain !== "ALL" &&
        isFetch
    ),
  });

  $: queryAllNftHolding = createQueries(
    chainListQueries.map((item) => {
      return {
        queryKey: ["nft-holding", selectedAddress, $chain, item],
        queryFn: () => getHoldingNFT(selectedAddress, item),
        staleTime: Infinity,
        enabled: Boolean(
          enabledFetchAllData &&
            selectedAddress &&
            selectedAddress?.length !== 0 &&
            $chain.length !== 0 &&
            $chain === "ALL" &&
            isFetch
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
    const formatDataNFT = data
      .map((item) => {
        return {
          ...item,
          current_native_token: Number(item?.floorPrice) * item?.tokens?.length,
          current_value:
            Number(item?.floorPrice) *
            Number(item?.marketPrice) *
            item?.tokens?.length,
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
    sumNFT = formatDataNFT.reduce((prev, item) => prev + item.current_value, 0);
  };

  $: {
    if (
      ($chain === "ALL"
        ? !$queryAllTokenHolding.some((item) => item.isFetching === true)
        : !$queryTokenHolding.isFetching) &&
      ($chain === "ALL"
        ? !$queryAllNftHolding.some((item) => item.isFetching === true)
        : !$queryNftHolding.isFetching) &&
      (sumTokens || sumNFT)
    ) {
      totalAssets.update((n) => (n = sumNFT + sumTokens));
    }
  }
</script>

<TokenHoldingTrades
  {holdingTokenData}
  isLoading={$chain === "ALL"
    ? $queryAllTokenHolding.some((item) => item.isFetching === true)
    : $queryTokenHolding.isFetching}
/>

<ClosedHoldingTrades
  holdingTokenData={closedHoldingPosition}
  isLoading={$chain === "ALL"
    ? $queryAllTokenHolding.some((item) => item.isFetching === true)
    : $queryTokenHolding.isFetching}
/>

<RuggedHoldingTrades
  holdingTokenData={ruggedHoldingPosition}
  isLoading={$chain === "ALL"
    ? $queryAllTokenHolding.some((item) => item.isFetching === true)
    : $queryTokenHolding.isFetching}
/>

<style windi:preflights:global windi:safelist:global>
</style>
