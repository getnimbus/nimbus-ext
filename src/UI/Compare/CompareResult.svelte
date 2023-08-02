<script lang="ts">
  import { i18n } from "~/lib/i18n";
  import { getAddressContext } from "~/utils";
  import { typeWallet, wallet } from "~/store";

  import Select from "~/components/Select.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TokenHoldingCompare from "./TokenHoldingCompare.svelte";

  export let holdingTokenData;
  export let holdingTokenDataCompare;

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  const typeList = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Buy",
      value: "buy",
    },
    {
      label: "Sell",
      value: "sell",
    },
  ];

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let selectedWallet = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let tokenHoldingDataFormat = [];
  let selectedType;
  let filteredData = [];

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

      // re-calculate ratio every token in base portfolio that both base portfolio and compare portfolio have
      const formatRatioHoldingTokenData = formatHoldingTokenData.map((item) => {
        const tokenDataCompareSame = formatHoldingTokenDataCompare.find(
          (compareToken) =>
            compareToken.contract_address === item.contract_address &&
            compareToken.chain === item.chain
        );
        if (
          tokenDataCompareSame !== undefined &&
          Object.keys(tokenDataCompareSame).length !== 0 &&
          tokenDataCompareSame.contract_address === item.contract_address
        ) {
          let ratio = 0;
          if (tokenDataCompareSame.ratio === 0) {
            ratio = -item.ratio;
          } else {
            ratio = tokenDataCompareSame.ratio - item.ratio;
          }
          return {
            ...item,
            ratio,
          };
        }

        return item;
      });

      const isItemExists = (id, chain) => {
        return formatRatioHoldingTokenData.some(
          (item) => item.contract_address === id && item.chain === chain
        );
      };

      // token base portfolio don't have
      const filterHoldingTokenDataCompare =
        formatHoldingTokenDataCompare.filter((item) => {
          return !isItemExists(item.contract_address, item.chain);
        });

      const filterHoldingTokenDataCompareIncludeBaseData =
        formatHoldingTokenDataCompare.filter((item) => {
          return isItemExists(item.contract_address, item.chain);
        });

      // token both base portfolio and compare portfolio have
      const holdingTokenDataInclude = formatRatioHoldingTokenData.filter(
        (item) => {
          return filterHoldingTokenDataCompareIncludeBaseData.some(
            (token) =>
              token.contract_address === item.contract_address &&
              token.chain === item.chain
          );
        }
      );

      // token compare portfolio don't have
      const filterHoldingTokenData = formatRatioHoldingTokenData
        .filter((item) => {
          return !holdingTokenDataInclude.some(
            (token) =>
              token.contract_address === item.contract_address &&
              token.chain === item.chain
          );
        })
        .map((item) => {
          return {
            ...item,
            ratio: -item.ratio,
          };
        });

      tokenHoldingDataFormat = filterHoldingTokenDataCompare.concat(
        filterHoldingTokenData,
        holdingTokenDataInclude
      );
    }
  }

  $: colspan =
    typeWalletAddress === "DEX" &&
    getAddressContext(selectedWallet)?.type !== "EVM"
      ? 8
      : 7;

  $: {
    if (selectedType?.value === "buy") {
      filteredData = tokenHoldingDataFormat.filter((item) => item.ratio > 0);
    }
    if (selectedType?.value === "sell") {
      filteredData = tokenHoldingDataFormat.filter((item) => item.ratio < 0);
    }
    if (selectedType?.value === "all") {
      filteredData = tokenHoldingDataFormat;
    }
  }
</script>

<div
  class="h-[563px] border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-4"
>
  <div class="flex justify-between">
    <div class="xl:text-2xl text-4xl font-medium text-black">
      Re-balance Action
    </div>
    <Select
      type="lang"
      positionSelectList="right-0"
      listSelect={typeList}
      bind:selected={selectedType}
    />
  </div>
  <div
    class="border border-[#0000000d] rounded-[10px] overflow-visible overflow-y-auto h-[563px] relative"
  >
    <table class="table-auto w-full">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8] xl:w-[230px] w-[280px]"
          >
            <div
              class="text-left xl:text-xs text-base uppercase font-semibold text-black"
            >
              {MultipleLang.assets}
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base uppercase font-semibold text-black"
            >
              {MultipleLang.price}
            </div>
          </th>
          <th class="py-3 pr-3 rounded-tr-[10px]">
            <div
              class="text-right xl:text-xs text-base uppercase font-semibold text-black"
            >
              <TooltipTitle tooltipText="Ratio based on total token holding">
                Ratio
              </TooltipTitle>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {#if filteredData && filteredData.length === 0}
          <tr>
            <td {colspan}>
              <div
                class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
              >
                {MultipleLang.empty}
              </div>
            </td>
          </tr>
        {:else}
          {#each filteredData as holding}
            <TokenHoldingCompare data={holding} />
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
