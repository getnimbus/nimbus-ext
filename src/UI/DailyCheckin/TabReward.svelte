<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { user, userPublicAddress } from "~/store";

  import Loading from "~/components/Loading.svelte";
  import RedeemCard from "~/components/RedeemCard.svelte";

  import goldImg from "~/assets/Gold4.svg";

  const dailyCheckinRewardsTypePortfolio = [
    {
      label: "Redeem Gift",
      value: "redeemGift",
    },
    {
      label: "Your gift",
      value: "yourGift",
    },
  ];

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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("ton_token");
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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("ton_token");
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });
</script>

<div class="flex flex-col gap-4 min-h-screen">
  <div
    class="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 border-b-[1.5px] border_0000000d pb-4"
  >
    <div class="flex flex-col gap-1">
      <div class="xl:title-3 title-2">Rewards</div>
      <div class="xl:text-base text-lg text-gray-500">
        Use GM Points to redeem gifts
      </div>
    </div>
    <div
      class="flex justify-center items-center gap-2 py-2 px-3 max-w-[120px] rounded-full bg-[#27326F]"
    >
      <img src={goldImg} alt="" class="w-8" />
      <div class="text-white md:text-xl text-lg font-medium">
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
                class="relative cursor-pointer xl:text-base text-lg font-medium py-1 px-3 rounded-[100px] transition-all"
                on:click={() => (selectedType = type.value)}
              >
                <div
                  class={`relative z-2 ${
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
                      class="absolute inset-0 rounded-full bg-[#1E96FC] z-1"
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

            <div class="grid lg:grid-cols-2 grid-cols-1 gap-10">
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

            <div class="grid lg:grid-cols-2 grid-cols-1 gap-10">
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
