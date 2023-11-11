<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, userPublicAddress } from "~/store";
  import { dailyCheckinTypePortfolio, triggerFirework } from "~/utils";
  import dayjs from "dayjs";
  import { wait } from "~/entries/background/utils";

  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  import img1stframe from "~/assets/dailycheckin/1stframe.png";
  import img2stframe from "~/assets/dailycheckin/2ndframe.png";
  import img3stframe from "~/assets/dailycheckin/3rdframe.png";

  import rank1 from "~/assets/dailycheckin/1st.png";
  import rank2 from "~/assets/dailycheckin/2nd.png";
  import rank3 from "~/assets/dailycheckin/3rd.png";

  import goldImg from "~/assets/Gold4.svg";

  const rankBackground = [img1stframe, img2stframe, img3stframe];

  const rank = [rank1, rank2, rank3];

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

  const queryClient = useQueryClient();

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${$userPublicAddress}`);
    return response.data;
  };

  const handleRewards = async () => {
    const response = await nimbus.post(`/v2/reward`, {
      address: $userPublicAddress,
    });
    return response.data;
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

  $: queryReward = createQuery({
    queryKey: [$userPublicAddress, "rewards"],
    queryFn: () => handleRewards(),
    staleTime: Infinity,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      $userPublicAddress.length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
    queryFn: () => handleDailyCheckin(),
    staleTime: Infinity,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      $userPublicAddress.length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      selectedCheckinIndex = $queryDailyCheckin?.data?.steak;
      isDisabledCheckin = $queryDailyCheckin?.data?.checkinable;
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
</script>

<div class="flex flex-col gap-4 min-h-screen">
  <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
    <div class="xl:title-3 title-1">My Nimbus GM Points</div>
    <div class="xl:text-base text-xl text-gray-500">
      Collect GM Points and redeem them for exclusive rewards and special offers
    </div>
  </div>

  {#if $queryDailyCheckin.isFetching && $queryReward.isFetching}
    <div class="flex items-center justify-center h-screen">
      <Loading />
    </div>
  {:else}
    <div class="flex flex-col gap-7 mt-2">
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
                class="relative cursor-pointer xl:text-base text-xl font-medium py-2 px-3 rounded-xl transition-all"
                on:click={() => (selectedType = type.value)}
              >
                <div
                  class={`relative z-[19] ${
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
                      class="absolute inset-0 rounded-full bg-[#1E96FC] -z-10"
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
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <div class="xl:text-lg text-xl font-medium">
                  Collect your GM Points every day
                </div>
                <div class="xl:text-base text-lg text-gray-500">
                  Check in 7 days in a row, your rewards will grow
                </div>
              </div>
              <div class="w-[200px]">
                {#if isDisabledCheckin}
                  <Button
                    variant="primary"
                    on:click={() => {
                      selectedIndexRewards = $queryDailyCheckin?.data?.steak;
                      handleCheckin();
                    }}
                    isLoading={isLoadingCheckin}
                  >
                    <div
                      class="py-1 text-2xl font-medium text-white xl:text-base"
                    >
                      👋 GM
                    </div>
                  </Button>
                {:else}
                  <Button disabled>
                    <div
                      class="py-1 text-2xl font-medium text-white xl:text-base"
                    >
                      Checked
                    </div>
                  </Button>
                {/if}
              </div>
            </div>

            {#if $queryDailyCheckin?.data === undefined}
              <div
                class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[152px]"
              >
                Empty
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
                      <div class="xl:text-lg text-xl font-medium">
                        Day {index + 1}
                      </div>
                      <img src={goldImg} alt="" class="w-13" />
                      <div class="xl:text-2xl text-3xl font-medium">
                        + {item}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <div class="flex flex-col gap-4">
              <div class="xl:text-lg text-xl font-medium">
                This month reward
              </div>
              {#if $queryReward.data === undefined}
                <div
                  class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[152px]"
                >
                  Empty
                </div>
              {:else}
                <div class="flex gap-6">
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
                        <div class="xl:text-base text-lg text-center">
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
              {/if}
            </div>

            <!-- gm point optimize -->
            <div class="flex flex-col gap-4">
              <div class="xl:text-lg text-xl font-medium">
                Collect your GM Points every day
              </div>
              <div class="py-1 border-y-2 border_0000000d">
                <div class="flex justify-between items-center py-4">
                  <div class="flex gap-2 items-center">
                    <img
                      src="https://s2.coinmarketcap.com/static/cloud/img/loyalty-program/Flags_3D_1.svg"
                      alt=""
                      class="bg-yellow-200 rounded-xl p-2"
                    />
                    <div class="flex flex-col">
                      <div class="font-medium">
                        Share the Goodies: Spread the Wealth!
                      </div>
                      <div class="xl:text-base text-lg text-gray-500">
                        Ref others connect the wallet to earn points (The
                        connect wallet must have a balance > 10$)
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-5 items-center">
                    <div class="flex gap-1 items-center p-1 font-medium">
                      <img src={goldImg} alt="" />
                      <div>20</div>
                    </div>
                    <div class="w-[170px]">
                      <Button>
                        <div class="py-1">Collect!</div>
                      </Button>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between items-center py-4">
                  <div class="flex gap-2 items-center">
                    <img
                      src="https://s2.coinmarketcap.com/static/cloud/img/loyalty-program/Flags_3D_1.svg"
                      alt=""
                      class="bg-yellow-200 rounded-xl p-2"
                    />
                    <div class="flex flex-col">
                      <div class="font-medium">
                        Your First Check-In Adventure Mission!
                      </div>
                      <div class="xl:text-base text-lg text-gray-500">
                        First-time time redeem
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-5 items-center">
                    <div class="flex gap-1 items-center p-1 font-medium">
                      <img src={goldImg} alt="" />
                      <div>10</div>
                    </div>
                    <div class="w-[170px]">
                      <Button>
                        <div class="py-1">Collect!</div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {:else}
            <div class="xl:text-lg text-xl font-medium">Checkin History</div>
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
                    <th class="py-2 pl-3 text-left font-medium">Date</th>
                    <th class="py-2 text-left font-medium">Type</th>
                    <th class="py-2 pr-3 text-right font-medium">Point</th>
                  </tr>
                </thead>
                {#if $queryDailyCheckin?.data === undefined}
                  <tbody>
                    <tr>
                      <td colspan="3">
                        <div
                          class="flex items-center justify-center h-full px-3 py-4"
                        >
                          Please connect wallet
                        </div>
                      </td>
                    </tr>
                  </tbody>
                {:else}
                  <tbody>
                    {#if $queryDailyCheckin?.data?.checkinLogs.length === 0}
                      <tr>
                        <td class="text-center py-2" colspan="3">
                          You didn't checkin before
                        </td>
                      </tr>
                    {/if}
                    {#each $queryDailyCheckin?.data?.checkinLogs || [] as { point, type, createdAt }}
                      <tr>
                        <td class="py-2 pl-3 text-left">
                          {dayjs(createdAt).format("YYYY-MM-DD")}
                        </td>
                        <td class="py-2">{type}</td>
                        <td
                          class={`py-2 pr-3 text-right ${
                            point > 0
                              ? "text-green-500"
                              : point < 0
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          {point}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                {/if}
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
    class="fixed h-screen w-screen top-0 left-0 z-[19] flex items-center justify-center bg-[#000000cc]"
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

<style windi:preflights:global windi:safelist:global>
</style>
