<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { user, userPublicAddress } from "~/store";
  import { dailyCheckinRewardsTypePortfolio } from "~/utils";

  import Loading from "~/components/Loading.svelte";
  import RedeemCard from "~/components/RedeemCard.svelte";

  let selectedType: "redeemGift" | "yourGift" = "redeemGift";

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

  const handleRedeem = async (data) => {
    try {
      await nimbus
        .post("/v2/reward/redeem", {
          address: $userPublicAddress,
          campaignName: data?.campaignName,
        })
        .then(() => {
          queryClient.invalidateQueries([$userPublicAddress, "rewards"]);
          queryClient.invalidateQueries([$userPublicAddress, "daily-checkin"]);
          selectedType = "yourGift";
        });
    } catch (e) {
      console.error(e);
    }
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
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

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
</script>

<div class="flex flex-col gap-4 min-h-screen">
  <div
    class="flex justify-between items-center border-b-[1.5px] border_0000000d pb-4"
  >
    <div class="flex flex-col gap-1">
      <div class="xl:title-3 title-1">Rewards</div>
      <div class="xl:text-base text-xl text-gray-500">
        Use GM Points to redeem gifts
      </div>
    </div>
    <div
      class="py-2 px-3 min-w-[100px] rounded-full bg-[#27326F] flex justify-center items-center gap-2"
    >
      <img
        src="https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg"
        alt=""
        class="w-8"
      />
      <div class="text-white xl:text-xl text-2xl font-medium">
        {$queryDailyCheckin?.data?.totalPoint || 0}
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
                class="relative cursor-pointer xl:text-base text-2xl font-medium py-2 px-3 rounded-xl transition-all"
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

        {#if selectedType === "redeemGift"}
          <div class="flex flex-col gap-4">
            <div
              class="flex justify-center items-center h-full w-full xl:text-lg text-xl text-gray-400"
            >
              {#if $queryReward?.data?.redeemable.length === 0}
                There are no redeems
              {/if}
              {#if $queryReward?.data === undefined}
                Please connect wallet
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-10">
              {#each $queryReward?.data?.redeemable || [] as item}
                <RedeemCard isRedeem redeemData={item} {handleRedeem} />
              {/each}
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

            <div class="grid grid-cols-2 gap-10">
              {#each $queryReward?.data?.ownRewards || [] as item}
                <RedeemCard redeemData={item} handleRedeem={() => {}} />
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
