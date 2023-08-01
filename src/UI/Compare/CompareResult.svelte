<script lang="ts">
  export let holdingTokenData;
  export let holdingTokenDataCompare;

  $: {
    if (
      holdingTokenData &&
      holdingTokenData.length !== 0 &&
      holdingTokenDataCompare &&
      holdingTokenDataCompare.length !== 0
    ) {
      const sumAllTokenHolding = holdingTokenData.reduce(
        (prev, item) => prev + item.value,
        0
      );
      const sumAllTokensHoldingCompare = holdingTokenDataCompare.reduce(
        (prev, item) => prev + item.value,
        0
      );

      const formatHoldingTokenData = holdingTokenData.map((item) => {
        return {
          ...item,
          ratio: (item.value / sumAllTokenHolding) * 100,
        };
      });

      const formatHoldingTokenDataCompare = holdingTokenDataCompare.map(
        (item) => {
          return {
            ...item,
            ratio: (item.value / sumAllTokensHoldingCompare) * 100,
          };
        }
      );

      console.log({
        formatHoldingTokenData,
        formatHoldingTokenDataCompare,
      });
    }
  }
</script>

<div
  class="h-[563px] border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-4"
>
  <div class="xl:text-2xl text-4xl font-medium text-black">
    Re-balance Action
  </div>
  <div
    class="border border-[#0000000d] rounded-[10px] xl:overflow-visible overflow-x-auto"
  >
    hello
  </div>
</div>

<style></style>
