<script lang="ts">
  import { userPublicAddress } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { handleGetDataDailyCheckin } from "~/lib/queryAPI";

  import FlipCoin from "~/components/SUI Campaign/FlipCoinGame/FlipCoin.svelte";
  import History from "~/components/SUI Campaign/FlipCoinGame/History.svelte";
  import QnA from "~/components/SUI Campaign/FlipCoinGame/QnA.svelte";

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
    queryFn: () => handleGetDataDailyCheckin(),
    staleTime: Infinity,
    enabled: $userPublicAddress.length !== 0,
  });
</script>

<div class="flex flex-col gap-8">
  <FlipCoin point={$queryDailyCheckin?.data?.totalPoint || 0} />
  <div class="grid xl:grid-cols-2 gap-8">
    <QnA />
    <History />
  </div>
</div>

<style></style>
