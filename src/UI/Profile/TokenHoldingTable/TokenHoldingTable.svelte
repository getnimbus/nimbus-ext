<script lang="ts">
  import { chain, typeWallet } from "~/store";
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

    holdingTokenData = formatData?.filter((item) => Number(item.amount) > 0);

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
