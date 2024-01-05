<script>
  import html2canvas from "html2canvas";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import mixpanel from "mixpanel-browser";

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import SvgFour from "~/assets/recap/hero/svgFour.svg";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Portfolio from "./TokenHoldingCharts/Portfolio.svelte";
  import Price from "./TokenHoldingCharts/Price.svelte";
  import TopChanges from "./TokenHoldingCharts/TopChanges.svelte";

  export let data;
  export let loading;
  export let summary;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const downloadPage = async () => {
    mixpanel.track("recap_share_tokenholding");
    const targetElement = document.getElementById("target-slide-1");
    const shareBtn = document.getElementById("btn-share");
    if (targetElement && shareBtn) {
      try {
        await html2canvas(targetElement, {
          ignoreElements: (el) => {
            return el.id === "btn-share";
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
          a.download = "TokenHolding.png";
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
</script>

<div
  class="bg-[#eff4e8] relative pt-10 pb-20 overflow-hidden w-full min-h-screen flex"
  id="target-slide-1"
>
  <div class="flex-1 flex flex-col gap-20 h-full max-w-[1400px] m-auto">
    <img
      src={Logo}
      alt="logo"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px] transform translate-x-2"
    />
    <div
      class="flex-1 h-full flex xl:flex-row flex-col xl:items-center justify-between gap-10 px-[35px]"
    >
      <div class="flex-1 flex flex-col gap-7">
        <div class="grid grid-cols-2 gap-10">
          <div class="flex flex-col gap-1">
            <div class="lg:text-xl text-2xl text-[#4f4f4f]">
              You aped in tokens
            </div>
            <div class="text-[64px] font-extrabold text-[#202025]">
              {data?.stats?.total_holding || 0}
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="lg:text-xl text-2xl text-[#4f4f4f]">
              You're among <sup>(1)</sup>
            </div>
            <div
              class="flex items-center gap-1 text-[64px] font-extrabold text-[#202025]"
            >
              {summary?.tag || "--"}{summary?.tag !== "Normal" ? "%" : ""}
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="lg:text-xl text-2xl text-[#4f4f4f]">
              Total transactions
            </div>
            <div class="text-[64px] font-extrabold text-[#202025]">
              {data?.stats?.total_txs || 0}
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="lg:text-xl text-2xl text-[#4f4f4f]">Paid fee</div>
            <div class="flex flex-col gap-3">
              <div class="text-[64px] font-extrabold text-[#202025]">
                <TooltipNumber
                  number={Number(data?.stats?.price) *
                    Number(data?.stats.total_gas_fee)}
                  type="value"
                />
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-[#202025] font-semibold text-4xl">
                  ~<TooltipNumber
                    number={1.5 * Number(data?.stats.total_txs)}
                    type="value"
                  /> <sup class="text-[#4F4F4F]">(2)</sup>
                </div>
                <div class="text-[#4F4F4F] text-xl lg:text-xl text-2xl">
                  (If you use Ethereum)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          id="btn-share"
          class="bg-[#ffa41c] text-black p-4 flex items-center gap-4 text-2xl font-semibold rounded-[32px] w-max cursor-pointer relative z-20"
          on:click={downloadPage}
        >
          <div>Share</div>
          <img src={Share} alt="" />
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-6">
        <div class="flex items-end gap-6 justify-center">
          <Portfolio data={data?.holding} {loading} />
          <Price data={data?.stats} {loading} />
        </div>
        <div class="mx-auto">
          <TopChanges data={data?.top_gainer} {loading} />
        </div>
      </div>
    </div>

    <div class="text-right text-[#4F4F4F] text-sm mx-[35px]">
      <div>(1) Based on your paid fee</div>
      <div>(2) Estimated that a transaction on ETH cost 1.5$</div>
    </div>
    <div class="text-right text-[#4F4F4F] text-sm mx-[35px]"></div>
  </div>
  <div class="absolute bottom-[-90px] left-[-100px] z-10">
    <img src={SvgOne} alt="" />
  </div>

  <div class="absolute top-0 right-0 z-10">
    <img src={SvgFour} alt="" />
  </div>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-50">
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
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
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

<style>
</style>
