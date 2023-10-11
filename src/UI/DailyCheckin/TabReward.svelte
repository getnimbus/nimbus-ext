<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import Loading from "~/components/Loading.svelte";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user } from "~/store";
  import { dailyCheckinRewardsTypePortfolio } from "~/utils";

  const imgGold =
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg";

  let selectedWallet = localStorage.getItem("evm_address");
  let selectedTypePerformance: "redeemGift" | "yourGift" = "redeemGift";

  //   demo address
  const demoAddress = "0x098f6f171c7d4c0f31c07b8d511f40b2338347eb";

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${selectedWallet}`);
    return response?.data;
  };

  const handleRewards = async () => {
    const response = await nimbus.post(`/v2/reward`, {
      address: selectedWallet,
    });
    console.log("response bla bla : ", response.data);
    return response.data;
  };

  $: queryDailyCheckin = createQuery({
    queryKey: ["daily-checkin", selectedWallet],
    queryFn: () => handleDailyCheckin(),
    enabled: Object.keys(userInfo).length !== 0,
    staleTime: Infinity,
  });

  $: queryReward = createQuery({
    queryKey: ["rewards", selectedWallet],
    queryFn: () => handleRewards(),
    enabled: Object.keys(userInfo).length !== 0,
    staleTime: Infinity,
  });

  $: console.log("thi is a fasf : ", $queryReward);
</script>

<div class="flex flex-col gap-10">
  {#if $queryDailyCheckin.isLoading}
    <div class="flex items-center justify-center h-full px-3 py-4">
      <Loading />
    </div>
  {:else}
    <div
      class="py-2 px-4 w-[100px] rounded-full bg-[#27326F] text-white font-medium flex gap-1 justify-center items-center"
    >
      <img src={imgGold} alt="" />
      {$queryDailyCheckin?.data.totalPoint}
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 mb-2">
        <AnimateSharedLayout>
          {#each dailyCheckinRewardsTypePortfolio as type}
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
      <div class="grid grid-cols-3 gap-10">
        {#if selectedTypePerformance === "redeemGift"}
          <!-- Redeem gift  -->
          {#each $queryReward?.data?.redeemable || [] as item}
            <!-- a card  -->
            <div
              class={`flex flex-col rounded-2xl ${
                darkMode ? "bg-[#212121]" : "border"
              } `}
            >
              <div
                class="grid grid-cols-3 items-center gap-5 px-8 py-5 border-b-2 border-dashed"
              >
                <div
                  class={`h-full w-full col-span-1 rounded-2xl px-2 flex flex-col items-center justify-center ${
                    darkMode ? "bg-gray-200" : "bg-white"
                  }`}
                >
                  <img src={item.logo} alt="" class="object-contain m-auto" />
                </div>
                <div class="flex flex-col gap-2 col-span-2">
                  <div
                    class="flex gap-1 items-center font-medium text-2xl text-[#ffb800]"
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
                    {item.campaignName}
                  </div>
                  <div class="text-3xl uppercase">{item.title}</div>
                  <div>{item.description}</div>
                </div>
              </div>
              <div class="grid grid-cols-3 items-center gap-10 px-8 py-5">
                <div class="col-span-1">{item.remains} left</div>
                <div
                  class="col-span-2 px-4 py-[10px] bg-[#1e96fc] rounded-xl text-white"
                >
                  <div class="flex justify-center items-center gap-5">
                    <span class="flex items-center gap-1">
                      <img src={imgGold} alt="" />
                      <span>{item.cost}</span>
                    </span>
                    <span class="text-left">Redeem</span>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        {:else if selectedTypePerformance === "yourGift"}
          <!-- Your gift -->
          {#each $queryReward?.data?.ownRewards || [] as item}
            <!-- a card  -->
            <div
              class={`flex flex-col rounded-2xl ${
                darkMode ? "bg-[#212121]" : "border"
              } `}
            >
              <div
                class="grid grid-cols-3 items-center gap-5 px-8 py-5 border-b-2 border-dashed"
              >
                <div
                  class={`h-full w-full col-span-1 rounded-2xl px-2 flex flex-col items-center justify-center ${
                    darkMode ? "bg-gray-200" : "bg-white"
                  }`}
                >
                  <img src={item.logo} alt="" class="object-contain m-auto" />
                </div>
                <div class="flex flex-col gap-2 col-span-2">
                  <div
                    class="flex gap-1 items-center font-medium text-2xl text-[#ffb800]"
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
                    {item.campaignName}
                  </div>
                  <div class="text-3xl uppercase">{item.title}</div>
                  <div>{item.description}</div>
                </div>
              </div>
              <div class="grid grid-cols-3 items-center gap-10 px-8 py-5">
                <div class="col-span-1">{item.remains} left</div>
                <div
                  class="col-span-2 px-4 py-[10px] bg-[#1e96fc] rounded-xl text-white"
                >
                  <div class="flex justify-center items-center gap-5">
                    <span class="flex items-center gap-1">
                      <img src={imgGold} alt="" />
                      <span>{item.cost}</span>
                    </span>
                    <span class="text-left">Redeem</span>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>
