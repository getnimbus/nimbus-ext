<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, userPublicAddress } from "~/store";
  import { triggerFirework } from "~/utils";
  import dayjs from "dayjs";
  import { wait } from "~/entries/background/utils";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { driver } from "driver.js";
  import "driver.js/dist/driver.css";
  import mixpanel from "mixpanel-browser";
  import {
    getUserInfo,
    handleGetDataDailyCheckin,
    handleGetDataRewards,
    handleGetListQuest,
  } from "~/lib/queryAPI";
  import dayjsUTC from "dayjs/plugin/utc";
  dayjs.extend(dayjsUTC);
  // import { wagmiNimbusDailyCheckinRedeemAbi } from "~/lib/u2u_chain_viem/nimbus-dailyCheckinRedeem-abi";
  // import walletClient from "~/lib/u2u_chain_viem/viem-u2u-walletClient";
  // import publicClient from "~/lib/u2u_chain_viem/viem-u2u-publicClient";
  // import { u2uTestnet } from "~/lib/u2u_chain_viem/u2uTestnet";

  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  import img1stframe from "~/assets/dailycheckin/1stframe.png";
  import img2stframe from "~/assets/dailycheckin/2ndframe.png";
  import img3stframe from "~/assets/dailycheckin/3rdframe.png";

  import rank1 from "~/assets/dailycheckin/1st.png";
  import rank2 from "~/assets/dailycheckin/2nd.png";
  import rank3 from "~/assets/dailycheckin/3rd.png";

  import goldImg from "~/assets/Gold4.svg";

  const dailyCheckinTypePortfolio = [
    {
      label: "Collect GM Point",
      value: "collectGMPoint",
    },
    {
      label: "History",
      value: "history",
    },
  ];

  const rankBackground = [img1stframe, img2stframe, img3stframe];

  const rank = [rank1, rank2, rank3];

  export let currentRoute;
  export let activeTabValue;

  const driveCheckin = () =>
    driver({
      showProgress: true,
      overlayColor: "#27326f",
      onDestroyStarted: () => {
        if (driveCheckin().isLastStep()) {
          driveCheckin().destroy();
          handleReceiveQuest("", "new-user-tutorial");
        } else {
          driveCheckin().moveTo(3);
        }
      },
      showButtons: ["next", "previous", "close"],
      steps: [
        {
          element: ".wellcome-checkin",
          popover: {
            title: "Welcome to our checkin page 🤩",
            description:
              "Checkin everyday to receive our exclusive offers and benefits 🥳",
          },
        },
        {
          element: ".view-checkin-page",
          popover: {
            title: "Daily Check-in Zone 🛑",
            description: "Visit here regularly to check in and stay updated",
          },
        },
        {
          element: ".view-checkin-btn",
          popover: {
            title: "Button used for check-in 👇",
            description:
              "Tap the button here to mark your attendance every day and unlock exclusive rewards!",
          },
        },
        {
          element: ".view-checkin-quests",
          popover: {
            title: "Doing quests to gain more GM points 🤝",
            description:
              "Besides checking in, you can easily complete tasks to earn GM points",
          },
        },
      ],
    });

  let selectedType: "collectGMPoint" | "history" = "collectGMPoint";
  let openScreenSuccess: boolean = false;
  let openScreenBonusScore: boolean = false;
  let isLoadingCheckin: boolean = false;
  let isTriggerBonusScore: boolean = false;
  let selectedCheckinIndex = 0;
  let selectedIndexRewards: number = 0;
  let bonusScore: number = 0;
  let isDisabledCheckin = false;
  let listCheckinContainer;
  let waitCheckinSuccess: boolean = false;
  let quests = [];
  let listQuest = [];
  let dataCheckinHistory = [];
  let sortTypeHistory = "default";
  let sortPointHistory = "default";
  let isDisabledReceiveQuest = false;
  let selectedQuestId = "";

  let toastMsg = "";
  let isSuccessToast: boolean = false;
  let counter = 5;
  let showToast: boolean = false;

  let isDisabledRedeem: boolean = false;
  let isShowBanner: boolean = false;
  let lastMonthWinners = [];

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

  const queryClient = useQueryClient();

  const nameTypeCheckin = (
    type: "QUEST" | "CHECK_IN" | "REDEEM" | "BONUS 5%" | "SWAP"
  ) => {
    switch (type) {
      case "QUEST":
        return "Quest";
      case "CHECK_IN":
        return "Check in";
      case "REDEEM":
        return "Redeem";
      case "BONUS 5%":
        return "Bonus 5%";
      case "SWAP":
        return "Swap";
    }
  };

  const triggerCheckinSuccess = async () => {
    openScreenSuccess = true;
    triggerFirework();
    await wait(2000);
    openScreenSuccess = false;
    waitCheckinSuccess = true;
  };

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
    isTriggerBonusScore = false;
    waitCheckinSuccess = false;
  };

  const handleCheckin = async () => {
    mixpanel.track("user_checkin");
    isLoadingCheckin = true;

    try {
      const response = await nimbus.post(`/v2/checkin`, {});
      if (response?.data !== undefined) {
        isDisabledCheckin = true;
        triggerCheckinSuccess();
        if (response?.data?.bonus !== undefined) {
          bonusScore = response?.data?.bonus;
          isTriggerBonusScore = true;
        }
        queryClient.invalidateQueries([$userPublicAddress, "daily-checkin"]);
        queryClient.invalidateQueries(["users-me"]);
      }
    } catch (error) {
      console.error("this err : ", error);
    } finally {
      isLoadingCheckin = false;
    }
  };

  $: {
    if (waitCheckinSuccess && isTriggerBonusScore) {
      triggerBonusScore();
    }
  }

  $: queryListQuest = createQuery({
    queryKey: ["list-quest"],
    queryFn: () => handleGetListQuest(),
    staleTime: Infinity,
    enabled: $user && Object.keys($user).length === 0,
  });

  $: queryReward = createQuery({
    queryKey: [$userPublicAddress, "rewards"],
    queryFn: () => handleGetDataRewards($userPublicAddress),
    staleTime: Infinity,
    enabled: $userPublicAddress.length !== 0,
  });

  $: queryDailyCheckin = createQuery({
    queryKey: ["daily-checkin", $userPublicAddress],
    queryFn: () => handleGetDataDailyCheckin(),
    staleTime: Infinity,
    enabled: $userPublicAddress.length !== 0,
  });

  $: {
    if (!$queryListQuest.isError && $queryListQuest.data !== undefined) {
      listQuest = $queryListQuest?.data;
    }
  }

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      selectedCheckinIndex = $queryDailyCheckin?.data?.steak;
      isDisabledCheckin = $queryDailyCheckin?.data?.checkinable;
      dataCheckinHistory = $queryDailyCheckin?.data?.checkinLogs;
      lastMonthWinners = $queryDailyCheckin?.data?.lastMonthWinners;
      quests = $queryDailyCheckin?.data?.quests
        ?.filter((item) => item.status === "ACTIVE")
        ?.map((item) => {
          const selectedLogs = dataCheckinHistory
            .filter((log) => log.type === "QUEST" && log.note !== "id-generate")
            .find((log) => log.note === item.id);

          return {
            ...item,
            isDone: Boolean(selectedLogs),
          };
        });
    }
  }

  $: {
    if (
      listCheckinContainer &&
      listCheckinContainer.children[selectedCheckinIndex]
    ) {
      listCheckinContainer.children[selectedCheckinIndex].scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }

  $: defaultDataCheckinHistory = dataCheckinHistory.map((item) => {
    return {
      ...item,
      type: nameTypeCheckin(item.type),
      point: item.point,
    };
  });

  const toggleSortType = () => {
    switch (sortTypeHistory) {
      case "default":
        sortTypeHistory = "asc";
        break;
      case "asc":
        sortTypeHistory = "desc";
        break;
      case "desc":
        sortTypeHistory = "default";
        break;
      default:
        sortTypeHistory = "default";
    }

    if (sortTypeHistory === "asc") {
      defaultDataCheckinHistory = defaultDataCheckinHistory.sort((a, b) => {
        if (a.type > b.type) {
          return 1;
        }
        if (a.type < b.type) {
          return -1;
        }
        return 0;
      });
    }
    if (sortTypeHistory === "desc") {
      defaultDataCheckinHistory = defaultDataCheckinHistory.sort((a, b) => {
        if (a.type < b.type) {
          return 1;
        }
        if (a.type > b.type) {
          return -1;
        }
        return 0;
      });
    }
    if (sortTypeHistory === "default") {
      defaultDataCheckinHistory = dataCheckinHistory.map((item) => {
        return {
          ...item,
          type: nameTypeCheckin(item.type),
        };
      });
    }
  };

  const toggleSortPoint = () => {
    switch (sortPointHistory) {
      case "default":
        sortPointHistory = "asc";
        break;
      case "asc":
        sortPointHistory = "desc";
        break;
      case "desc":
        sortPointHistory = "default";
        break;
      default:
        sortPointHistory = "default";
    }

    if (sortPointHistory === "asc") {
      defaultDataCheckinHistory = defaultDataCheckinHistory.sort((a, b) => {
        if (a.point > b.point) {
          return 1;
        }
        if (a.point < b.point) {
          return -1;
        }
        return 0;
      });
    }
    if (sortPointHistory === "desc") {
      defaultDataCheckinHistory = defaultDataCheckinHistory.sort((a, b) => {
        if (a.point < b.point) {
          return 1;
        }
        if (a.point > b.point) {
          return -1;
        }
        return 0;
      });
    }
    if (sortPointHistory === "default") {
      defaultDataCheckinHistory = dataCheckinHistory.map((item) => {
        return {
          ...item,
          type: nameTypeCheckin(item.type),
          point: item.point,
        };
      });
    }
  };

  $: sortIcon = (sortType) => {
    return `<svg
                    height="0.9rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0" /><g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M16.0686 15H7.9313C7.32548 15 7.02257 15 6.88231 15.1198C6.76061 15.2238 6.69602 15.3797 6.70858 15.5393C6.72305 15.7232 6.93724 15.9374 7.36561 16.3657L11.4342 20.4344C11.6323 20.6324 11.7313 20.7314 11.8454 20.7685C11.9458 20.8011 12.054 20.8011 12.1544 20.7685C12.2686 20.7314 12.3676 20.6324 12.5656 20.4344L16.6342 16.3657C17.0626 15.9374 17.2768 15.7232 17.2913 15.5393C17.3038 15.3797 17.2392 15.2238 17.1175 15.1198C16.9773 15 16.6744 15 16.0686 15Z"
                        stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "desc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.9313 9.00005H16.0686C16.6744 9.00005 16.9773 9.00005 17.1175 8.88025C17.2393 8.7763 17.3038 8.62038 17.2913 8.46082C17.2768 8.27693 17.0626 8.06274 16.6342 7.63436L12.5656 3.56573C12.3676 3.36772 12.2686 3.26872 12.1544 3.23163C12.054 3.199 11.9458 3.199 11.8454 3.23163C11.7313 3.26872 11.6323 3.36772 11.4342 3.56573L7.36561 7.63436C6.93724 8.06273 6.72305 8.27693 6.70858 8.46082C6.69602 8.62038 6.76061 8.7763 6.88231 8.88025C7.02257 9.00005 7.32548 9.00005 7.9313 9.00005Z"
                         stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "asc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                  </svg>`;
  };

  const handleReceiveQuest = async (link: string, type: string) => {
    try {
      if (type.includes("retweet-on-twitter")) {
        window.open(link, "_blank");
        await wait(5000);
        const res = await nimbus.post(
          `/v2/checkin/quest/retweet-on-twitter`,
          {}
        );
        if (res && res?.data === null) {
          toastMsg = "You already retweet us on Twitter";
          isSuccessToast = false;
          trigger();
        }
        if (res?.data?.bonus !== undefined) {
          handleTrigger(res?.data?.bonus);
        }
      }
      if (type.includes("retweet-founder")) {
        window.open(link, "_blank");
        await wait(5000);
        const res = await nimbus.post(`/v2/checkin/quest/retweet-founder`, {});
        if (res && res?.data === null) {
          toastMsg = "You already retweet us on Twitter";
          isSuccessToast = false;
          trigger();
        }
        if (res?.data?.bonus !== undefined) {
          handleTrigger(res?.data?.bonus);
        }
      }
      if (type === "solana-recap-2023") {
        window.open(link, "_blank");
        await wait(5000);
        const res = await nimbus.post(
          `/v2/checkin/quest/solana-recap-2023`,
          {}
        );
        if (res && res?.data === null) {
          toastMsg = "You already post on Twitter";
          isSuccessToast = false;
          trigger();
        }
        if (res?.data?.bonus !== undefined) {
          handleTrigger(res?.data?.bonus);
        }
      }
      if (type === "new-user-tutorial") {
        const res = await nimbus.post(
          `/v2/checkin/quest/new-user-tutorial`,
          {}
        );
        if (res && res?.data === null) {
          toastMsg = "You are already finished this quest";
          isSuccessToast = false;
          trigger();
        }
        if (res?.data?.bonus !== undefined) {
          handleTrigger(res?.data?.bonus);
        }
      }
      if (type === "sync-telegram") {
        window.open(link, "_blank");
        await wait(6000);
        const res = await nimbus.post(`/v2/checkin/quest/sync-telegram`, {});
        if (res && res?.data === null) {
          toastMsg = "You are not sync Telegram";
          isSuccessToast = false;
          trigger();
        }
        if (res?.data?.bonus !== undefined) {
          handleTrigger(res?.data?.bonus);
        }
      }
      if (type === "first-share-on-twitter") {
        window.open(link, "_blank");
        await wait(5000);
        const res = await nimbus.post(
          `/v2/checkin/quest/first-share-on-twitter`,
          {}
        );
        if (res && res?.data === null) {
          toastMsg = "You already post us on Twitter";
          isSuccessToast = false;
          trigger();
        }
        if (res?.data?.bonus !== undefined) {
          handleTrigger(res?.data?.bonus);
        }
      }
      selectedQuestId = type;
      isDisabledReceiveQuest = true;
    } catch (e) {
      console.error(e);
      isDisabledReceiveQuest = false;
    }
  };

  const handleTrigger = (bonus: any) => {
    triggerBonusScore();
    bonusScore = bonus;
    isTriggerBonusScore = true;
    queryClient.invalidateQueries(["daily-checkin"]);
    queryClient.invalidateQueries(["rewards"]);
    queryClient.invalidateQueries(["list-quest"]);
    queryClient.invalidateQueries(["users-me"]);
  };

  $: {
    if (
      !$queryDailyCheckin.isLoading &&
      activeTabValue === "checkin" &&
      currentRoute &&
      currentRoute.name === "/daily-checkin" &&
      !localStorage.getItem("view-checkin-tour")
    ) {
      driveCheckin().drive();
      localStorage.setItem("view-checkin-tour", "true");
    }
  }

  // $: queryUserInfo = createQuery({
  //   queryKey: ["users-me"],
  //   queryFn: () => getUserInfo(),
  //   staleTime: Infinity,
  //   retry: false,
  //   onError(err) {
  //     localStorage.removeItem("auth_token");
  //     localStorage.removeItem("solana_token");
  //     localStorage.removeItem("sui_token");
  //     localStorage.removeItem("ton_token");
  //     localStorage.removeItem("evm_token");
  //   },
  // });

  // $: {
  //   if (
  //     !$queryUserInfo.isError &&
  //     $queryUserInfo &&
  //     $queryUserInfo?.data !== undefined &&
  //     !$queryDailyCheckin.isError &&
  //     $queryDailyCheckin.data !== undefined
  //   ) {
  //     checkOwnerIsWinner($queryUserInfo?.data?.publicAddress);
  //   }
  // }

  // const RedeemPrize = async () => {
  //   try {
  //     const account = await walletClient.requestAddresses();

  //     if (account && account.length !== 0) {
  //       await walletClient.writeContract({
  //         address: "0xC5EFb7bd30b7AA7Fae16B44e34Aee946f1Eb2AFd",
  //         account: account[0],
  //         chain: u2uTestnet,
  //         abi: wagmiNimbusDailyCheckinRedeemAbi,
  //         functionName: "redeemPrize",
  //       });

  //       toastMsg = "Successfully redeem prize!";
  //       isSuccessToast = true;
  //       trigger();

  //       isDisabledRedeem = true;
  //       checkOwnerIsWinner($queryUserInfo?.data?.publicAddress);
  //     }
  //   } catch (e) {
  //     console.error("Error: ", e);
  //     toastMsg = "Something wrong when redeem prize. Please try again!";
  //     isSuccessToast = false;
  //     trigger();
  //     checkOwnerIsWinner($queryUserInfo?.data?.publicAddress);
  //   }
  // };

  // const checkOwnerIsWinner = async (address: any) => {
  //   const isOwnerWinner = await publicClient.readContract({
  //     address: "0xC5EFb7bd30b7AA7Fae16B44e34Aee946f1Eb2AFd",
  //     abi: wagmiNimbusDailyCheckinRedeemAbi,
  //     functionName: "getWinner",
  //     args: [address],
  //   });

  //   isShowBanner = lastMonthWinners
  //     .map((item) => item.owner.toString().toLowerCase())
  //     .includes(address.toString().toLowerCase());

  //   if (isOwnerWinner.prizeAmount === 0n) {
  //     isDisabledRedeem = true;
  //   }
  // };
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
    <div class="xl:title-3 title-2">My Nimbus GM Points</div>
    <div class="text-base text-gray-500">
      Collect GM Points and redeem them for exclusive rewards and special offers
    </div>
  </div>

  {#if $queryDailyCheckin.isFetching && $queryReward.isFetching}
    <div class="flex items-center justify-center h-screen">
      <Loading />
    </div>
  {:else}
    <div class="flex flex-col gap-7 mt-2 view-checkin-page">
      <div
        class="flex flex-col gap-3 bg-[#1589EB] py-4 px-6 rounded-lg min-w-[250px] w-max"
      >
        <div class="text-2xl font-medium text-white">My GM Points</div>
        <div class="text-4xl font-medium flex items-center gap-2 text-white">
          {#if $queryDailyCheckin.isFetching}
            <Loading />
          {:else}
            {$queryDailyCheckin?.data?.totalPoint || 0}
            <img src={goldImg} alt="" class="w-13" />
          {/if}
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="-ml-3 flex items-center gap-2 px-3">
          <AnimateSharedLayout>
            {#each dailyCheckinTypePortfolio as type}
              <div
                class="relative cursor-pointer text-base font-medium py-2 px-3 rounded-xl transition-all"
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

        <div class="flex flex-col gap-4">
          {#if selectedType === "collectGMPoint"}
            <div
              class="flex md:flex-row flex-col gap-4 md:items-center justify-between"
            >
              <div class="flex flex-col gap-1">
                <div class="text-lg font-medium">
                  Collect your GM Points every day
                </div>
                <div class="text-base text-gray-500">
                  Check in 7 days in a row, your rewards will grow
                </div>
              </div>

              {#if $user && Object.keys($user).length === 0}
                <div class="w-[200px] view-checkin-btn">
                  <Button variant="primary" disabled>
                    <div class="py-1 text-white">👋 GM</div>
                  </Button>
                </div>
              {:else}
                <div class="w-[200px] view-checkin-btn">
                  {#if isDisabledCheckin}
                    <Button
                      variant="primary"
                      on:click={() => {
                        selectedIndexRewards = $queryDailyCheckin?.data?.steak;
                        handleCheckin();
                      }}
                      isLoading={isLoadingCheckin}
                    >
                      <div class="py-1 text-white">👋 GM</div>
                    </Button>
                  {:else}
                    <Button disabled>
                      <div class="py-1 text-white">Checked</div>
                    </Button>
                  {/if}
                </div>
              {/if}
            </div>

            {#if $queryDailyCheckin?.data === undefined}
              <div class="overflow-x-auto py-5">
                <div
                  class="grid grid-cols-7 gap-4 w-[1350px]"
                  bind:this={listCheckinContainer}
                >
                  {#each [10, 10, 10, 20, 20, 30, 50] as item, index}
                    <div
                      class={`flex flex-col gap-2 items-center filter rounded-lg py-8 transform scale-95 transition-all ${
                        $isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div class="text-lg font-medium">
                        Day {index + 1}
                      </div>
                      <img src={goldImg} alt="" class="w-13" />
                      <div class="text-2xl font-medium">
                        + {item}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <div class="overflow-x-auto py-5">
                <div
                  class="grid grid-cols-7 gap-4 w-[1350px]"
                  bind:this={listCheckinContainer}
                >
                  {#each $queryDailyCheckin?.data?.pointStreak || [] as item, index}
                    <div
                      class={`flex flex-col gap-2 items-center filter rounded-lg py-8 transform scale-95 transition-all ${
                        selectedCheckinIndex > index && $isDarkMode
                          ? "grayscale bg-gray-700"
                          : selectedCheckinIndex > index && !$isDarkMode
                            ? "grayscale bg-gray-100"
                            : selectedCheckinIndex === index
                              ? "bg-black text-white scale-100 drop-shadow-lg"
                              : $isDarkMode
                                ? "bg-gray-700"
                                : "bg-gray-100"
                      }`}
                    >
                      <div class="text-lg font-medium">
                        Day {index + 1}
                      </div>
                      <img src={goldImg} alt="" class="w-13" />
                      <div class="text-2xl font-medium">
                        + {item}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- <div class="flex flex-col gap-4">
              <div class="text-lg font-medium">This month reward</div>
              {#if $queryReward.data === undefined}
                <div class="overflow-x-auto py-4">
                  <div class="flex gap-6 w-[650px]">
                    {#each [{ amount: 50 }, { amount: 20 }, { amount: 10 }] as item, index}
                      <div>
                        <div
                          class="relative h-[250px] w-[185px] flex flex-col items-center justify-center gap-3 text-white"
                        >
                          <img
                            src={rankBackground[index]}
                            alt=""
                            class="absolute top-0 left-0 -z-99"
                          />
                          <img src={rank[index]} alt="" class="h-[70px] mb-2" />
                          <div class="text-4xl font-medium text-center">
                            ${item.amount}
                          </div>
                          <div class="text-base text-center">
                            {index + 1}{index === 0
                              ? "st"
                              : index == 1
                                ? "nd"
                                : "rd"}
                            Rank
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {:else}
                <div class="overflow-x-auto py-4">
                  <div class="flex gap-6 w-[650px]">
                    {#each $queryReward?.data?.monthRewards || [] as item, index}
                      <div>
                        <div
                          class="relative h-[250px] w-[185px] flex flex-col items-center justify-center gap-3 text-white"
                        >
                          <img
                            src={rankBackground[index]}
                            alt=""
                            class="absolute top-0 left-0 -z-99"
                          />
                          <img src={rank[index]} alt="" class="h-[70px] mb-2" />
                          <div class="text-4xl font-medium text-center">
                            ${item.amount}
                          </div>
                          <div class="text-base text-center">
                            {index + 1}{index === 0
                              ? "st"
                              : index == 1
                                ? "nd"
                                : "rd"}
                            Rank
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div> -->

            <!-- {#if isShowBanner}
              <div class="overflow-hidden">
                <div
                  class={`mx-auto max-w-c-1390 px-6 py-7 rounded-[20px] bg-gradient-to-t flex xl:flex-row flex-col xl:items-center justify-between xl:gap-10 gap-6 ${
                    $isDarkMode
                      ? "from-[#0f0f0f] to-[#222222]"
                      : "from-[#F8F9FF] to-[#DEE7FF]"
                  }`}
                >
                  <div class="text-xl font-medium">
                    🏆 Congratulations! Top 3 Daily Check-in Champions of the
                    Month Claim your prize now for being among the elite. <br
                    /><br />
                    Claim before: {dayjs()
                      .utc()
                      .startOf("month")
                      .add(27, "day")
                      .format("YYYY-MM-DD hh:mm")}
                  </div>
                  <div class="xl:w-[184px] w-max h-[40px]">
                    {#if !dayjs()
                      .utc()
                      .isBefore(dayjs()
                          .utc()
                          .startOf("month")
                          .add(27, "day")) || isDisabledRedeem || ($user && Object.keys($user).length === 0)}
                      <Button disabled>Claim Prize</Button>
                    {:else}
                      <Button on:click={RedeemPrize}>Claim Prize</Button>
                    {/if}
                  </div>
                </div>
              </div>
            {/if} -->

            <div class="flex flex-col gap-4 mt-5 view-checkin-quests">
              <div class="text-lg font-medium">
                Want more GM Point? Complete these tasks!
              </div>
              {#if Object.keys($user).length !== 0}
                <div class="border-y-1 border_0000000d">
                  {#each quests as quest}
                    <div
                      class="flex sm:flex-row flex-col justify-between md:items-center items-start gap-5 py-4 border-b-1 last:border-none border_0000000d"
                    >
                      <div
                        class="flex-1 flex md:flex-row flex-col items-start gap-2"
                      >
                        <img
                          src={quest?.img ||
                            "https://s2.coinmarketcap.com/static/cloud/img/loyalty-program/Flags_3D_1.svg"}
                          alt=""
                          class="bg-yellow-200 rounded-lg mt-1 md:w-[32px] md:h-[32px] w-[52px] h-[52px]"
                        />
                        <div class="flex-1 flex items-center gap-4">
                          <div class="flex-1 flex flex-col">
                            <div class="text-base font-medium">
                              {quest?.title}
                            </div>
                            <div class="text-sm text-gray-500">
                              {@html quest?.description}
                            </div>
                          </div>
                          <div
                            class="md:flex hidden justify-center items-center gap-1"
                          >
                            <img src={goldImg} alt="" />
                            <div class="text-base font-medium">
                              {quest?.point}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-4">
                        <div class="sm:w-[170px] w-[120px]">
                          {#if quest?.id === "link-google"}
                            <div>
                              {#if quest.isDone}
                                <div class="py-1">
                                  <Button disabled>Done!</Button>
                                </div>
                              {:else}
                                <a href={quest?.url} class="py-1">
                                  <Button>Collect!</Button>
                                </a>
                              {/if}
                            </div>
                          {:else}
                            <div>
                              {#if quest?.isInternalLink}
                                {#if quest.isDone && quest.id !== "id-generate"}
                                  <Button disabled={quest.isDone}>Done!</Button>
                                {:else}
                                  <a href={quest?.url} class="py-1">
                                    <Button>Collect!</Button>
                                  </a>
                                {/if}
                              {:else}
                                <div class="py-1">
                                  {#if (selectedQuestId && isDisabledReceiveQuest) || quest.isDone}
                                    <Button disabled>Done!</Button>
                                  {:else}
                                    <div
                                      on:click={() => {
                                        if (!quest.isDone) {
                                          selectedQuestId = "";
                                          isDisabledReceiveQuest = false;
                                          handleReceiveQuest(
                                            quest?.url,
                                            quest?.id
                                          );
                                        }
                                      }}
                                    >
                                      <Button>Collect!</Button>
                                    </div>
                                  {/if}
                                </div>
                              {/if}
                            </div>
                          {/if}
                        </div>

                        <div
                          class="md:hidden flex justify-center items-center gap-1"
                        >
                          <img src={goldImg} alt="" />
                          <div class="text-base font-medium">
                            {quest?.point}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="border-y-1 border_0000000d">
                  {#each listQuest as quest}
                    <div
                      class="flex sm:flex-row flex-col justify-between md:items-center items-start gap-5 py-4 border-b-1 last:border-none border_0000000d"
                    >
                      <div
                        class="flex-1 flex md:flex-row flex-col items-start gap-2"
                      >
                        <img
                          src={quest?.img ||
                            "https://s2.coinmarketcap.com/static/cloud/img/loyalty-program/Flags_3D_1.svg"}
                          alt=""
                          class="bg-yellow-200 rounded-lg mt-1 md:w-[32px] md:h-[32px] w-[52px] h-[52px]"
                        />
                        <div class="flex-1 flex items-center gap-4">
                          <div class="flex-1 flex flex-col">
                            <div class="text-base font-medium">
                              {quest?.title}
                            </div>
                            <div class="text-sm text-gray-500">
                              {quest?.description}
                            </div>
                          </div>
                          <div
                            class="md:flex hidden justify-center items-center gap-1"
                          >
                            <img src={goldImg} alt="" />
                            <div class="text-base font-medium">
                              {quest?.point}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-4">
                        <div class="sm:w-[170px] w-[120px]">
                          <div class="py-1">
                            <Button disabled>Collect!</Button>
                          </div>
                        </div>

                        <div
                          class="md:hidden flex justify-center items-center gap-1"
                        >
                          <img src={goldImg} alt="" />
                          <div class="text-base font-medium">
                            {quest?.point}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          {#if selectedType === "history"}
            <div
              class={`border border_0000000d rounded-[10px] w-full max-h-[600px] overflow-y-auto ${
                $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
              }`}
            >
              <table class="table-auto w-full h-full">
                <thead>
                  <tr
                    class={`sticky top-0 ${
                      $isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    } `}
                  >
                    <th
                      class="py-2 pl-3 text-left font-medium uppercase text-sm"
                    >
                      Date
                    </th>
                    <th class="py-2">
                      <div class="flex items-center justify-start gap-2">
                        <div class="font-medium uppercase text-sm">Type</div>
                        <div on:click={toggleSortType} class="cursor-pointer">
                          {@html sortIcon(sortTypeHistory)}
                        </div>
                      </div>
                    </th>
                    <th class="py-2 pr-3">
                      <div class="flex items-center justify-end gap-2">
                        <div class="font-medium uppercase text-sm">Point</div>
                        <div on:click={toggleSortPoint} class="cursor-pointer">
                          {@html sortIcon(sortPointHistory)}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#if $queryDailyCheckin?.data === undefined}
                    <tr>
                      <td colspan="3">
                        <div
                          class="flex items-center justify-center h-full px-3 py-4 text-base"
                        >
                          Please connect wallet
                        </div>
                      </td>
                    </tr>
                  {:else}
                    {#if dataCheckinHistory.length === 0}
                      <tr>
                        <td class="text-center py-2" colspan="3">
                          You didn't checkin before
                        </td>
                      </tr>
                    {/if}
                    {#each defaultDataCheckinHistory as { point, type, createdAt }}
                      <tr class="group transition-all">
                        <td
                          class={`py-2 pl-3 text-left ${
                            $isDarkMode
                              ? "group-hover:bg-[#000]"
                              : "group-hover:bg-gray-100"
                          }`}
                        >
                          <div class="text-sm text_00000099 font-medium">
                            {dayjs(createdAt).format("YYYY-MM-DD")}
                          </div>
                        </td>
                        <td
                          class={`py-2 ${
                            $isDarkMode
                              ? "group-hover:bg-[#000]"
                              : "group-hover:bg-gray-100"
                          }`}
                        >
                          <div class="text-sm text_00000099 font-medium">
                            {type}
                          </div>
                        </td>
                        <td
                          class={`py-2 pr-3 text-right ${
                            $isDarkMode
                              ? "group-hover:bg-[#000]"
                              : "group-hover:bg-gray-100"
                          }`}
                        >
                          <div
                            class={`text-sm font-medium ${
                              point > 0
                                ? "text-green-500"
                                : point < 0
                                  ? "text-red-500"
                                  : ""
                            }`}
                          >
                            {point}
                          </div>
                        </td>
                      </tr>
                    {/each}
                  {/if}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

{#if openScreenSuccess}
  <div
    class="fixed h-screen w-screen top-0 left-0 z-[19] flex items-center justify-center bg-[#000000cc]"
    on:click={() => {
      setTimeout(() => {
        openScreenSuccess = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Received successfully
      </div>
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        +{$queryDailyCheckin?.data?.pointStreak[selectedIndexRewards]} GM Points
      </div>
    </div>
  </div>
{/if}

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}

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
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
