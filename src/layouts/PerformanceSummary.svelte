<script lang="ts">
  import { isDarkMode, user } from "~/store";
  import { shorterAddress } from "~/utils";
  import { Link } from "svelte-navigator";

  import InviterQr from "~/UI/Profile/InviterQR.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import TopProfitAndLoss from "~/UI/Profile/TopProfitAndLoss.svelte";
  import ProfitData from "~/UI/Profile/ProfitData.svelte";

  import User from "~/assets/user.png";
  import LeftArrow from "~/assets/left-arrow.svg";
  import SyncData from "~/components/SyncData.svelte";
</script>

<div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8">
  <SyncData let:address let:enabledFetchAllData>
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <Link to="/" class="cusor-pointer">
          <div class="flex items-center gap-1 text-white">
            <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
            <div class="xl:text-sm text-2xl font-medium">Portfolio Detail</div>
          </div>
        </Link>
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
              {shorterAddress(address)}
            </div>
          </div>

          {#if Object.keys($user).length !== 0}
            <InviterQr />
          {/if}
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="xl:text-3xl text-4xl font-medium">
            Performance Summary
          </div>
          <div class="grid xl:grid-cols-4 grid-cols-2 gap-6">
            <ProfitData
              selectedAddress={address}
              isSync={true}
              {enabledFetchAllData}
            />

            <TopProfitAndLoss
              selectedAddress={address}
              isSync={true}
              {enabledFetchAllData}
            />

            <ClosedPositionChart
              selectedAddress={address}
              isSync={true}
              {enabledFetchAllData}
            />
          </div>
        </div>
      </div>
    </div>
  </SyncData>
</div>

<style windi:preflights:global windi:safelist:global></style>
