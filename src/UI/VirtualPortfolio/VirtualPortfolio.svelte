<script lang="ts">
  import { wallet } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { getVirtualPortfolioPerformance } from "~/lib/queryAPI";

  export let listTokenHolding;
  export let isLoading;
  export let isQuery;
  export let virtualPortfolioId;

  import Allocation from "./Allocation.svelte";
  import Performance from "./Performance.svelte";
  import Holding from "./Holding.svelte";

  $: queryVirtualPortfolioPerformance = createQuery({
    queryKey: ["virtual-portfolio-performance", $wallet, virtualPortfolioId],
    queryFn: () => getVirtualPortfolioPerformance($wallet, virtualPortfolioId),
    staleTime: Infinity,
    retry: false,
    enabled: Boolean(
      $wallet &&
        $wallet?.length !== 0 &&
        isQuery &&
        virtualPortfolioId &&
        virtualPortfolioId?.length !== 0
    ),
  });

  let dataVirtualPortfolioPerformance = {};

  $: {
    if (
      !$queryVirtualPortfolioPerformance.isError &&
      $queryVirtualPortfolioPerformance.data !== undefined
    ) {
      dataVirtualPortfolioPerformance =
        $queryVirtualPortfolioPerformance.data?.data;
    }
  }
</script>

<div class="flex flex-col gap-6">
  <div class="grid xl:grid-cols-2 grid-cols-1 gap-6">
    <Allocation {isLoading} {listTokenHolding} />
    <Performance
      isLoading={isLoading || $queryVirtualPortfolioPerformance.isFetching}
      {dataVirtualPortfolioPerformance}
    />
  </div>
  <Holding {isLoading} {listTokenHolding} />
</div>

<style></style>
