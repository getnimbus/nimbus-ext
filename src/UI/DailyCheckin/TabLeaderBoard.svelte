<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import Loading from "~/components/Loading.svelte";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, userPublicAddress } from "~/store";
  import { shorterAddress } from "~/utils";

  const img = {
    leaderboardFrame:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/frameLeaderboard.png",
    rank1:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/eecd3ee46b098a2d8f4bb57c7c26dc8029d3304a/src/assets/dailycheckin/Rank1.svg",
    rank2:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/eecd3ee46b098a2d8f4bb57c7c26dc8029d3304a/src/assets/dailycheckin/Rank2.svg",
    rank3:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/eecd3ee46b098a2d8f4bb57c7c26dc8029d3304a/src/assets/dailycheckin/Rank3.svg",
    rankstatus:
      "https://raw.githubusercontent.com/getnimbus/nimbus-ext/feat/daily-checking/src/assets/dailycheckin/Rankstatus.png",
  };

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let userCurrentRank;
  let top3Wallet = [];

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${$userPublicAddress}`);
    return response.data;
  };

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
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
        (item) => item.owner === $userPublicAddress
      );
      top3Wallet = $queryDailyCheckin?.data?.checkinLeaderboard.slice(0, 3);
    }
  }
</script>

<div class="flex flex-col items-center border-t-[1.5px] border_0000000d pt-4">
  {#if $userPublicAddress === ""}
    <div class="flex items-center justify-center h-full px-3 py-4">
      Please connect wallet
    </div>
  {:else if $queryDailyCheckin.isLoading}
    <div class="flex items-center justify-center h-full px-3 py-4">
      <Loading />
    </div>
  {:else}
    <!-- leader board -->
    <div class="relative -z-10">
      <div class="relative pb-40">
        <img
          src={img.leaderboardFrame}
          alt="Leaderboard frame"
          class="opacity-50 w-[600px]"
        />
        <div class="absolute bottom-0 left-0 w-full h-full">
          <img
            src={img.rankstatus}
            alt=""
            class="absolute left-[10%] -bottom-24 w-[80%]"
          />
          <div
            class="absolute top-[34%] left-[50%] absolute-center flex flex-col items-center justify-center"
          >
            <img src={img.rank1} alt="" class="w-52 h-48" />
            {#if top3Wallet.length < 1}
              <div class="text-lg font-medium">N/a</div>
            {:else}
              <div class="flex flex-col gap-2 text-center">
                <div class="text-lg font-medium">
                  {shorterAddress(top3Wallet[0]?.owner)}
                </div>
                <div>
                  <span class="text-yellow-400 font-medium text-lg">
                    {top3Wallet[0]?._sum.point}
                  </span> GM point
                </div>
              </div>
            {/if}
          </div>
          <div
            class="absolute top-[26.5%] left-8 flex flex-col items-center justify-center"
          >
            <img src={img.rank2} alt="" class="w-48 h-44" />
            {#if top3Wallet.length < 2}
              <div class="text-lg font-medium">N/a</div>
            {:else}
              <div class="flex flex-col gap-2 text-center -mt-4">
                <div class="text-lg font-medium">
                  {shorterAddress(top3Wallet[1]?.owner)}
                </div>
                <div>
                  <span class="text-yellow-400 font-medium text-lg">
                    {top3Wallet[1]?._sum.point}
                  </span> GM point
                </div>
              </div>
            {/if}
          </div>
          <div
            class="absolute top-[30%] right-8 flex flex-col items-center justify-center"
          >
            <img src={img.rank3} alt="" class="w-40 h-36" />
            {#if top3Wallet.length < 3}
              <div class="text-lg font-medium">N/a</div>
            {:else}
              <div class="flex flex-col gap-2 text-center">
                <div class="text-lg font-medium">
                  <!-- <span class="text-yellow-400 font-medium text-xl">3.</span> -->
                  {shorterAddress(top3Wallet[2]?.owner)}
                </div>
                <div>
                  <span class="text-yellow-400 font-medium text-lg">
                    {top3Wallet[2]?._sum.point}
                  </span> GM point
                </div>
              </div>
            {/if}
          </div>
          <span
            class="absolute bottom-8 left-[50%] text-black absolute-center flex items-center gap-1 px-2 py-1 rounded-lg opacity-50 shadow-dark-50 shadow"
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
    <div
      class="xl:w-3/5 w-full rounded-xl border border-[#ffb800] shadow-top shadow-dark-700 -mt-8"
    >
      <table
        class={`w-full table-auto rounded-xl  ${
          darkMode ? "bg-[#161616]" : "bg-white"
        }`}
      >
        <thead>
          <tr class="bg-[#FFB800]">
            <td
              colspan="3"
              class="text-left xl:text-sm text-base rounded-t-xl pt-2 px-6"
            >
              Your current rank
            </td>
          </tr>
          <tr class="bg-[#FFB800] xl:text-base text-xl font-medium">
            <td
              class={`px-6 pb-3 pt-1 text-left text-3xl font-normal w-6 ${
                !darkMode && "text-[#27326F]"
              }`}
            >
              {handleThing()}
            </td>
            <td class="pb-3 pt-1 text-left">
              {userCurrentRank?.owner
                ? shorterAddress(userCurrentRank?.owner)
                : "You are not checkin yet!!!"}
            </td>
            <td class="pr-6 pb-3 pt-1 text-right">
              <span class="text-lg">{userCurrentRank?._sum?.point || 0}</span>
              GM point
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" class="px-3">
              <table class="w-full table-auto">
                <tbody>
                  <tr>
                    <td
                      colspan="3"
                      class="px-3 py-2 text-left font-medium xl:text-base text-xl"
                    >
                      Runners up
                    </td>
                  </tr>
                  {#if $queryDailyCheckin?.data?.checkinLeaderboard.length === 0}
                    <tr>
                      <td>There is no one checkin yet</td>
                    </tr>
                  {:else if $queryDailyCheckin?.data?.checkinLeaderboard < 3}
                    <tr>
                      <td>Currently, no one has left the top 3 yet.</td>
                    </tr>
                  {/if}
                  {#each $queryDailyCheckin?.data?.checkinLeaderboard.slice(3, 20) as item, index}
                    <tr
                      class={`xl:text-base text-xl ${
                        index !== 16 && "border-b"
                      } hover:${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
                    >
                      <td
                        class={`px-3 py-2 text-3xl font-light text-left w-6 ${
                          !darkMode && "text-[#27326F]"
                        }`}
                      >
                        {index + 4}
                      </td>
                      <td class="py-2 text-left">
                        {shorterAddress(item.owner)}
                      </td>
                      <td class="pr-3 py-2 text-right text-sm">
                        <span class="text-yellow-400 text-lg font-medium">
                          {item?._sum.point}
                        </span> GM point
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </td>
          </tr>
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

  .shadow-top {
    box-shadow: 0px -10px 20px #c3c3c3;
  }
</style>
