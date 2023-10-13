<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, userId, wallet, publicEvmAddress } from "~/store";
  import { dailyCheckinTypePortfolio, triggerFirework } from "~/utils";

  let selectedTypePerformance: "collectGMPoint" | "history" = "collectGMPoint";

  let openScreenSuccess = false;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let isLoadingCheckin = false;

  const queryClient = useQueryClient();

  const shortDate = (date: string) => {
    return date.split("").slice(0, date.indexOf("T")).join("");
  };

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${$publicEvmAddress}`);
    return response.data;
  };

  const onClose = () => {
    setTimeout(() => {
      openScreenSuccess = false;
    }, 500);
  };

  const triggerCheckinSuccess = () => {
    openScreenSuccess = true;
    triggerFirework();
    setTimeout(() => {
      openScreenSuccess = false;
    }, 2000);
  };

  const handleRewards = async () => {
    const response = await nimbus.post(`/v2/reward`, {
      address: $publicEvmAddress,
    });
    console.log("response bla bla : ", response.data);
    return response.data;
  };

  const handleCheckin = async () => {
    isLoadingCheckin = true;
    try {
      const response = await nimbus.post(`/v2/checkin`, {});
      if (response?.data !== undefined) {
        triggerCheckinSuccess();
        queryClient.invalidateQueries(["daily-checkin"]);
      }
    } catch (error) {
      console.log("this err : ", error);
    }
    isLoadingCheckin = false;
  };

  $: queryReward = createQuery({
    queryKey: [$publicEvmAddress, "rewards"],
    queryFn: () => handleRewards(),
    enabled: Object.keys(userInfo).length !== 0,
    staleTime: Infinity,
  });

  $: queryDailyCheckin = createQuery({
    queryKey: [$publicEvmAddress, "daily-checkin"],
    queryFn: () => handleDailyCheckin(),
    staleTime: Infinity,
    enabled: Object.keys(userInfo).length !== 0,
    onError(err) {
      user.update((n) => (n = {}));
    },
  });

  $: console.log("queryDailyCheckin : ", $queryDailyCheckin?.data);

  const imgGold =
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg";

  const rankFrameImg = [
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/1stframe.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/2ndframe.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/3rdframe.png",
  ];
  const rankImg = [
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/1st.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/2nd.png",
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/3rd.png",
  ];
</script>

{#if $publicEvmAddress === ""}
  <div class="flex items-center justify-center h-full px-3 py-4">
    Please connect wallet
  </div>
{:else if $queryDailyCheckin.isFetching}
  <div class="flex items-center justify-center h-screen">
    <Loading />
  </div>
{:else}
  <div
    class={`rounded-lg flex flex-col gap-10 ${
      darkMode ? "text-white" : "text-black"
    } `}
  >
    <div
      class="flex flex-col gap-5 bg-[#1589EB] text-white px-6 py-5 rounded-lg w-[400px]"
    >
      <span>My GM Points</span>
      <span class="text-4xl font-medium flex gap-2">
        {#if $queryDailyCheckin.isFetching}
          <Loading />
        {:else}
          {$queryDailyCheckin?.data?.totalPoint || 0}
        {/if}
        <img src={imgGold} alt="" class="w-12" />
      </span>
    </div>
    <div>
      <div class="flex items-center gap-2 mb-2">
        <AnimateSharedLayout>
          {#each dailyCheckinTypePortfolio as type}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium py-2 px-3 rounded-xl transition-all"
              on:click={() => (selectedTypePerformance = type.value)}
            >
              <div
                class={`relative z-20 ${
                  selectedTypePerformance === type.value && "text-white"
                }`}
              >
                {type.label}
              </div>
              {#if type.value === selectedTypePerformance}
                <Motion
                  let:motion
                  layoutId="active-pill"
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <div
                    class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                    use:motion
                  />
                </Motion>
              {/if}
            </div>
          {/each}
        </AnimateSharedLayout>
      </div>
      <div class="flex flex-col gap-5 py-3">
        <div class="flex items-center justify-between">
          {#if selectedTypePerformance === "collectGMPoint"}
            <div class="flex flex-col gap-1">
              <div class="xl:title-3 title-1">
                Collect your GM Points every day
              </div>
              <div class="xl:text-base text-xl text-gray-500">
                Check in 7 days in a row, your rewards will grow
              </div>
            </div>
          {:else}
            <div class="py-4">
              <span class="font-medium text-2xl">Checkin History</span>
            </div>
          {/if}
          <div class="w-[230px] xl:h-auto h-12">
            {#if $queryDailyCheckin?.data?.checkinable}
              <Button
                variant="primary"
                on:click={handleCheckin}
                isLoading={isLoadingCheckin}
              >
                <div class="py-1">👋 GM</div>
              </Button>
            {:else}
              <Button variant="disabled" disabled>
                <div class="py-1">Checked</div>
              </Button>
            {/if}
          </div>
        </div>
        {#if selectedTypePerformance === "collectGMPoint"}
          <div class="overflow-x-auto py-6">
            <div class="grid grid-cols-7 gap-10 w-[1350px]">
              {#each $queryDailyCheckin?.data?.pointStreak || [] as item, index}
                <div
                  class={`flex flex-col gap-1 items-center rounded-xl py-10 px-6 ${
                    $queryDailyCheckin?.data?.steak > index && darkMode
                      ? "grayscale bg-gray-700"
                      : $queryDailyCheckin?.data?.steak > index && !darkMode
                      ? "grayscale bg-gray-100"
                      : $queryDailyCheckin?.data?.steak === index
                      ? "bg-black text-white"
                      : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}
                >
                  <span> Day {index + 1}</span>
                  <img src={imgGold} alt="" class="w-12" />
                  <span class="text-2xl">+{item}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="flex flex-col gap-5">
            <div class="xl:title-3 title-1">
              Collect your GM Points every day
            </div>
            <div class="flex gap-5">
              {#each $queryReward?.data?.monthRewards as item, index}
                <div>
                  <div
                    class="relative h-[250px] w-[185px] flex flex-col items-center justify-center gap-3 text-white"
                  >
                    <img
                      src={rankFrameImg[index]}
                      alt=""
                      class="absolute top-0 left-0 -z-99"
                    />
                    <img src={rankImg[index]} alt="" class="h-[70px] mb-2" />
                    <div class="text-3xl text-center">${item.amount}</div>
                    <div class="text-center">
                      {index + 1}{index === 0 ? "st" : index == 1 ? "nd" : "rd"}
                      Rank
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div class="w-full h-[250px] overflow-y-auto rounded-lg">
            <table class="table-auto w-full">
              <thead>
                <tr
                  class={`sticky top-0 ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  } `}
                >
                  <th class="py-2 pl-3 text-left">Date</th>
                  <th class="py-2 pr-3 text-right">Point</th>
                </tr>
              </thead>
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
                    <td class="py-2 pl-3 text-left">{shortDate(createdAt)}</td>
                    <td class="py-2 pr-3 text-right text-green-500">{point}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if openScreenSuccess}
  <div
    class="fixed h-screen w-screen top-0 left-0 z-20 flex items-center justify-center bg-[#000000cc]"
    on:click={onClose}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <span>Received successfully</span>
      <div>
        <img src={imgGold} alt="" class="w-40 h-40" />
      </div>
      <div class="text-5xl text-white">
        +{$queryDailyCheckin?.data?.pointStreak[
          $queryDailyCheckin?.data?.steak
        ]} GM Points
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global></style>
