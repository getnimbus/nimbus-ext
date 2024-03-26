<script lang="ts">
  import { isDarkMode } from "~/store";
  import { flatten } from "lodash";

  import LendingStakePosition from "./LendingStakePosition.svelte";
  import BorrowPosition from "./BorrowPosition.svelte";
  import VestPosition from "./VestPosition.svelte";
  import AmmPosition from "./AMMPosition.svelte";
  import ClmmPosition from "./CLMMPosition.svelte";
  import FarmPosition from "./FarmPosition.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let data;

  let sum = 0;

  $: {
    if (data) {
      handleCalculateTotalProtocol(data);
    }
  }

  const handleCalculateTotalProtocol = (data: any) => {
    const formatData = data?.data.map((item) => {
      return item.data.map((eachItem) => {
        if (eachItem.type === "Borrow") {
          const listInput: any = flatten(
            eachItem.data.map((item) => {
              return item.input;
            })
          );
          const listYieldCollected: any = flatten(
            eachItem.data.map((item) => {
              return item.yieldCollected;
            })
          );
          return {
            totalInputValue:
              listInput?.reduce((prev, item) => prev + Number(item.value), 0) ||
              0,
            totalYieldCollected:
              listYieldCollected?.reduce(
                (prev, item) => prev + Number(item.value),
                0
              ) || 0,
          };
        }

        if (eachItem.type === "BorrowLendingStaking") {
          const listInput: any = flatten(
            eachItem.data.map((item) => {
              return item.input;
            })
          );
          const listYieldCollected: any = flatten(
            eachItem.data.map((item) => {
              return item.yieldCollected;
            })
          );
          return {
            totalInputValue:
              listInput?.reduce((prev, item) => prev + Number(item.value), 0) ||
              0,
            totalYieldCollected:
              listYieldCollected?.reduce(
                (prev, item) => prev + Number(item.value),
                0
              ) || 0,
          };
        }

        return {
          totalInputValue:
            eachItem?.input?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0,
          totalYieldCollected:
            eachItem?.yieldCollected?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0,
        };
      });
    });
    const flattenData: any = flatten(formatData);

    const totalProtocolInput = flattenData.reduce(
      (prev, item) => prev + Number(item.totalInputValue),
      0
    );

    const totalProtocolYieldCollected = flattenData.reduce(
      (prev, item) => prev + Number(item.totalYieldCollected),
      0
    );

    sum = totalProtocolInput + totalProtocolYieldCollected;
  };
</script>

<div class="flex flex-col gap-4 rounded-[20px] py-4">
  <div class="flex justify-between items-center">
    <div class="text-xl font-medium">
      {data?.protocol || ""}
    </div>
    <div class="text-xl font-medium">
      <TooltipNumber number={sum} type="value" />
    </div>
  </div>

  {#each data?.data as item}
    {#if item.type === "Lending" || item.type === "Staking"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <LendingStakePosition data={item.data} />
      </div>
    {:else if item.type === "Borrow"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <BorrowPosition data={item.data} />
      </div>
    {:else if item.type === "Vest"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <VestPosition data={item.data} />
      </div>
    {:else if item.type === "AMM"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">Liquidity Pool</div>
        <AmmPosition data={item.data} />
      </div>
    {:else if item.type === "CLMM"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">Liquidity Pool</div>
        <ClmmPosition data={item.data} />
      </div>
    {:else if item.type === "Farm"}
      <div class="flex flex-col gap-2">
        <div class="text-base font-medium">{item.type}</div>
        <FarmPosition data={item.data} />
      </div>
    {/if}
  {/each}
</div>

<style></style>
