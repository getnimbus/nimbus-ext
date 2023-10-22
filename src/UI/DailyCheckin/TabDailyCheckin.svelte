<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, userPublicAddress } from "~/store";
  import { dailyCheckinTypePortfolio, triggerFirework } from "~/utils";
  import dayjs from "dayjs";

  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  const rankBackground = [
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/1stframe.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/2ndframe.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/3rdframe.png",
  ];

  const rank = [
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/1st.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/2nd.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/3rd.png",
  ];

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let selectedType: "collectGMPoint" | "history" = "collectGMPoint";
  let openScreenSuccess: boolean = false;
  let isLoadingCheckin: boolean = false;
  let selectedCheckinIndex = 0;
  let selectedIndexRewards: number = 0;
  let isDisabledCheckin = false;

  const queryClient = useQueryClient();

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${$userPublicAddress}`);
    if (response?.status === 403) {
      throw new Error(response?.response?.error);
    }
    return response.data;
  };

  const handleRewards = async () => {
    const response = await nimbus.post(`/v2/reward`, {
      address: $userPublicAddress,
    });
    if (response?.status === 403) {
      throw new Error(response?.response?.error);
    }
    return response.data;
  };

  const triggerCheckinSuccess = () => {
    openScreenSuccess = true;
    triggerFirework();
    setTimeout(() => {
      openScreenSuccess = false;
    }, 2000);
  };

  const handleCheckin = async () => {
    isLoadingCheckin = true;
    try {
      const response = await nimbus.post(`/v2/checkin`, {});
      if (response?.data !== undefined) {
        triggerCheckinSuccess();
        isDisabledCheckin = true;
        queryClient.invalidateQueries([$userPublicAddress, "daily-checkin"]);
      }
    } catch (error) {
      console.error("this err : ", error);
    } finally {
      isLoadingCheckin = false;
    }
  };

  $: queryReward = createQuery({
    queryKey: [$userPublicAddress, "rewards"],
    queryFn: () => handleRewards(),
    staleTime: Infinity,
    enabled:
      Object.keys(userInfo).length !== 0 && $userPublicAddress.length !== 0,
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
      Object.keys(userInfo).length !== 0 && $userPublicAddress.length !== 0,
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
            <img
              src="https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg"
              alt=""
              class="w-13"
            />
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
                <div class="grid grid-cols-7 gap-4 w-[1350px]">
                  {#each $queryDailyCheckin?.data?.pointStreak || [] as item, index}
                    <div
                      class={`flex flex-col gap-2 items-center filter rounded-lg py-8 transform scale-95 transition-all ${
                        selectedCheckinIndex > index && darkMode
                          ? "grayscale bg-gray-700"
                          : selectedCheckinIndex > index && !darkMode
                          ? "grayscale bg-gray-100"
                          : selectedCheckinIndex === index
                          ? "bg-black text-white scale-100 drop-shadow-lg"
                          : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-100"
                      }`}
                    >
                      <div class="xl:text-lg text-xl font-medium">
                        Day {index + 1}
                      </div>
                      <img
                        src="https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg"
                        alt=""
                        class="w-13"
                      />
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
          {:else}
            <div class="xl:text-lg text-xl font-medium">Checkin History</div>
            <div
              class={`border border_0000000d rounded-[10px] w-full max-h-[600px] overflow-y-auto ${
                darkMode ? "bg-[#131313]" : "bg-[#fff]"
              }`}
            >
              <table class="table-auto w-full h-full">
                <thead>
                  <tr
                    class={`sticky top-0 ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    } `}
                  >
                    <th class="py-2 pl-3 text-left font-medium">Date</th>
                    <th class="py-2 pr-3 text-right font-medium">Point</th>
                  </tr>
                </thead>
                {#if $queryDailyCheckin?.data === undefined}
                  <tbody>
                    <tr>
                      <td colspan="2">
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
                        <td class="text-center py-2" colspan="2"
                          >You didn't checkin before</td
                        >
                      </tr>
                    {/if}
                    {#each $queryDailyCheckin?.data?.checkinLogs || [] as { point, createdAt }}
                      <tr>
                        <td class="py-2 pl-3 text-left"
                          >{dayjs(createdAt).format("YYYY-MM-DD")}</td
                        >
                        <td class="py-2 pr-3 text-right text-green-500"
                          >{point}</td
                        >
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
      <img
        src="https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg"
        alt=""
        class="w-40 h-40"
      />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        +{$queryDailyCheckin?.data?.pointStreak[selectedIndexRewards]} GM Points
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
