<script>
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import Loading from "~/components/Loading.svelte";
  import { nimbus } from "~/lib/network";

  const img = {
    leaderboardFrame:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/beta/src/assets/leaderboard/frameLeaderboard.png",
    rank1:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/8a2c618aa211964a0863fa4826ed3e9af08ba396/src/assets/leaderboard/Rank1.svg",
    rank2:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/8a2c618aa211964a0863fa4826ed3e9af08ba396/src/assets/leaderboard/Rank2.svg",
    rank3:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/8a2c618aa211964a0863fa4826ed3e9af08ba396/src/assets/leaderboard/Rank3.svg",
    rankstatus:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/beta/src/assets/leaderboard/Rankstatus.png",
  };

  let dailyCheckinData;
  let userCurrentRank;
  let selectedWallet = localStorage.getItem("evm_address");
  let top3Wallet = [];
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

  $: queryDailyCheckin = createQuery({
    queryKey: ["daily-checkin", selectedWallet],
    queryFn: () => handleDailyCheckin(),
    staleTime: Infinity,
    enabled: true,
  });

  const handleThing = () => {
    return dailyCheckinData.checkinLeaderboard.indexOf(userCurrentRank) + 1;
  };

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      dailyCheckinData = $queryDailyCheckin?.data?.data;
    }
  }

  $: {
    if (dailyCheckinData !== undefined) {
      userCurrentRank = dailyCheckinData?.checkinLeaderboard.find(
        (e) => e.owner === selectedWallet
      );
      top3Wallet = dailyCheckinData?.checkinLeaderboard.slice(0, 3);
    }
  }
</script>

<div class="flex flex-col items-center">
  {#if $queryDailyCheckin.isLoading}
    <div class="flex items-center justify-center h-full px-3 py-4">
      <Loading />
    </div>
  {:else}
    <!-- leader board -->
    <div class="relative border border-green-600">
      <div class="relative">
        <img
          src={img.leaderboardFrame}
          alt="Leaderboard frame"
          class="opacity-50 w-[700px]"
        />
        <div class="absolute bottom-0 left-0 w-full h-full">
          <img
            src={img.rankstatus}
            alt=""
            class="absolute left-[10%] -bottom-24 w-[80%]"
          />
          <div
            class="absolute top-[40%] left-[50%] absolute-center flex flex-col items-center justify-center"
          >
            <img src={img.rank1} alt="" class="w-36 h-32" />
            <div class="flex flex-col gap-2 text-center">
              <div class="text-lg font-medium">Alfonso Bator</div>
              <div>
                <span class="text-yellow-400 font-medium text-lg">
                  {top3Wallet[0]._sum.point}
                </span> GM point
              </div>
            </div>
          </div>
          <div
            class="absolute top-[29%] left-6 flex flex-col items-center justify-center"
          >
            <img src={img.rank2} alt="" class="w-36 h-32" />
            <div class="flex flex-col gap-2 text-center">
              <div class="text-lg font-medium">Alfonso Bator</div>
              <div>
                <span class="text-yellow-400 font-medium text-lg">
                  {top3Wallet[1]._sum.point}
                </span> GM point
              </div>
            </div>
          </div>
          <div
            class="absolute top-[32%] right-6 flex flex-col items-center justify-center"
          >
            <img src={img.rank3} alt="" class="w-32 h-28" />
            <div class="flex flex-col gap-2 text-center">
              <div class="text-lg font-medium">
                <!-- <span class="text-yellow-400 font-medium text-xl">3.</span> -->
                Alfonso Bator
              </div>
              <div>
                <span class="text-yellow-400 font-medium text-lg">
                  {top3Wallet[2]._sum.point}
                </span> GM point
              </div>
            </div>
          </div>
          <span
            class="absolute bottom-0 left-[50%] absolute-center flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 50 50"
            >
              <path
                fill="currentColor"
                d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17s-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15s15-6.7 15-15s-6.7-15-15-15z"
              />
              <path
                fill="currentColor"
                d="M24 32h2v2h-2zm1.6-2h-1.2l-.4-8v-6h2v6z"
              />
            </svg>
            <span class="whitespace-nowrap">
              This rank will reset every month
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- the table  -->

    <div class="w-full rounded-xl max-h-[600px] overflow-y-auto">
      <table class="w-full table-auto rounded-xl">
        <thead class="sticky top-0">
          <tr class="bg-[#FFB800]">
            <td colspan="3" class="text-left text-sm rounded-t-xl pt-2 px-3">
              Your current rank
            </td>
          </tr>
          <tr class="bg-[#FFB800]">
            <th class="px-3 pb-3 pt-1 text-left">
              {handleThing()}
            </th>
            <th class="pb-3 pt-1 text-left">
              {userCurrentRank.owner}
            </th>
            <th class="pr-3 pb-3 pt-1 text-right">
              {userCurrentRank._sum.point} point
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" class="px-3 py-2 text-left font-medium">
              Runners up
            </td>
          </tr>
          {#each dailyCheckinData.checkinLeaderboard as item, index}
            <tr>
              <td class="px-3 py-2 text-left">{index + 1}</td>
              <td class="py-2 text-left">{item.owner}</td>
              <td class="pr-3 py-2 text-right">
                <span class="text-yellow-400 font-medium">
                  {item._sum.point}
                </span> point
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .absolute-center {
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }
</style>
