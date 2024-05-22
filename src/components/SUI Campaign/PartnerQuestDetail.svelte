<script lang="ts">
  import { isDarkMode } from "~/store";
  import {
    getCampaignPartnerDetail,
    getPositionList,
    getPositions,
  } from "~/lib/queryAPI";
  import { createQueries, createQuery } from "@tanstack/svelte-query";
  import { flatten } from "lodash";
  import { formatDataProtocol } from "~/UI/Portfolio/DefiPosition/utils";

  import Loading from "~/components/Loading.svelte";
  import PartnerQuestTable from "./PartnerQuestTable.svelte";
  import Positions from "~/UI/Portfolio/DefiPosition/Positions.svelte";

  import GreenTick from "~/assets/green-tick.svg";

  export let partnersDataList;
  export let id;
  export let queryPositionAddress;

  $: selectedPartnersData =
    partnersDataList.length !== 0 &&
    partnersDataList.find((item) => item.id === id);

  let dataQuestsBoard = [];
  let positionListQueries = [];
  let positionListData = [];

  $: queryCampaignPartnerDetail = createQuery({
    queryKey: ["partners-detail-campaign", id],
    queryFn: () => getCampaignPartnerDetail(id),
    staleTime: Infinity,
    retry: false,
    enabled: id && id.length !== 0,
  });

  $: {
    if (
      !$queryCampaignPartnerDetail.isError &&
      $queryCampaignPartnerDetail &&
      $queryCampaignPartnerDetail?.data !== undefined
    ) {
      dataQuestsBoard = $queryCampaignPartnerDetail?.data?.campaign?.quests;
    }
  }

  //// POSITIONS
  $: queryPositionList = createQuery({
    queryKey: ["position-list", selectedPartnersData],
    queryFn: () => getPositionList(queryPositionAddress),
    staleTime: Infinity,
    enabled: Boolean(
      selectedPartnersData && selectedPartnersData?.tags?.includes("DeFi")
    ),
  });

  $: {
    if (!$queryPositionList.isError && $queryPositionList.data !== undefined) {
      positionListQueries = $queryPositionList.data;
    }
  }

  $: queryAllPositions = createQueries(
    positionListQueries
      .filter(
        (item) =>
          item?.toLowerCase() === selectedPartnersData?.title.toLowerCase()
      )
      .map((item) => {
        return {
          queryKey: ["positions", selectedPartnersData, item],
          queryFn: () => getPositions(queryPositionAddress, item),
          staleTime: Infinity,
          enabled: Boolean(
            selectedPartnersData && selectedPartnersData?.tags?.includes("DeFi")
          ),
        };
      })
  );

  $: positionsData =
    $queryAllPositions.length !== 0
      ? flatten(
          $queryAllPositions
            ?.filter((item) => Array.isArray(item.data))
            ?.map((item) => item.data)
        )
      : [];

  $: {
    if (!$queryAllPositions.some((item) => item.isFetching === true)) {
      if (positionsData.length !== 0) {
        handleFormatPositionData(positionsData);
      }
    }
  }

  const handleFormatPositionData = (data) => {
    positionListData = formatDataProtocol(data, false)?.filter(
      (item) =>
        item.protocol?.toLowerCase() ===
        (selectedPartnersData?.sponsor?.title?.toLowerCase() ||
          selectedPartnersData?.title?.toLowerCase())
    );
  };

  $: relatedLinks =
    selectedPartnersData?.sponsor?.extraInfo?.blog?.map((item) => {
      const indexOfDot = item.indexOf(":");

      return {
        title: item?.slice(0, indexOfDot) || "",
        link: item?.slice(indexOfDot + 2) || "",
      };
    }) || [];
</script>

<div class="flex flex-col gap-6">
  <div class="grid grid-cols-5 gap-4">
    <div
      class="xl:col-span-3 xl:order-1 order-2 col-span-full grid grid-rows-2 gap-4"
    >
      <div
        class={`py-6 px-8 rounded-[10px] border border_0000001a flex flex-col justify-center gap-4 ${$isDarkMode ? "bg-[#000]" : "bg-[#fff]"}`}
      >
        <div class="flex items-center gap-2">
          <div class="uppercase text-2xl font-medium">
            {selectedPartnersData?.sponsor?.title ||
              selectedPartnersData?.title}
          </div>
          <img src={GreenTick} alt="" class="w-[18px] h-[18px]" />
        </div>

        <div class="text-[#7A7A7A]">
          {selectedPartnersData?.sponsor?.description}
        </div>

        <div class="flex items-center gap-4">
          {#if selectedPartnersData?.sponsor?.social?.twitter}
            <a
              href={selectedPartnersData?.sponsor?.social?.twitter}
              target="_blank"
              aria-label={selectedPartnersData?.sponsor?.title ||
                selectedPartnersData?.title}
              class="hover:text-[#3b82f6] transition-all w-6 h-6 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path
                  fill="currentColor"
                  d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07l-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"
                />
              </svg>
            </a>
          {/if}

          {#if selectedPartnersData?.sponsor?.social?.discord}
            <a
              href={selectedPartnersData?.sponsor?.social?.discord}
              target="_blank"
              aria-label={selectedPartnersData?.sponsor?.title ||
                selectedPartnersData?.title}
              class="hover:text-[#3b82f6] transition-all xl:w-7 xl:h-7 w-8 h-8 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                  id="media/discord"
                  stroke="none"
                  stroke-width="1"
                  fill="none"
                  fill-rule="evenodd"
                >
                  <path
                    d="M19.3738284,1.30000067 C20.6047838,1.30000067 21.6093118,2.26441332 21.6296842,3.46693408 L21.6299997,3.50420056 L21.6299997,22.6999997 L19.2637712,20.6669997 L17.9320799,19.4685998 L16.5233485,18.1952999 L17.1066513,20.1747998 L4.62617192,20.1747998 C3.39521653,20.1747998 2.39068845,19.2103871 2.37031605,18.0078664 L2.3700006,17.9705999 L2.3700006,3.50420056 C2.3700006,2.29684756 3.36196791,1.32011497 4.58817416,1.30030737 L4.62617192,1.30000067 L19.3738284,1.30000067 Z M10.4261831,6.41460042 L10.3161259,6.28611151 L10.253462,6.28683614 C9.95314869,6.29553045 8.61816442,6.39277243 7.22352037,7.40970038 L7.17914533,7.49134137 C6.92240404,7.97476735 5.63869759,10.5469402 5.63869759,13.6478001 L5.66158768,13.683294 C5.81731702,13.9151096 6.78208119,15.206041 8.99544029,15.2742 L9.31958577,14.8876236 C9.44785509,14.7336464 9.59687017,14.5535236 9.73282311,14.3861 C8.4498449,14.0128802 7.89942129,13.2610193 7.81769324,13.1400854 L7.8068232,13.1235001 L7.8520928,13.1528415 C7.90174748,13.1841892 7.99116891,13.2385251 8.11498319,13.3054001 C8.1259889,13.3161001 8.13699461,13.3268001 8.15900604,13.3375001 C8.19202318,13.3589001 8.22504032,13.3696001 8.25805746,13.3910001 C8.53320031,13.5408001 8.80834315,13.6585001 9.06147457,13.7548001 C9.51270883,13.9260001 10.0519888,14.0972001 10.6793145,14.2149001 C11.4811594,14.36042 12.4180196,14.4150643 13.43945,14.2415094 L13.5297944,14.2256001 C14.0470629,14.1400001 14.5753372,13.9902001 15.1256229,13.7655001 C15.5108228,13.6264001 15.9400457,13.4231001 16.3912799,13.1342001 L16.3732355,13.1608643 C16.2678877,13.3105783 15.6918478,14.0525552 14.3992457,14.4075 L14.5812611,14.6292689 C14.8592141,14.9648288 15.1256229,15.2742 15.1256229,15.2742 C17.5578856,15.1993 18.4933713,13.6478001 18.4933713,13.6478001 C18.4933713,10.2024002 16.9085485,7.40970038 16.9085485,7.40970038 C15.5456009,6.41588442 14.2396321,6.30042559 13.9006746,6.2875759 L13.8159429,6.28611151 L13.6618629,6.45740042 C15.3210186,6.95080946 16.1925853,7.63774998 16.3686631,7.78696529 L16.4022856,7.81630036 C15.2576914,7.20640039 14.1351086,6.9068004 13.0895658,6.78910041 C12.2971544,6.70350041 11.5377602,6.72490041 10.8664116,6.81050041 C10.8003773,6.81050041 10.7453488,6.82120041 10.6793145,6.8319004 L10.6174459,6.83755 C10.1999606,6.8788199 9.29974827,7.0282454 8.18101747,7.50600037 L8.02110602,7.5784953 C7.82117927,7.670492 7.67550736,7.74276561 7.59730018,7.78247321 L7.53168036,7.81630036 C7.53168036,7.81630036 8.42697646,6.98782187 10.3670723,6.43137796 L10.4261831,6.41460042 Z M10.007966,10.2773002 C10.6352916,10.2773002 11.1415545,10.8123002 11.1305488,11.4650002 C11.1305488,12.1177002 10.6352916,12.6527001 10.007966,12.6527001 C9.39164598,12.6527001 8.88538315,12.1177002 8.88538315,11.4650002 C8.88538315,10.8123002 9.38064027,10.2773002 10.007966,10.2773002 Z M14.0250515,10.2773002 C14.6523772,10.2773002 15.1476343,10.8123002 15.1476343,11.4650002 C15.1476343,12.1177002 14.6523772,12.6527001 14.0250515,12.6527001 C13.4087315,12.6527001 12.9024687,12.1177002 12.9024687,11.4650002 C12.9024687,10.8123002 13.3977258,10.2773002 14.0250515,10.2773002 Z"
                    id="Shape"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </a>
          {/if}

          {#if selectedPartnersData?.sponsor?.social?.telegram}
            <a
              href={selectedPartnersData?.sponsor?.social?.telegram}
              target="_blank"
              aria-label={selectedPartnersData?.sponsor?.title ||
                selectedPartnersData?.title}
              class="transition-all hover:text-[#3b82f6] xl:w-6 xl:h-6 w-7 h-7 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z"
                />
              </svg>
            </a>
          {/if}

          {#if selectedPartnersData?.sponsor?.social?.website}
            <a
              href={selectedPartnersData?.sponsor?.social?.website}
              target="_blank"
              aria-label={selectedPartnersData?.sponsor?.title ||
                selectedPartnersData?.title}
              class="hover:text-[#3b82f6] transition-all w-6 h-6 flex items-center justify-center"
            >
              <svg
                fill="currentColor"
                height="38"
                width="38"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 512 512"
                xml:space="preserve"
              >
                <g>
                  <g>
                    <path
                      d="M256,0C114.62,0,0,114.62,0,256s114.62,256,256,256s256-114.62,256-256S397.38,0,256,0z M172.211,41.609
			c-24.934,27.119-44.68,66.125-56.755,111.992H49.749C75.179,102.741,118.869,62.524,172.211,41.609z M25.6,256
			c0-26.999,5.077-52.727,13.662-76.8h70.494c-4.608,24.294-7.356,49.963-7.356,76.8s2.748,52.506,7.347,76.8H39.262
			C30.677,308.727,25.6,283,25.6,256z M49.749,358.4h65.707c12.083,45.867,31.821,84.872,56.755,111.991
			C118.869,449.476,75.179,409.259,49.749,358.4z M243.2,485.188c-43.81-8.252-81.877-58.24-101.359-126.788H243.2V485.188z
			 M243.2,332.8H135.74c-4.924-24.166-7.74-49.997-7.74-76.8s2.816-52.634,7.74-76.8H243.2V332.8z M243.2,153.6H141.841
			C161.323,85.052,199.39,35.063,243.2,26.812V153.6z M462.251,153.6h-65.707c-12.083-45.867-31.821-84.873-56.755-111.992
			C393.131,62.524,436.821,102.741,462.251,153.6z M268.8,26.812c43.81,8.252,81.877,58.24,101.359,126.788H268.8V26.812z
			 M268.8,179.2h107.46c4.924,24.166,7.74,49.997,7.74,76.8s-2.816,52.634-7.74,76.8H268.8V179.2z M268.8,485.188V358.4h101.359
			C350.677,426.948,312.61,476.937,268.8,485.188z M339.789,470.391c24.934-27.127,44.672-66.125,56.755-111.991h65.707
			C436.821,409.259,393.131,449.476,339.789,470.391z M402.244,332.8c4.608-24.294,7.356-49.963,7.356-76.8
			s-2.748-52.506-7.347-76.8h70.494c8.576,24.073,13.653,49.801,13.653,76.8c0,27-5.077,52.727-13.662,76.8H402.244z"
                    />
                  </g>
                </g>
              </svg>
            </a>
          {/if}
        </div>
      </div>

      <div
        class={`py-6 px-8 rounded-[10px] border border_0000001a flex flex-col gap-4 ${$isDarkMode ? "bg-[#000]" : "bg-[#fff]"}`}
      >
        <div class="text-2xl font-medium">Related Links</div>
        {#each relatedLinks || [] as item}
          <a
            href={item?.link}
            target="_blank"
            class="flex items-center gap-4 cursor-pointer"
          >
            <svg
              width="20"
              height="10"
              viewBox="0 0 20 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.9 5C1.9 3.29 3.29 1.9 5 1.9H9V0H5C2.24 0 0 2.24 0 5C0 7.76 2.24 10 5 10H9V8.1H5C3.29 8.1 1.9 6.71 1.9 5ZM6 6H14V4H6V6ZM15 0H11V1.9H15C16.71 1.9 18.1 3.29 18.1 5C18.1 6.71 16.71 8.1 15 8.1H11V10H15C17.76 10 20 7.76 20 5C20 2.24 17.76 0 15 0Z"
                fill={`${$isDarkMode ? "#fff" : "#000"}`}
              />
            </svg>
            <div class="underline">{item?.title}</div>
          </a>
        {/each}
      </div>
    </div>

    <div
      class={`xl:col-span-2 xl:order-2 order-1 col-span-full py-10 px-14 rounded-[10px] border border_0000001a flex justify-center items-center ${$isDarkMode ? "bg-[#000]" : "bg-[#fff]"}`}
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="h-[262px] w-[262px] flex items-center justify-center bg-white rounded-[10px]"
        >
          <img
            src={selectedPartnersData?.sponsor?.logo}
            alt=""
            class="object-contain w-[140px] m-auto rounded-[10px] overflow-hidden"
          />
        </div>
        <div class="uppercase text-3xl font-medium">
          {selectedPartnersData?.sponsor?.title || selectedPartnersData?.title}
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
      <div class="border-b-[1.5px] border_0000000d pb-2">
        <div class="xl:title-3 title-2">Quests</div>
      </div>
      <PartnerQuestTable {dataQuestsBoard} {id} />
    </div>

    {#if selectedPartnersData && selectedPartnersData?.tags?.includes("DeFi")}
      <div class="flex flex-col gap-4">
        <div class="border-b-[1.5px] border_0000000d pb-2">
          <div class="xl:title-3 title-2">DeFi</div>
        </div>

        {#if $queryAllPositions.some((item) => item.isFetching === true)}
          <div class="flex justify-center items-center min-h-[300px]">
            <Loading />
          </div>
        {:else}
          <div class="flex flex-col gap-6">
            {#if positionListData && positionListData.length === 0}
              <div
                class="flex justify-center items-center min-h-[300px] py-4 px-3 text-lg text-gray-400"
              >
                Empty
              </div>
            {:else}
              {#each positionListData as item}
                <Positions data={item} />
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
