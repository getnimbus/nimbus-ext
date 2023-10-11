<script>
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import Loading from "~/components/Loading.svelte";
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

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

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let userCurrentRank;
  let selectedWallet = localStorage.getItem("evm_address");
  let top3Wallet = [];

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${selectedWallet}`);
    return response.data;
  };

  $: queryDailyCheckin = createQuery({
    queryKey: ["daily-checkin", selectedWallet],
    queryFn: () => handleDailyCheckin(),
    enabled: Object.keys(userInfo).length !== 0,
    staleTime: Infinity,
  });

  const handleThing = () => {
    return (
      $queryDailyCheckin?.data.checkinLeaderboard.indexOf(userCurrentRank) + 1
    );
  };

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      userCurrentRank = $queryDailyCheckin?.data?.checkinLeaderboard.find(
        (item) => item.owner === selectedWallet
      );

      top3Wallet = $queryDailyCheckin?.data?.checkinLeaderboard.slice(0, 3);
    }
  }

  $: console.log("this is sum : ", $queryDailyCheckin?.data);
</script>

<div class="flex flex-col items-center">
  {#if $queryDailyCheckin.isLoading}
    <div class="flex items-center justify-center h-full px-3 py-4">
      <Loading />
    </div>
  {:else}
    <!-- leader board -->
    <div class="relative border border-green-500">
      <div class="relative pb-40">
        <img
          src={img.leaderboardFrame}
          alt="Leaderboard frame"
          class="opacity-50 w-[650px]"
        />
        <div class="absolute bottom-0 left-0 w-full h-full">
          <img
            src={img.rankstatus}
            alt=""
            class="absolute left-[10%] -bottom-24 w-[80%]"
          />
          <div
            class="absolute top-[38%] left-[50%] absolute-center flex flex-col items-center justify-center"
          >
            <img src={img.rank1} alt="" class="w-40 h-36" />
            <div class="flex flex-col gap-2 text-center">
              <div class="text-lg font-medium">Alfonso Bator</div>
              <div>
                <span class="text-yellow-400 font-medium text-lg">
                  {top3Wallet[0]?._sum.point}
                </span> GM point
              </div>
            </div>
          </div>
          <div
            class="absolute top-[34.5%] left-12 flex flex-col items-center justify-center"
          >
            <img src={img.rank2} alt="" class="w-40 h-36" />
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
            class="absolute top-[37%] right-12 flex flex-col items-center justify-center"
          >
            <img src={img.rank3} alt="" class="w-36 h-32" />
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
          {#each $queryDailyCheckin?.data?.checkinLeaderboard as item, index}
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
