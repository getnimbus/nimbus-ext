<script lang="ts">
  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { formatBalance } from "~/utils";

  export let userData;
  let ratioTop3Token = [];
  let closedHoldingPosition;
  let netWorth = 0;

  const formatTokenUser = (data) => {
    return data.filter((e) => Number(e.amount) !== 0 && e.price.price != 0);
  };

  const formatClosedToken = (data) => {
    return data
      .filter((e) => Number(e.amount) === 0)
      .filter((item) => item?.profit?.realizedProfit)
      .sort(
        (a, b) =>
          Number(b?.profit.realizedProfit) - Number(a?.profit.realizedProfit)
      );
  };

  $: {
    if (userData !== undefined) {
      try {
        const formatTokenData = formatTokenUser(userData);
        closedHoldingPosition = formatClosedToken(userData);

        netWorth = formatTokenData.reduce((a, b) => {
          const value = Number(b.amount) * b.price.price;
          return a + value;
        }, 0);

        const sortFormatToken = formatTokenData.sort(
          (a, b) =>
            Number(b.amount) * b.price.price - Number(a.amount) * a.price.price
        );

        for (let i = 0; i < 3; i++) {
          ratioTop3Token[i] = {
            ratio:
              ((Number(sortFormatToken[i]?.amount) *
                sortFormatToken[i]?.price?.price) /
                netWorth) *
              100,
            name: sortFormatToken[i]?.name,
          };
        }
      } catch (error) {
        console.error("Error : ", error);
      }
    }
  }

  // $: console.log("Networth : ", netWorth);
  // $: console.log("ratio token data : ", ratioTop3Token);
</script>

{#if !userData}
  <div class="flex items-center justify-center h-screen">
    <Loading />
  </div>
{:else}
  <div class="col-span-2 border shadow-light-500 shadow rounded-xl p-7">
    <div class="font-extralight leading-7 flex flex-col gap-3">
      <div>
        Your Portfolio is value at
        <span class="font-medium">
          ${formatBalance(netWorth)}
        </span>
        , is diversified across
        <span class="font-medium">
          {ratioTop3Token[0]?.name}
          (<TooltipNumber number={ratioTop3Token[0]?.ratio} type="percent" />%)
        </span>,
        <span class="font-medium">
          {ratioTop3Token[1]?.name}
          (<TooltipNumber number={ratioTop3Token[1]?.ratio} type="percent" />%)
        </span>,
        <span class="font-medium">
          {ratioTop3Token[2]?.name}
          (<TooltipNumber number={ratioTop3Token[2]?.ratio} type="percent" />%)
        </span> and other assets.
      </div>
      <div>
        The best trading is
        <span class="font-medium">
          {closedHoldingPosition[0]?.name}
        </span>
        with
        <span class="font-medium text-green-400">
          ${formatBalance(closedHoldingPosition[0]?.profit?.realizedProfit)} earning
        </span>
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global></style>
