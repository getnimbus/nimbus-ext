<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { getCampaignReferrals, getCampaignQuestsBoard } from "~/lib/queryAPI";

  import Referrals from "./StarterQuests/Referrals.svelte";
  import StarterQuestTable from "./StarterQuests/StarterQuestTable.svelte";

  let dataQuestsBoard = [];

  $: queryCampaignReferrals = createQuery({
    queryKey: ["referrals-campaign"],
    queryFn: () => getCampaignReferrals(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryCampaignReferrals.isError &&
      $queryCampaignReferrals &&
      $queryCampaignReferrals?.data !== undefined
    ) {
      console.log($queryCampaignReferrals);
    }
  }

  $: queryQuestsBoard = createQuery({
    queryKey: ["quests-campaign"],
    queryFn: () => getCampaignQuestsBoard(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryQuestsBoard.isError &&
      $queryQuestsBoard &&
      $queryQuestsBoard?.data !== undefined
    ) {
      dataQuestsBoard = $queryQuestsBoard?.data?.campaign?.quests;
    }
  }
</script>

<div class="flex xl:flex-row flex-col items-start justify-between gap-6">
  <Referrals />
  <StarterQuestTable
    {dataQuestsBoard}
    isLoading={$queryQuestsBoard.isFetching}
  />
</div>

<style windi:preflights:global windi:safelist:global>
</style>
