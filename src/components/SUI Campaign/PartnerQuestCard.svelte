<script lang="ts">
  import { isDarkMode } from "~/store";
  import { getCampaignPartnerDetail } from "~/lib/queryAPI";
  import { createQuery } from "@tanstack/svelte-query";

  import SUILogo from "~/assets/chains/sui.png";
  import gmPoint from "~/assets/Gold4.svg";

  export let data;
  export let handleUpdatePartnerQuestsId = (id) => {};

  let points = 0;

  $: queryCampaignPartnerDetail = createQuery({
    queryKey: ["partners-detail-campaign", data?.id],
    queryFn: () => getCampaignPartnerDetail(data?.id),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryCampaignPartnerDetail.isError &&
      $queryCampaignPartnerDetail &&
      $queryCampaignPartnerDetail?.data !== undefined
    ) {
      points = $queryCampaignPartnerDetail?.data?.campaign?.quests?.reduce(
        (prev, item) => prev + item.point,
        0
      );
    }
  }
</script>

<div
  class={`flex flex-col border border_0000000d rounded-[10px] xl:w-[320px] lg:w-[290px] md:w-[330px] w-full py-8 px-6 transition-all hover:shadow-md cursor-pointer ${$isDarkMode ? "bg-[#000] hover:shadow-gray-600" : "bg-[#fff] hover:shadow-gray-400"}`}
  on:click={() => {
    handleUpdatePartnerQuestsId(data?.id);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + `?tab=quests&id=${data?.id}`
    );
  }}
>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex flex-wrap items-center gap-2">
      {#each data?.tags || [] as tag}
        <div
          class="text-sm bg-[#CBFDE1] text-[#49A37B] rounded-[30px] px-2 py-1"
        >
          {tag}
        </div>
      {/each}
    </div>
    <div class="px-4 py-12 mb-3 bg-white rounded-[10px] w-full">
      <img
        src={data?.sponsor?.logo}
        alt=""
        class="object-contain w-[140px] m-auto rounded-[10px] overflow-hidden"
      />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <img src={SUILogo} alt="" class="w-6 h-6 rounded-full" />
      <div class="font-medium text-lg">
        {data?.sponsor?.title || data?.title}
      </div>
    </div>
    <div class="flex">
      <div
        class="flex items-center gap-2 font-medium bg-[#27326F] rounded-[10px] text-white py-1 px-4"
      >
        {points} <img src={gmPoint} alt="" class="w-4 h-4" />
      </div>
    </div>
    <div class="text-[#7A7A7A]">
      {data?.sponsor?.description}
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
