<script lang="ts">
  import { onMount } from "svelte";
  import { isDarkMode, wallet, chain } from "~/store";
  import { shorterAddress } from "~/utils";
  import { wait } from "~/entries/background/utils";
  import { nimbus } from "~/lib/network";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import InviterQr from "~/UI/Profile/InviterQR.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import TopProfitAndLoss from "~/UI/Profile/TopProfitAndLoss.svelte";
  import ProfitData from "~/UI/Profile/ProfitData.svelte";
  import Testimonial from "~/UI/Testimonial/Testimonial.svelte";

  import User from "~/assets/user.png";

  let address = "";
  let isLoadingSync = false;
  let syncMsg = "";
  let enabledFetchAllData = false;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");
    if (addressParams) {
      address = addressParams;
    }
  });

  const getSync = async () => {
    try {
      await nimbus
        .post(`/v2/address/${address}/sync?chain=ALL`, {})
        .then((response) => response);
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const getSyncStatus = async () => {
    try {
      const response = await nimbus
        .get(`/address/${address}/sync-status?chain=${$chain}`)
        .then((response) => response);
      return response;
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const handleSync = async () => {
    console.log("Going to full sync");
    await getSync();
  };

  const handleGetAllData = async () => {
    isLoadingSync = false;
    enabledFetchAllData = false;

    try {
      let syncStatus = await getSyncStatus();
      // already sync data from db
      if (syncStatus?.data?.lastSync) {
        console.log("start load data (already sync)");
        enabledFetchAllData = true;
        syncMsg = "";
        isLoadingSync = false;
        return;
      }

      // sync data again and check data from db
      if (!syncStatus?.data?.lastSync) {
        await handleSync();

        if (syncStatus?.data?.canWait) {
          syncMsg = syncStatus?.data?.error;
          isLoadingSync = true;
          // keep call api /sync-status until we can not wait
          while (true) {
            if (syncStatus?.data?.lastSync) {
              console.log("start load data (newest sync)");
              enabledFetchAllData = true;
              syncMsg = "";
              isLoadingSync = false;
              break;
            } else {
              isLoadingSync = true;
              await wait(5000);
              syncStatus = await getSyncStatus();
            }
          }
        }

        if (!syncStatus?.data?.canWait) {
          // Cut call when we can not wait
          syncMsg = syncStatus?.data?.error;
          isLoadingSync = false;
        }
      }
    } catch (e) {
      console.error("error: ", e);
      isLoadingSync = false;
    }
  };

  $: {
    if ($wallet) {
      address = $wallet;
      handleGetAllData();
    }
  }
</script>

<ErrorBoundary>
  {#if isLoadingSync}
    <div
      class="text-xl font-medium flex flex-col gap-5 justify-center items-center rounded-[20px] p-6 h-screen"
    >
      {syncMsg}
      {#if syncMsg !== "Invalid address"}
        <Testimonial />
      {/if}
    </div>
  {:else}
    <div>
      {#if syncMsg}
        <div class="flex flex-col justify-center items-center gap-2">
          {syncMsg}
        </div>
      {:else}
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
      {/if}
    </div>
  {/if}
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
