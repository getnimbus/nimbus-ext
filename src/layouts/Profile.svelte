<script lang="ts">
  import { createQueries, createQuery } from "@tanstack/svelte-query";
  import { empty } from "svelte/internal";
  import CardInfo from "~/UI/Profile/CardInfo.svelte";
  import CardNft from "~/UI/Profile/CardNFT.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import CustomText from "~/UI/Profile/CustomText.svelte";
  import SocialMedia from "~/UI/Profile/SocialMedia.svelte";
  import SummaryText from "~/UI/Profile/SummaryText.svelte";
  import Button from "~/components/Button.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import { chain, typeWallet, wallet } from "~/store";
  import type { HoldingTokenRes } from "~/types/HoldingTokenData";
  import { shorterAddress } from "~/utils";
  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });
  let holdingTokenData;
  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });
  let selectedTokenHolding = {
    data: [],
    select: [],
  };
  let selectedDataPieChart = {};
  let closedHoldingPosition;

  // this is user address
  const userAddress = localStorage.getItem("evm_address");
  // this address is for testing
  const testAddress = "0x8980dbbe60d92b53b08ff95ea1aaaabb7f665bcb";

  const getHoldingToken = async (chain) => {
    const response: HoldingTokenRes = await nimbus
      .get(`/v2/address/${testAddress}/holding?chain=${chain}`)
      .then((response) => response.data);
    return response;
  };

  // query token holding
  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedChain],
    queryFn: () => getHoldingToken(selectedChain),
    staleTime: Infinity,
    enabled: true,
  });
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto w-[90%] min-h-screen py-8 flex flex-col xl:gap-10 gap-6"
  >
    <div class="flex flex-col mb-5 gap-14">
      <div class="font-medium xl:text-5xl text-7xl">My Profile</div>
      <div
        class="w-full flex xl:flex-row flex-col border-2 rounded-xl shadow-light-600 shadow-xl min-h-screen py-10 px-10 gap-9"
      >
        <div
          class="xl:w-1/3 w-full h-[300px] flex items-center justify-center rounded-xl"
        >
          <div
            class="flex flex-col gap-3 items-center justify-center text-2xl xl:text-base"
          >
            <div class=" xl:w-[80px] xl:h-[80px] w-32 h-32">
              <img
                src={`/assets/user.png`}
                alt=""
                class="object-cover w-full h-full"
              />
            </div>
            {shorterAddress(localStorage.getItem("evm_address") || "")}
          </div>
        </div>
        <div class="xl:w-2/3 w-[428px] h-full mx-auto">
          <div class="text-xl xl:3xl font-medium mb-4">My Story</div>
          <div class="grid xl:grid-cols-4 grid-cols-2 gap-10">
            <SummaryText userData={$queryTokenHolding.data} />
            <CardNft />
            <CardNft />
            <CustomText />
            <CardInfo />
            <SocialMedia />
            <ClosedPositionChart />
          </div>
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
