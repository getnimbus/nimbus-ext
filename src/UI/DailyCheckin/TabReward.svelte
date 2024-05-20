<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { user, userPublicAddress } from "~/store";
  import {
    getLinkData,
    handleGetDataDailyCheckin,
    handleGetDataRewards,
    handleValidateAddress,
  } from "~/lib/queryAPI";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";

  import Loading from "~/components/Loading.svelte";
  import RedeemCard from "~/components/RedeemCard.svelte";
  import TicketCard from "~/components/SUI Campaign/TicketCard.svelte";
  import BoxCard from "~/components/SUI Campaign/BoxCard.svelte";
  import Image from "~/components/Image.svelte";

  import goldImg from "~/assets/Gold4.svg";

  const dailyCheckinRewardsTypePortfolio = [
    {
      label: "Store",
      value: "redeemGift",
    },
    {
      label: "Inventory",
      value: "yourGift",
    },
  ];

  const queryClient = useQueryClient();

  let totalPoint = 0;

  let selectedType: "redeemGift" | "yourGift" = "redeemGift";

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;
  let openScreenTicketCardSuccess = false;

  let isLoadingRedeem = false;
  let selectedTicketReward = {};

  const rewardBox = [
    {
      cost: 1200,
      description: "Nimbus on SUI loot boxes",
      title: "Paper Box",
      body: "PAPER_BOX",
      logo: "https://nimbus-zodiac.s3.ap-southeast-1.amazonaws.com/sui-unlock/closed-box.png",
    },
    {
      cost: 1200,
      description: "FlowX on SUI loot boxes",
      title: "FlowX Box",
      body: "FLOWX_BOX",
      logo: "https://nimbus-zodiac.s3.ap-southeast-1.amazonaws.com/sui-unlock/closed_flowx.png",
    },
  ];

  const rewardTicket = [
    {
      cost: 1000,
      description: "GOLD TICKET - Nimbus On Sui Ticket",
      title: "GOLD TICKET",
      body: "GOLD_TICKET",
      logo: "https://nimbus-zodiac.s3.ap-southeast-1.amazonaws.com/sui-unlock/gold.png",
      fromDate: "2024-05-14",
      toDate: "2024-05-21",
    },
    // {
    //   cost: 1000,
    //   description: "SILVER TICKET - Nimbus On Sui Ticket",
    //   title: "SILVER TICKET",
    //   body: "SILVER_TICKET",
    //   logo: "https://nimbus-zodiac.s3.ap-southeast-1.amazonaws.com/sui-unlock/silver.png",
    //   fromDate: "2024-05-21",
    //   toDate: "2024-05-27",
    // },
    {
      cost: 1000,
      description: "BRONZE TICKET - Nimbus On Sui Ticket",
      title: "BRONZE TICKET",
      body: "BRONZE_TICKET",
      logo: "https://nimbus-zodiac.s3.ap-southeast-1.amazonaws.com/sui-unlock/bronze.png",
      fromDate: "2024-05-14",
      toDate: "2024-05-31",
    },
  ];

  const trigger = () => {
    showToast = true;
    counter = 5;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const triggerRedeemSuccess = async () => {
    openScreenTicketCardSuccess = true;
    triggerFirework();
    await wait(2000);
    openScreenTicketCardSuccess = false;
  };

  let socialData = [];

  $: queryLinkSocial = createQuery({
    queryKey: ["link-socials"],
    queryFn: () => getLinkData(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (!$queryLinkSocial.isError && $queryLinkSocial.data !== undefined) {
      socialData = $queryLinkSocial?.data?.data;
    }
  }

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
    queryFn: () => handleGetDataDailyCheckin(),
    staleTime: Infinity,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      $userPublicAddress.length !== 0,
  });

  $: {
    if (!$queryDailyCheckin.error && $queryDailyCheckin.data !== undefined) {
      totalPoint = $queryDailyCheckin?.data?.totalPoint;
    }
  }

  $: queryReward = createQuery({
    queryKey: ["rewards", $userPublicAddress],
    queryFn: () => handleGetDataRewards($userPublicAddress),
    staleTime: Infinity,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      $userPublicAddress.length !== 0,
  });

  const handleRedeem = async (data) => {
    const validateAddress = await handleValidateAddress($userPublicAddress);
    if (
      validateAddress?.type === "MOVE" ||
      socialData.find((item) => item.chain === "MOVE")
    ) {
      isLoadingRedeem = true;
      try {
        if (totalPoint < data.cost) {
          selectedType = "yourGift";
          return;
        }

        const response: any = await nimbus.post("/v2/reward/redeem", {
          address: $userPublicAddress,
          campaignName: data?.campaignName,
        });
        if (response?.error) {
          toastMsg = response?.error;
          isSuccessToast = false;
          trigger();
        }

        queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);
        queryClient?.invalidateQueries([$userPublicAddress, "rewards"]);
        selectedTicketReward = data;
        triggerRedeemSuccess();
      } catch (e) {
        console.error(e);
        toastMsg = "Something went wrong while redeeming the ticket";
        isSuccessToast = false;
        trigger();
      } finally {
        isLoadingRedeem = false;
      }
    } else {
      if (
        validateAddress?.type === "MOVE" ||
        socialData.find((item) => item.chain === "MOVE")
      ) {
        toastMsg = "Something went wrong while redeeming the ticket";
      } else {
        toastMsg =
          "Please connect your SUI wallet or link you SUI wallet to redeem!";
      }
      isSuccessToast = false;
      trigger();
    }
  };

  const handleRedeemCampaign = async (data) => {
    try {
      isLoadingRedeem = true;
      const response: any = await nimbus.post(
        "/v2/campaign/sui-unlock/rewards",
        {
          reward: data.body,
        }
      );
      if (response?.error) {
        toastMsg = response?.error;
        isSuccessToast = false;
        trigger();
      }

      queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);
      queryClient?.invalidateQueries([$userPublicAddress, "rewards"]);
      selectedTicketReward = data;
      response?.error === undefined && triggerRedeemSuccess();
    } catch (error) {
      console.error(error);
      toastMsg = "Something went wrong while redeeming the ticket";
      isSuccessToast = false;
      trigger();
    } finally {
      isLoadingRedeem = false;
    }
  };

  $: console.log("HELLO WORLD: ", $queryReward?.data?.ownRewards);
</script>

<div class="flex flex-col gap-4">
  <div
    class="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 border-b-[1.5px] border_0000000d pb-4"
  >
    <div class="flex flex-col gap-1">
      <div class="xl:title-3 title-2">Rewards</div>
      <div class="xl:text-base text-lg text-gray-500">
        Use GM Points to redeem gifts
      </div>
    </div>
    <div
      class="flex justify-center items-center gap-2 py-2 px-3 max-w-[120px] rounded-full bg-[#27326F]"
    >
      <img src={goldImg} alt="" class="w-8" />
      <div class="text-white md:text-xl text-lg font-medium">
        {totalPoint}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-10">
    {#if $queryDailyCheckin.isFetching && $queryReward.isFetching}
      <div class="flex items-center justify-center h-full px-3 py-4">
        <Loading />
      </div>
    {:else}
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <AnimateSharedLayout>
            {#each dailyCheckinRewardsTypePortfolio as type}
              <div
                class="relative cursor-pointer xl:text-base text-lg font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => (selectedType = type.value)}
              >
                <div
                  class={`relative z-1 ${
                    selectedType === type.value && "text-white"
                  }`}
                >
                  {type.label}
                </div>
                {#if type.value === selectedType}
                  <Motion
                    let:motion
                    layoutId="active-pill"
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <div
                      class="absolute inset-0 rounded-full bg-[#1E96FC] z-0"
                      use:motion
                    />
                  </Motion>
                {/if}
              </div>
            {/each}
          </AnimateSharedLayout>
        </div>

        {#if selectedType === "redeemGift"}
          <div class="flex flex-col gap-4">
            <div
              class="flex justify-center items-center h-full w-full xl:text-lg text-xl text-gray-400"
            >
              <!-- {#if $queryReward?.data?.redeemable.length === 0}
                There are no redeems
              {/if} -->
              {#if $queryReward?.data === undefined}
                Please connect wallet
              {/if}
            </div>

            <div class="grid lg:grid-cols-2 grid-cols-1 gap-10">
              {#each $queryReward?.data?.redeemable || [] as item}
                <RedeemCard
                  isRedeem
                  redeemData={item}
                  {handleRedeem}
                  {isLoadingRedeem}
                />
              {/each}

              {#if $queryReward?.data !== undefined}
                {#each rewardTicket || [] as item}
                  <TicketCard
                    isRedeem
                    data={item}
                    handleRedeemTicket={handleRedeemCampaign}
                    {isLoadingRedeem}
                    {totalPoint}
                  />
                {/each}

                {#each rewardBox || [] as item}
                  <BoxCard
                    isRedeem
                    data={item}
                    handleRedeemBox={handleRedeemCampaign}
                    {isLoadingRedeem}
                    {totalPoint}
                  />
                {/each}
              {/if}
            </div>
          </div>
        {/if}

        {#if selectedType === "yourGift"}
          <div class="flex flex-col gap-4">
            <div
              class="flex justify-center items-center h-full w-full xl:text-lg text-xl text-gray-400"
            >
              {#if $queryReward?.data === undefined}
                Please connect wallet
              {/if}
              {#if $queryReward?.data?.ownRewards.length === 0}
                There are no gifts
              {/if}
            </div>

            <div class="grid lg:grid-cols-2 grid-cols-1 gap-10">
              {#each $queryReward?.data?.ownRewards.filter((item) => item?.campaignName !== "sui-unlock") || [] as item}
                <RedeemCard
                  redeemData={item}
                  handleRedeem={() => {}}
                  {isLoadingRedeem}
                />
              {/each}

              {#each $queryReward?.data?.ownRewards.filter((item) => item?.campaignName === "sui-unlock" && item.title !== "FLOWX_BOX" && item.title !== "PAPER_BOX") || [] as item}
                <TicketCard
                  data={item}
                  handleRedeemTicket={() => {}}
                  {isLoadingRedeem}
                  {totalPoint}
                />
              {/each}

              {#each $queryReward?.data?.ownRewards.filter((item) => item?.campaignName === "sui-unlock" && (item.title === "FLOWX_BOX" || item.title === "PAPER_BOX")) || [] as item}
                <BoxCard
                  isClaimable
                  data={item}
                  handleRedeemBox={() => {}}
                  {isLoadingRedeem}
                  {totalPoint}
                />
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

{#if openScreenTicketCardSuccess}
  <div
    class="fixed h-screen w-screen top-0 left-0 z-10 flex items-center justify-center bg-[#000000cc]"
    on:click={() => {
      setTimeout(() => {
        openScreenTicketCardSuccess = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Redeem successfully
      </div>
      <div class="w-40 h-40">
        <Image logo={selectedTicketReward?.logo} defaultLogo="" />
      </div>
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have redeemed the {selectedTicketReward?.title?.toLowerCase() || ""}
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
