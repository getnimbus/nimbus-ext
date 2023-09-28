<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { chain, typeWallet } from "~/store";
  import type { HoldingTokenRes } from "~/types/HoldingTokenData";
  import { shorterAddress } from "~/utils";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import CardInfo from "~/UI/Profile/CardInfo.svelte";
  import CardNft from "~/UI/Profile/CardNFT.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import CustomText from "~/UI/Profile/CustomText.svelte";
  import SocialMedia from "~/UI/Profile/SocialMedia.svelte";
  import SummaryText from "~/UI/Profile/SummaryText.svelte";

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  const getHoldingToken = async (chain) => {
    const response: HoldingTokenRes = await nimbus
      .get(
        `/v2/address/${localStorage.getItem(
          "evm_address"
        )}/holding?chain=${chain}`
      )
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
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col justify-center gap-2">
      <div class="xl:text-5xl text-7xl font-semibold">My Profile</div>
      <div class="xl:text-xl text-3xl">
        One place that aggregates all your personal information
      </div>
    </div>
    <div
      class="w-full flex xl:flex-row flex-col border-2 rounded-xl shadow-light-600 shadow-xl min-h-screen py-10 px-10 gap-9"
    >
      <div
        class="xl:w-1/4 w-full flex flex-col gap-3 items-center justify-start"
      >
        <div class="xl:w-[80px] xl:h-[80px] w-32 h-32">
          <img
            src={`/assets/user.png`}
            alt=""
            class="object-cover w-full h-full"
          />
        </div>
        <div class="text-2xl xl:text-base font-medium">
          {shorterAddress(localStorage.getItem("evm_address") || "")}
        </div>
      </div>
      <div class="flex-1 flex flex-col gap-4">
        <div class="xl:text-3xl text-xl font-medium">My Story</div>
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
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
