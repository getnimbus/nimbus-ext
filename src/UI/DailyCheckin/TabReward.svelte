<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, userPublicAddress } from "~/store";
  import { dailyCheckinRewardsTypePortfolio } from "~/utils";

  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import Loading from "~/components/Loading.svelte";

  let selectedTypePerformance: "redeemGift" | "yourGift" = "redeemGift";

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

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

  const handleRedeem = async (campain) => {
    const response = await nimbus.post("/v2/reward/redeem", {
      address: $userPublicAddress,
      campaignName: campain,
    });
    useQueryClient().invalidateQueries(["rewards"]);
  };

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
        <div class="flex items-center gap-2 mb-2">
          <AnimateSharedLayout>
            {#each dailyCheckinRewardsTypePortfolio as type}
              <div
                class="relative cursor-pointer xl:text-base text-2xl font-medium py-2 px-3 rounded-xl transition-all"
                on:click={() => (selectedTypePerformance = type.value)}
              >
                <div
                  class={`relative z-[19] ${
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
                      class="absolute inset-0 rounded-full bg-[#1E96FC] -z-10"
                      use:motion
                    />
                  </Motion>
                {/if}
              </div>
            {/each}
          </AnimateSharedLayout>
        </div>
        {#if $userPublicAddress == ""}
          <div class="xl:text-lg text-xl">Please connect your wallet.</div>
        {:else}
          <div class="grid grid-cols-2 xl:h-auto gap-10">
            {#if selectedTypePerformance === "redeemGift"}
              {#if $queryReward?.data?.redeemable.length === 0}
                <div class="">There is no gift to redeem right now</div>
              {/if}
              {#each $queryReward?.data?.redeemable || [] as item}
                <div
                  class={`flex flex-col rounded-2xl w-[438px] min-h-[280px]  ${
                    darkMode ? "bg-[#212121]" : "border"
                  } `}
                >
                  <div
                    class="grid grid-cols-3 items-center px-4 pt-5 pb-7 border-b-2 border-dashed relative"
                  >
                    <div
                      class={`xl:h-[100px] h-[200px] col-span-1 rounded-2xl px-2 flex items-center justify-center ${
                        darkMode ? "bg-gray-200" : "bg-white"
                      }`}
                    >
                      <img
                        src={item.logo}
                        alt=""
                        class="object-contain xl:m-0 m-auto w-20 h-20"
                      />
                    </div>
                    <div class="flex flex-col gap-2 col-span-2 px-10">
                      <div
                        class="flex gap-1 items-center font-medium xl:text-lg text-xl text-[#ffb800]"
                      >
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 16 16"
                          fill="#ffb800"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M14.6629 3.5843C14.7217 3.57771 14.7811 3.58901 14.8339 3.61685C14.8867 3.64495 14.9305 3.68852 14.9599 3.74223C14.9893 3.79594 15.0031 3.85745 14.9994 3.91919L14.4836 12.7921H1.51642L1.00059 3.91919C0.996892 3.85745 1.01055 3.79592 1.0399 3.74216C1.06924 3.68841 1.11299 3.64476 1.16578 3.6166C1.21856 3.58843 1.27808 3.57697 1.33702 3.58362C1.39596 3.59026 1.45175 3.61473 1.49755 3.65401L4.60499 6.30708L7.76082 2.11502C7.79036 2.07895 7.82704 2.04999 7.86833 2.03014C7.90962 2.01028 7.95455 2 8.00001 2C8.04548 2 8.0904 2.01028 8.1317 2.03014C8.17299 2.04999 8.20967 2.07895 8.23921 2.11502L11.395 6.30708L14.5025 3.65401C14.5484 3.61511 14.6041 3.5909 14.6629 3.5843ZM1.55334 13.4273L1.55781 13.5041C1.577 13.827 1.71333 14.1301 1.93906 14.3518C2.1648 14.5735 2.46298 14.6971 2.77297 14.6976H13.2271C13.537 14.6971 13.8352 14.5735 14.061 14.3518C14.2867 14.1301 14.423 13.827 14.4422 13.5041L14.4467 13.4273H1.55334Z"
                            fill="#ffb800"
                          />
                        </svg>
                        PREMIUM
                      </div>
                      <div class="xl:text-3xl text-4xl uppercase">
                        {item.title}
                      </div>
                      <div class="xl:text-sm text-lg">{item.description}</div>
                    </div>

                    <div
                      class={`w-4 h-10 rounded-l-none rounded-full absolute -left-[1px] -bottom-5 ${
                        darkMode
                          ? "bg-[#161616]"
                          : "bg-white border-r border-t border-b"
                      }`}
                    />
                    <div
                      class={`w-4 h-10 rounded-r-none rounded-full bg-white absolute -right-[1px] -bottom-5 ${
                        darkMode
                          ? "bg-[#161616]"
                          : "bg-white border-l border-t border-b"
                      } `}
                    />
                  </div>

                  <div
                    class="grid grid-cols-3 items-center h-full gap-5 px-4 py-3"
                  >
                    <div class="col-span-1 xl:text-base text-xl px-4">
                      {item.remains} left
                    </div>
                    <div class="col-span-2">
                      <div class="w-full rounded-xl text-white">
                        <Button
                          on:click={() => handleRedeem(item.campaignName)}
                          variant={item.remains == 0 ? "disabled" : "primary"}
                          disabled={item.remains == 0 ? true : false}
                        >
                          <div
                            class="grid grid-cols-3 h-8 xl:text-base text-xl font-medium"
                          >
                            <span
                              class="flex items-center justify-center gap-1"
                            >
                              <img
                                src="https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg"
                                alt=""
                              />
                              <span>{item.cost}</span>
                            </span>
                            <span class="text-center col-span-2 my-auto">
                              Redeem
                            </span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}

            {#if selectedTypePerformance === "yourGift"}
              {#if $queryReward?.data?.ownRewards.length === 0}
                <div class="">You don't have any gift</div>
              {/if}
              {#each $queryReward?.data?.ownRewards || [] as item}
                <div
                  class={`flex flex-col rounded-2xl w-[438px] min-h-[280px]  ${
                    darkMode ? "bg-[#212121]" : "border"
                  } `}
                >
                  <div
                    class="grid grid-cols-3 items-center px-4 pt-5 pb-7 border-b-2 border-dashed relative"
                  >
                    <div
                      class={`xl:h-[100px] h-[200px] col-span-1 rounded-2xl px-2 flex items-center justify-center ${
                        darkMode ? "bg-gray-200" : "bg-white"
                      }`}
                    >
                      <img
                        src={item.logo}
                        alt=""
                        class="object-contain xl:m-0 m-auto w-20 h-20"
                      />
                    </div>
                    <div class="flex flex-col gap-2 col-span-2 px-10">
                      <div
                        class="flex gap-1 items-center font-medium xl:text-lg text-xl text-[#ffb800]"
                      >
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 16 16"
                          fill="#ffb800"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M14.6629 3.5843C14.7217 3.57771 14.7811 3.58901 14.8339 3.61685C14.8867 3.64495 14.9305 3.68852 14.9599 3.74223C14.9893 3.79594 15.0031 3.85745 14.9994 3.91919L14.4836 12.7921H1.51642L1.00059 3.91919C0.996892 3.85745 1.01055 3.79592 1.0399 3.74216C1.06924 3.68841 1.11299 3.64476 1.16578 3.6166C1.21856 3.58843 1.27808 3.57697 1.33702 3.58362C1.39596 3.59026 1.45175 3.61473 1.49755 3.65401L4.60499 6.30708L7.76082 2.11502C7.79036 2.07895 7.82704 2.04999 7.86833 2.03014C7.90962 2.01028 7.95455 2 8.00001 2C8.04548 2 8.0904 2.01028 8.1317 2.03014C8.17299 2.04999 8.20967 2.07895 8.23921 2.11502L11.395 6.30708L14.5025 3.65401C14.5484 3.61511 14.6041 3.5909 14.6629 3.5843ZM1.55334 13.4273L1.55781 13.5041C1.577 13.827 1.71333 14.1301 1.93906 14.3518C2.1648 14.5735 2.46298 14.6971 2.77297 14.6976H13.2271C13.537 14.6971 13.8352 14.5735 14.061 14.3518C14.2867 14.1301 14.423 13.827 14.4422 13.5041L14.4467 13.4273H1.55334Z"
                            fill="#ffb800"
                          />
                        </svg>
                        PREMIUM
                      </div>
                      <div class="xl:text-3xl text-4xl uppercase">
                        {item.title}
                      </div>
                      <div class="xl:text-sm text-lg">{item.description}</div>
                    </div>

                    <!-- circle  -->
                    <div
                      class={`w-4 h-10 rounded-l-none rounded-full absolute -left-[1px] -bottom-5 ${
                        darkMode
                          ? "bg-[#161616]"
                          : "bg-white border-r border-t border-b"
                      }`}
                    />
                    <div
                      class={`w-4 h-10 rounded-r-none rounded-full bg-white absolute -right-[1px] -bottom-5 ${
                        darkMode
                          ? "bg-[#161616]"
                          : "bg-white border-l border-t border-b"
                      } `}
                    />
                  </div>
                  <div class="px-4 py-3 h-full flex items-center">
                    <div
                      class="bg-gray-200 text-black flex justify-between items-center w-full py-2 px-3 rounded-xl"
                    >
                      <span class="xl:text-sm text-base">Your gift code</span>
                      <span
                        class="flex items-center gap-1 font-medium xl:text-lg text-xl py-1"
                      >
                        <Copy
                          address={item?.code}
                          iconColor="#000"
                          color="#000"
                          isShorten
                        />
                      </span>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
