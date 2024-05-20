<script lang="ts">
  import { createQueries, createQuery } from "@tanstack/svelte-query";
  import { chainList, chainMoveList } from "~/lib/chains";
  import { totalTokens, chain, wallet, typeWallet } from "~/store";
  import { handleValidateAddress, getHoldingToken } from "~/lib/queryAPI";
  import { flatten } from "lodash";

  export let selectedVirtualPortfolio;

  let totalNetworth = 0;
  let chainListQueries = [];

  $: {
    if ($typeWallet?.length !== 0 && $typeWallet === "EVM") {
      chainListQueries = chainList.slice(1).map((item) => item.value);
    } else if ($typeWallet?.length !== 0 && $typeWallet === "MOVE") {
      chainListQueries = chainMoveList.slice(1).map((item) => item.value);
    } else {
      chainListQueries = [chainMoveList[0]?.value];
    }
  }

  $: queryValidate = createQuery({
    queryKey: ["validate", $wallet],
    queryFn: () => handleValidateAddress($wallet),
    staleTime: Infinity,
    retry: false,
    enabled: Boolean($wallet && $wallet?.length !== 0 && $totalTokens === 0),
  });

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", $wallet, $chain],
    queryFn: () => getHoldingToken($wallet, $chain, $queryValidate.data),
    staleTime: Infinity,
    enabled: Boolean(
      $wallet &&
        $wallet?.length !== 0 &&
        $chain.length !== 0 &&
        $chain !== "ALL" &&
        !$queryValidate.isFetching &&
        $totalTokens === 0
    ),
  });

  $: queryAllTokenHolding = createQueries(
    chainListQueries.map((item) => {
      return {
        queryKey: ["token-holding", $wallet, $chain, item],
        queryFn: () => getHoldingToken($wallet, item, $queryValidate.data),
        staleTime: Infinity,
        enabled: Boolean(
          $wallet &&
            $wallet?.length !== 0 &&
            $chain.length !== 0 &&
            $chain === "ALL" &&
            !$queryValidate.isFetching &&
            $totalTokens === 0
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

    totalNetworth = formatData.reduce((prev, item) => prev + item.value, 0);
  };

  $: {
    if (
      ($chain === "ALL"
        ? !$queryAllTokenHolding.some((item) => item.isFetching === true)
        : !$queryTokenHolding.isFetching) &&
      totalNetworth
    ) {
      totalTokens.update((n) => (n = totalNetworth));
    }
  }

  // $: console.log("HELLO WORLD: ", selectedVirtualPortfolio);
  // $: console.log("TOTAL NETWORTH: ", $totalTokens);
</script>

<div class="flex flex-col gap-6">
  {selectedVirtualPortfolio?.name}
  <div class="grid xl:grid-cols-2 grid-cols-1 gap-6">
    <div class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4">
      Allocation
    </div>

    <div class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4">
      Performance
    </div>
  </div>

  <div class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4">
    Holding
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
