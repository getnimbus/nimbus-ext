<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";

  import FlipCoin from "~/components/SUI Campaign/FlipCoinGame/FlipCoin.svelte";
  import History from "~/components/SUI Campaign/FlipCoinGame/History.svelte";
  import QnA from "~/components/SUI Campaign/FlipCoinGame/QnA.svelte";

  let flipHistoryData = [];
  let totalReward = 0;
  let dataFlipCheck = {};

  const getFlipCheck = async () => {
    try {
      const response: any = await nimbus.get(`/v2/games/flip/check`);
      if (response && response?.data) {
        flipHistoryData = response?.data?.history;
        totalReward = flipHistoryData.reduce(
          (prev, item) => prev + Number(item.point),
          0
        );
        dataFlipCheck = response.data;
      }
    } catch (e) {
      console.error(e);
    }
  };

  onMount(() => {
    getFlipCheck();
  });
</script>

<div class="flex flex-col gap-8">
  <FlipCoin {dataFlipCheck} {getFlipCheck} />
  <div class="grid xl:grid-cols-2 gap-8">
    <QnA />
    <History {flipHistoryData} {totalReward} />
  </div>
</div>

<style></style>
