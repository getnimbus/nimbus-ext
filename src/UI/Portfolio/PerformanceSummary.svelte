<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { isDarkMode, user } from "~/store";
  import { shorterAddress } from "~/utils";
  import mixpanel from "mixpanel-browser";
  import html2canvas from "html2canvas";

  import InviterQr from "~/UI/Profile/InviterQR.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import TopProfitAndLoss from "~/UI/Profile/TopProfitAndLoss.svelte";
  import ProfitData from "~/UI/Profile/ProfitData.svelte";
  import TokenHoldingTable from "../Profile/TokenHoldingTable/TokenHoldingTable.svelte";
  import SyncData from "~/components/SyncData.svelte";

  import User from "~/assets/user.png";

  let toastMsg = "";
  let isSuccessToast = false;
  let showToast = false;
  let counter = 3;

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const downloadPage = async () => {
    const targetElement = document.getElementById("target-performance-summary");
    const shareBtn = document.getElementById("btn-share-summary");
    if (targetElement && shareBtn) {
      try {
        await html2canvas(targetElement, {
          ignoreElements: (el) => {
            return el.id === "btn-share-summary";
          },
          proxy: "https://htmlcanvas-proxy.getnimbus.io",
          logging: true,
          scale: 2,
        }).then((canvas) => {
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          const img = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
          const a = document.createElement("a");
          a.href = img;

          a.download = `UserPerformanceSummary.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toastMsg = "Successfully downloaded!";
          isSuccessToast = true;
          trigger();
        });
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toastMsg = "Something wrong when download. Please try again!";
        isSuccessToast = false;
        trigger();
      }
    }
  };

  onMount(() => {
    mixpanel.track("summary_page");
  });
</script>

<div class="-mt-15" id="target-performance-summary">
  <SyncData let:address let:enabledFetchAllData>
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-end">
        <button
          id="btn-share-summary"
          class="flex items-center justify-center gap-2 xl:text-base text-2xl font-medium text-white bg-[#1e96fc] px-[9px] py-[7px] rounded-xl"
          on:click={downloadPage}
        >
          Share
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 16 16"
            class="m-auto"
          >
            <rect width="16" height="16" fill="none" />
            <path
              fill="currentColor"
              d="M10.307 2.105A.5.5 0 0 0 9.5 2.5v1.993a5.372 5.372 0 0 0-1.679.344a4.693 4.693 0 0 0-2.095 1.574c-.623.826-1.081 1.972-1.224 3.544a.5.5 0 0 0 .852.399c1.188-1.19 2.369-1.776 3.242-2.067c.36-.12.668-.19.904-.23V10a.5.5 0 0 0 .832.374l4.5-4a.5.5 0 0 0-.025-.769zm-.364 3.392h.003A.502.502 0 0 0 10.5 5V3.522l3.219 2.504l-3.219 2.86V7.5A.5.5 0 0 0 10 7h-.045a4.775 4.775 0 0 0-.456.043c-.3.044-.72.128-1.22.295a8.895 8.895 0 0 0-2.547 1.36c.194-.716.476-1.264.793-1.685a3.693 3.693 0 0 1 1.654-1.242A4.373 4.373 0 0 1 9.82 5.49c.045.001.079.003.1.005zM4.5 3A2.5 2.5 0 0 0 2 5.5v6A2.5 2.5 0 0 0 4.5 14h6a2.5 2.5 0 0 0 2.5-2.5v-1a.5.5 0 0 0-1 0v1a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 3 11.5v-6A1.5 1.5 0 0 1 4.5 4h2a.5.5 0 0 0 0-1z"
            />
          </svg>
        </button>
      </div>

      <div
        class="w-full xl:grid grid-cols-4 flex flex-col rounded-xl py-10 md:px-10 px-4 gap-9 border-2 border_0000001a"
      >
        <div class="w-full flex flex-col gap-5 justify-between col-span-1">
          <div>
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
          <a
            class={`hover:underline text-center ${
              $isDarkMode ? "text-white" : "text-[#27326f]"
            }`}
            href="https://getnimbus.io/"
            target="_blank"
          >
            https://getnimbus.io/
          </a>
        </div>
        <div class="flex-1 flex flex-col gap-4 col-span-3">
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
          </div>
        </div>
        <div class="col-span-4 flex flex-col gap-9">
          <ClosedPositionChart
            selectedAddress={address}
            isSync={true}
            {enabledFetchAllData}
          />
          <TokenHoldingTable
            selectedAddress={address}
            isSync={true}
            {enabledFetchAllData}
          />
        </div>
      </div>
    </div>
  </SyncData>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
  :global(img) {
    display: inline-block;
  }
</style>
