<script lang="ts">
  import { wallet } from "~/store";
  import axios from "axios";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import LendingStakePosition from "./DefiPosition/LendingStakePosition.svelte";
  import BorrowPosition from "./DefiPosition/BorrowPosition.svelte";
  import VestPosition from "./DefiPosition/VestPosition.svelte";
  import AmmPosition from "./DefiPosition/AMMPosition.svelte";
  import ClmmPosition from "./DefiPosition/CLMMPosition.svelte";
  import FarmPosition from "./DefiPosition/FarmPosition.svelte";
  import { protocolData } from "./DefiPosition/hardCodeDefiData";

  export let conditionQuery;

  let data = [];

  const getSUIPositions = async (address) => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const solanaToken = localStorage.getItem("solana_token");
      const suiToken = localStorage.getItem("sui_token");
      const tonToken = localStorage.getItem("ton_token");
      const evmToken = localStorage.getItem("evm_token");

      const response: any = await axios.get(
        `https://sui-defi.getnimbus.io/positions/${address}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `${evmToken || solanaToken || suiToken || tonToken || authToken}`,
          },
        }
      );
      // TODO: groupBy data by protocol name
      data = response?.data?.data || [];
    } catch (e) {
      console.log(e);
    }
  };

  $: {
    if (conditionQuery) {
      getSUIPositions($wallet);
    }
  }
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-4 px-3">
    <div class="xl:text-2xl text-3xl font-medium">Positions</div>
    <div class="flex flex-col gap-6">
      {#each data as item}
        {#if item.type === "Lending" || item.type === "Stake"}
          <LendingStakePosition data={item} />
        {:else if item.type === "Borrow"}
          <BorrowPosition data={item} />
        {:else if item.type === "Vest"}
          <VestPosition data={item} />
        {:else if item.type === "AMM"}
          <AmmPosition data={item} />
        {:else if item.type === "CLMM"}
          <ClmmPosition data={item} />
        {:else if item.type === "Farm"}
          <FarmPosition data={item} />
        {/if}
      {/each}
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
