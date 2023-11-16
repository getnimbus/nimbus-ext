<script lang="ts">
  import { onMount } from "svelte";
  import InviterQr from "~/UI/Profile/InviterQR.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode, userPublicAddress } from "~/store";
  import User from "~/assets/user.png";
  import { shorterAddress } from "~/utils";
  import { nimbus } from "~/lib/network";
  // take in profile
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import TopProfitAndLoss from "~/UI/Profile/TopProfitAndLoss.svelte";
  import ProfitData from "~/UI/Profile/ProfitData.svelte";

  let userIdParams = "";
  let selectedAddress = "";
  let userProfile = {};

  const getUserProfile = async (id) => {
    try {
      const response: any = await nimbus.get(`/users/${id}/profile`);
      console.log("hello world dsada : ", id);
      userProfile = response?.data;
      // selectedAddress = userProfile?.profileAddress || $userPublicAddress;
    } catch (e) {
      console.error(e);
    }
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let idParams = urlParams.get("id");
    if (idParams) {
      userIdParams = idParams;
      getUserProfile(idParams);
    }
  });

  $: console.log("this is bla bla : ", userProfile);
  $: console.log("this i idParams : ", userIdParams);
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col justify-center gap-2">
      <div class="xl:text-5xl text-7xl font-medium">Performance Summary</div>
      <div class="xl:text-xl text-3xl">
        Explore the crypto trade journey—a concise snapshot of strategic
        decisions, successful trades, and the dynamic landscape of
        cryptocurrency management.
      </div>
    </div>
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
            <!-- {shorterAddress(selectedAddress)} -->
          </div>
        </div>

        <InviterQr />
      </div>
      <div class="flex-1 flex flex-col gap-4">
        <div class="xl:text-3xl text-4xl font-medium">
          My Performance Summary
        </div>
        <div class="grid xl:grid-cols-4 grid-cols-2 gap-6">
          <!-- <ProfitData {selectedAddress} />

          <TopProfitAndLoss {selectedAddress} />

          <ClosedPositionChart {selectedAddress} /> -->
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
