<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, wallet } from "~/store";
  import { dailyCheckinTypePortfolio, triggerFirework } from "~/utils";

  let selectedTypePerformance: "collectGMPoint" | "history" = "collectGMPoint";
  let dailyCheckinData;
  let selectedWallet = localStorage.getItem("evm_address");

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let buttonDisable = false;

  const queryClient = useQueryClient();

  // address for demo
  const demowallet = "0a4a66ef-3340-40f8-89da-205fedfd0a2d";

  const handleDailyCheckin = async () => {
    try {
      const response = await nimbus.get(`/v2/checkin/${selectedWallet}`);
      return response;
    } catch (error) {
      console.log("error : ", error);
    }
  };

  const handleCheckin = async () => {
    try {
      const response = await nimbus.post(`/v2/checkin`, {});
      if (response?.data !== undefined) {
        triggerFirework();
        buttonDisable = true;
      }
      queryClient.invalidateQueries({ queryKey: ["daily-checkin"] });
      return response;
    } catch (error) {
      console.log("this err : ", error);
      return undefined;
    }
  };

  const shortDate = (date: string) => {
    return date.split("").slice(0, date.indexOf("T")).join("");
  };

  $: queryDailyCheckin = createQuery({
    queryKey: ["daily-checkin", selectedWallet],
    queryFn: () => handleDailyCheckin(),
    staleTime: Infinity,
    enabled: true,
  });

  // $: console.log(
  //   "This is the daily checkin api : ",
  //   $queryDailyCheckin?.data?.data
  // );

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      dailyCheckinData = $queryDailyCheckin?.data?.data;
    }
  }

  const goldImg =
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg";
</script>

<div
  class={`rounded-lg flex flex-col gap-10 ${
    darkMode ? "text-white" : "text-black"
  } `}
>
  <div
    class="flex flex-col gap-5 bg-[#1589EB] text-white px-6 py-5 rounded-lg w-[400px]"
  >
    <span class="text-sm">My GM Points</span>
    <span class="text-4xl font-medium">{dailyCheckinData?.totalPoint}</span>
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
    {#if $queryDailyCheckin.isLoading}
      <div class="flex items-center justify-center h-full px-3 py-4">
        <Loading />
      </div>
    {:else}
      <div class="flex flex-col gap-5 py-3">
        <div class="flex items-center justify-between">
          {#if selectedTypePerformance === "collectGMPoint"}
            <div class="flex flex-col gap-2">
              <span class="font-medium text-2xl">
                Collect your GM Points every day
              </span>
              <span>Check in 7 days in a row, your rewards will grow </span>
            </div>
          {:else}
            <div class="py-4">
              <span class="font-medium text-2xl">Checkin History</span>
            </div>
          {/if}
          <div class="w-[230px] xl:h-auto h-12">
            {#if !dailyCheckinData.checkinable || buttonDisable}
              <Button variant="disabled" disabled>
                <div class="py-1">Checked</div>
              </Button>
            {:else}
              <Button
                variant="primary"
                on:click={() => {
                  handleCheckin();
                }}
              >
                <div class="py-1">👋 GM</div>
              </Button>
            {/if}
          </div>
        </div>
        {#if selectedTypePerformance === "collectGMPoint"}
          <div class="overflow-x-auto py-6">
            <div class="grid grid-cols-7 gap-10 w-[1350px]">
              {#each dailyCheckinData.pointStreak as item, index}
                <div
                  class={`flex flex-col gap-2 items-center rounded-xl py-10 px-6 ${
                    dailyCheckinData?.steak === index
                      ? "bg-black text-white"
                      : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}
                >
                  <span> Day {index + 1}</span>
                  <img src={goldImg} alt="" class="w-12" />
                  <span class="text-3xl">+{item}</span>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div class="w-full max-h-[250px] overflow-y-auto rounded-lg">
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
                {#each dailyCheckinData?.checkinLogs as { point, createdAt }}
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
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
