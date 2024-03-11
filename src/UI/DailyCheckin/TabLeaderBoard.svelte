<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, userPublicAddress } from "~/store";
  import { shorterAddress } from "~/utils";

  import Loading from "~/components/Loading.svelte";

  import rank1 from "~/assets/dailycheckin/Rank1.svg";
  import rank2 from "~/assets/dailycheckin/Rank2.svg";
  import rank3 from "~/assets/dailycheckin/Rank3.svg";
  import rankStatus from "~/assets/dailycheckin/Rankstatus.png";
  import frameLeaderboard from "~/assets/dailycheckin/frameLeaderboard.png";

  let formatDataLeaderboard = [];
  let currentUserRank;

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${$userPublicAddress}`);
    return response.data;
  };

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
    queryFn: () => handleDailyCheckin(),
    staleTime: Infinity,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      $userPublicAddress.length !== 0,
    onError(err) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      formatDataLeaderboard = (
        $queryDailyCheckin?.data?.checkinLeaderboard || []
      ).map((item: any, index: number) => {
        return {
          rank: index + 1,
          owner: item?.owner?.toLowerCase(),
          point: item?.["_sum"]?.point,
        };
      });

      currentUserRank = $queryDailyCheckin?.data?.checkinLeaderboard
        .map((item: any) => item?.owner.toLowerCase())
        .findIndex((item: any) => {
          return item === $userPublicAddress.toLowerCase();
        });
    }
  }
</script>

<div
  class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4 lg:mb-60 sm:mb-32 mb-10"
>
  <div class="xl:title-3 title-2">Leaderboard</div>
  <div class="xl:text-base text-lg text-gray-500">
    Take a look at the leaderboard to see how ranked you are
  </div>
</div>

{#if $queryDailyCheckin.isFetching}
  <div class="flex items-center justify-center h-screen">
    <Loading />
  </div>
{:else}
  <div class="relative md:block hidden">
    <div class="flex flex-col items-center justify-center">
      <div class="xl:w-3/5 w-4/5 flex">
        <div class="flex-1 flex flex-col justify-end h-[350px]">
          <div class="h-[175px] w-full">
            <img src={rank2} alt="" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center items-center gap-1 -mt-1">
            <div class="xl:text-lg text-xl font-bold">
              {shorterAddress(formatDataLeaderboard[1]?.owner) || "-"}
            </div>
            <div class="flex items-center gap-1">
              <div class="xl:text-2xl text-3xl text-[#FFCB59] font-semibold">
                {formatDataLeaderboard[1]?.point || 0}
              </div>
              <div class="font-normal xl:text-base text-lg">GM Point</div>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div class="h-[205px] w-full">
            <img src={rank1} alt="" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center items-center gap-1 -mt-1">
            <div class="xl:text-lg text-xl font-bold">
              {shorterAddress(formatDataLeaderboard[0]?.owner) || "-"}
            </div>
            <div class="flex items-center gap-1">
              <div class="xl:text-2xl text-3xl text-[#FFCB59] font-semibold">
                {formatDataLeaderboard[0]?.point || 0}
              </div>
              <div class="font-normal xl:text-base text-lg">GM Point</div>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col justify-end h-[350px]">
          <div class="h-[175px] w-full">
            <img src={rank3} alt="" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center items-center gap-1 -mt-1">
            <div class="xl:text-lg text-xl font-bold">
              {shorterAddress(formatDataLeaderboard[2]?.owner) || "-"}
            </div>
            <div class="flex items-center gap-1">
              <div class="xl:text-2xl text-3xl text-[#FFCB59] font-semibold">
                {formatDataLeaderboard[2]?.point || 0}
              </div>
              <div class="font-normal xl:text-base text-lg">GM Point</div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="xl:w-3/5 w-full flex items-center justify-center -mt-10 -z-10"
      >
        <img src={rankStatus} alt="" />
      </div>
    </div>
    <div
      class="absolute -top-58 left-1/2 transform -translate-x-1/2 -z-20 xl:w-3/5 w-full h-full opacity-60"
    >
      <img src={frameLeaderboard} alt="" class="w-full h-full object-contain" />
    </div>
  </div>

  <div class="relative md:hidden block">
    <div class="flex flex-col items-center justify-center">
      <div class="w-full flex">
        <div class="flex-1 flex flex-col justify-end h-[350px] h-300">
          <div class="h-[105px] w-full">
            <img src={rank2} alt="" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center items-center gap-1 -mt-1">
            <div class="font-semibold text-sm">
              {shorterAddress(formatDataLeaderboard[1]?.owner) || "-"}
            </div>
            <div class="flex items-center gap-1">
              <div class="text-[#FFCB59] font-semibold">
                {formatDataLeaderboard[1]?.point || 0}
              </div>
              <div class="text-sm font-normal">GM Point</div>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div class="h-[145px] w-full">
            <img src={rank1} alt="" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center items-center gap-1">
            <div class="font-semibold text-sm">
              {shorterAddress(formatDataLeaderboard[0]?.owner) || "-"}
            </div>
            <div class="flex items-center gap-1">
              <div class="text-[#FFCB59] font-semibold">
                {formatDataLeaderboard[0]?.point || 0}
              </div>
              <div class="text-sm font-normal">GM Point</div>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col justify-end h-[350px] h-300">
          <div class="h-[105px] w-full">
            <img src={rank3} alt="" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center items-center gap-1 -mt-1">
            <div class="font-semibold text-sm">
              {shorterAddress(formatDataLeaderboard[2]?.owner) || "-"}
            </div>
            <div class="flex items-center gap-1">
              <div class="text-[#FFCB59] font-semibold">
                {formatDataLeaderboard[2]?.point || 0}
              </div>
              <div class="text-sm font-normal">GM Point</div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full flex items-center justify-center -mt-10 -z-10">
        <img src={rankStatus} alt="" />
      </div>
    </div>
    <div
      class="absolute -top-[168px] left-1/2 transform -translate-x-1/2 -z-20 w-full h-full opacity-60"
    >
      <img src={frameLeaderboard} alt="" class="w-full h-full object-contain" />
    </div>
  </div>

  <div class="relative flex flex-col gap-4 justify-center items-center -mt-48">
    <div
      class="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 shadow"
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
        <path fill="currentColor" d="M24 32h2v2h-2zm1.6-2h-1.2l-.4-8v-6h2v6z" />
      </svg>
      <div class="text-sm">This rank will reset every month</div>
    </div>
    <div
      class={`mx-auto xl:w-3/5 w-full min-h-[600px] border border_0000000d rounded-[10px] ${
        $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
      }`}
    >
      <table class="table-auto w-full h-full">
        <thead>
          <tr class="bg-[#FFB800] sticky top-0">
            <th colspan="3" class="pt-2 px-6 rounded-t-xl font-medium">
              <div class="flex justify-start text-sm">Your current rank</div>
            </th>
          </tr>

          <tr class="bg-[#FFB800] sticky top-[29px]">
            <th class="py-2 pl-6 font-medium">
              <div
                class={`flex justify-start font-normal text-lg w-6 ${
                  !$isDarkMode && "text-[#27326F]"
                }`}
              >
                {formatDataLeaderboard[currentUserRank]?.rank || "N/A"}
              </div>
            </th>

            <th class="py-2 font-medium">
              <div class="flex items-end justify-start text-sm">
                {formatDataLeaderboard[currentUserRank]?.owner
                  ? shorterAddress(
                      formatDataLeaderboard[currentUserRank]?.owner
                    )
                  : "Not checkin yet"}
              </div>
            </th>

            <th class="py-2 pr-6 font-medium">
              <div class="flex items-center justify-end gap-1">
                <div class="text-xl">
                  {formatDataLeaderboard[currentUserRank]?.point || 0}
                </div>
                <div class="xl:text-xl font-normal">GM point</div>
              </div>
            </th>
          </tr>

          <tr>
            <th colspan="3" class="py-2 px-6 font-medium">
              <div class="flex justify-start text-sm">Runners up</div>
            </th>
          </tr>
        </thead>

        {#if $queryDailyCheckin?.data === undefined}
          <tbody>
            <tr>
              <td colspan="3">
                <div class="flex items-center justify-center h-full px-3 py-4">
                  Please connect wallet
                </div>
              </td>
            </tr>
          </tbody>
        {:else}
          <tbody>
            {#if formatDataLeaderboard?.length === 0}
              <tr>
                <td colspan="3">
                  <div
                    class="flex items-center justify-center h-full px-3 py-4"
                  >
                    There is no one checkin yet
                  </div>
                </td>
              </tr>
            {/if}

            {#if formatDataLeaderboard?.length < 4}
              <tr>
                <td colspan="3">
                  <div
                    class="flex items-center justify-center h-full px-3 py-4"
                  >
                    Currently, no one has left the top 3 yet.
                  </div>
                </td>
              </tr>
            {/if}

            {#each formatDataLeaderboard.slice(3, 20) as item}
              <tr class="group transition-all">
                <td
                  class={`py-2 pl-6 ${
                    item?.rank === formatDataLeaderboard[currentUserRank]?.rank
                      ? $isDarkMode
                        ? "bg-[#000]"
                        : "bg-gray-100"
                      : $isDarkMode
                        ? "group-hover:bg-[#000]"
                        : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class={`flex justify-start text-lg font-normal w-6 ${
                      !$isDarkMode && "text-[#27326F]"
                    }`}
                  >
                    {item?.rank || "N/A"}
                  </div>
                </td>

                <td
                  class={`py-2 ${
                    item?.rank === formatDataLeaderboard[currentUserRank]?.rank
                      ? $isDarkMode
                        ? "bg-[#000]"
                        : "bg-gray-100"
                      : $isDarkMode
                        ? "group-hover:bg-[#000]"
                        : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="flex items-end justify-start text-sm">
                    {shorterAddress(item?.owner)}
                  </div>
                </td>

                <td
                  class={`py-2 pr-6 ${
                    item?.rank === formatDataLeaderboard[currentUserRank]?.rank
                      ? $isDarkMode
                        ? "bg-[#000]"
                        : "bg-gray-100"
                      : $isDarkMode
                        ? "group-hover:bg-[#000]"
                        : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="flex items-center text-right justify-end gap-1">
                    <div class="text-yellow-400 xl:text-xl text-lg">
                      {item?.point || 0}
                    </div>
                    <div>GM point</div>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        {/if}
      </table>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
  @media (min-height: 320px) {
    .h-300 {
      height: 300px;
    }
  }
</style>
