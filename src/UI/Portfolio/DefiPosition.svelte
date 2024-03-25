<script lang="ts">
  import { wallet } from "~/store";
  import axios from "axios";
  import { groupBy } from "lodash";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Positions from "./DefiPosition/Positions.svelte";

  export let conditionQuery;

  let positionsData = [];

  const getSUIPositions = async (address) => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const solanaToken = localStorage.getItem("solana_token");
      const suiToken = localStorage.getItem("sui_token");
      const tonToken = localStorage.getItem("ton_token");
      const evmToken = localStorage.getItem("evm_token");

      const response: any = await axios
        .get(`https://sui-defi.getnimbus.io/positions/${address}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `${evmToken || solanaToken || suiToken || tonToken || authToken}`,
          },
        })
        .then((res) => res.data);
      formatDataProtocol(response?.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  $: {
    if (conditionQuery) {
      getSUIPositions($wallet);
    }
  }

  const formatDataProtocol = (data) => {
    const formatData = data.map((item) => {
      return {
        ...item,
        protocol: item?.meta?.protocol?.name || "",
      };
    });
    const groupProtocol = groupBy(formatData, "protocol");
    const protocolList = Object.getOwnPropertyNames(groupProtocol);

    positionsData = protocolList.map((item) => {
      const groupType = groupBy(groupProtocol[item], "type");
      const typeList = Object.getOwnPropertyNames(groupType);

      return {
        protocol: item,
        data: typeList.map((type) => {
          return {
            type,
            data: groupType[type],
          };
        }),
      };
    });

    console.log("HELLO: ", positionsData);
  };
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-4 px-3">
    <div class="xl:text-2xl text-3xl font-medium">Positions</div>
    <div class="flex flex-col gap-6">
      {#each positionsData as item}
        <Positions data={item} />
      {/each}
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
