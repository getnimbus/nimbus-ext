<script lang="ts">
  import { onMount } from "svelte";
  import { isDarkMode, userPublicAddress, wallet } from "~/store";
  import { shorterAddress } from "~/utils";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import InviterQr from "~/UI/Profile/InviterQR.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import TopProfitAndLoss from "~/UI/Profile/TopProfitAndLoss.svelte";
  import ProfitData from "~/UI/Profile/ProfitData.svelte";

  import User from "~/assets/user.png";

  let address = $userPublicAddress;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");
    if (addressParams) {
      address = addressParams;
    }
  });

  $: {
    if ($wallet) {
      address = $wallet;
    }
  }
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div
      class="w-full flex xl:flex-row flex-col rounded-xl py-10 px-10 gap-9 border-2 border_0000001a"
    >
      <div class="xl:w-[20%] w-full flex flex-col gap-5 items-center">
        <div class="flex flex-col gap-3 items-center justify-start">
          <div class="xl:w-[80px] xl:h-[80px] w-32 h-32">
            <img src={User} alt="" class="object-cover w-full h-full" />
          </div>

          <div
            class={`text-2xl xl:text-base font-medium flex items-center gap-2 ${
              $isDarkMode ? "text-white" : "text-black"
            }`}
          >
            {shorterAddress(address)}
          </div>
        </div>

        <InviterQr />
      </div>
      <div class="flex-1 flex flex-col gap-4">
        <div class="xl:text-3xl text-4xl font-medium">Performance Summary</div>
        <div class="grid xl:grid-cols-4 grid-cols-2 gap-6">
          <ProfitData selectedAddress={address} />

          <TopProfitAndLoss selectedAddress={address} />

          <ClosedPositionChart selectedAddress={address} />
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
