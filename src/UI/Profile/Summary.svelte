<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { formatBalance } from "~/utils";
  import { user } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let selectedAddress;

  let topThreeTokenHolding = [];
  let closedHoldingPosition = [];
  let netWorth = 0;

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

  const getHoldingToken = async (address) => {
    const validateAccount = await handleValidateAddress(address);

    const response = await nimbus
      .get(
        `/v2/address/${address}/holding?chain=${
          validateAccount?.type === "BUNDLE" ? "" : validateAccount?.type
        }`
      )
      .then((response) => response.data);
    return response;
  };

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedAddress],
    queryFn: () => getHoldingToken(selectedAddress),
    staleTime: Infinity,
    enabled: selectedAddress?.length !== 0 && Object.keys($user).length !== 0,
  });

  $: {
    if (
      !$queryTokenHolding.isError &&
      $queryTokenHolding.data &&
      $queryTokenHolding?.data !== undefined
    ) {
      const data = $queryTokenHolding?.data?.filter(
        (item) => Number(item?.amount) !== 0 && Number(item.price.price) !== 0
      );

      const formatData = data.map((item) => {
        return {
          ...item,
          value: Number(item.amount) * Number(item.price.price),
        };
      });

      closedHoldingPosition = $queryTokenHolding?.data
        ?.filter(
          (item) =>
            item?.profit?.realizedProfit !== undefined &&
            Number(item.amount) === 0
        )
        .sort(
          (a, b) =>
            Number(b?.profit.realizedProfit) - Number(a?.profit.realizedProfit)
        );

      netWorth = formatData.reduce((prev, item) => prev + item.value, 0);

      const sortFormatToken = formatData.sort((a, b) => b.value - a.value);

      topThreeTokenHolding = sortFormatToken.slice(0, 3).map((item) => {
        return {
          ...item,
          ratio: (item.value / netWorth) * 100,
        };
      });
    }
  }
</script>

<div class="xl:col-span-2 col-span-4 border border_0000001a rounded-xl">
  {#if $queryTokenHolding.isFetching}
    <div class="w-full h-full flex justify-center items-center p-6">
      <Loading />
    </div>
  {:else}
    <div class="flex flex-col gap-3 p-6">
      {#if netWorth !== 0}
        <div>
          Your Portfolio is value at
          <span class="font-medium">
            ${formatBalance(netWorth)}
          </span>
          is diversified across
          {#each topThreeTokenHolding as item}
            <span class="font-medium">
              {item.name}
              (<TooltipNumber number={item.ratio} type="percent" />%),
            </span>{" "}
          {/each} and other assets.
        </div>
        {#if closedHoldingPosition.length !== 0 && closedHoldingPosition[0]?.profit?.realizedProfit > 0}
          <div>
            The best trading is
            <span class="font-medium">
              {closedHoldingPosition[0]?.name}
            </span>
            with
            <span class="font-medium text-green-400">
              ${formatBalance(closedHoldingPosition[0]?.profit?.realizedProfit)}
              earning
            </span>
          </div>
        {/if}
      {:else}
        <div>
          Your Portfolio is value at
          <span class="font-medium">
            ${formatBalance(netWorth)}
          </span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>
