<script lang="ts">
  import html2canvas from "html2canvas";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import NftCard from "./NFTHolding/NFTCard.svelte";
  import Loading from "~/components/Loading.svelte";

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgThree from "~/assets/recap/hero/svgThree.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";

  export let data;
  export let loading;

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
    const targetElement = document.getElementById("target-slide-2");
    const shareBtn = document.getElementById("btn-share");
    if (targetElement && shareBtn) {
      try {
        await html2canvas(targetElement, {
          ignoreElements: (el) => {
            return el.id === "btn-share";
          },
          allowTaint: true,
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
          a.download = "NFTHolding.png";
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
  class="bg-[#E8F4EF] pt-10 pb-20 overflow-hidden w-full h-full"
  id="target-slide-2"
>
  <div
    class="relative flex flex-col gap-20 h-full max-w-[2400px] m-auto w-[96%]"
  >
    <img
      src={Logo}
      alt="logo"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
    />
    <div
      class="flex-1 h-full flex xl:flex-row flex-col xl:items-center justify-between gap-20 px-[35px]"
    >
      <div class="xl:flex-[0.3] flex-1 flex flex-col gap-7">
        <div class="flex flex-col gap-4">
          <div class="font-bold text-5xl">Your top collection</div>
          <div class="flex">
            {#each data?.top_holding || [] as item, index}
              <div
                class={`w-[74px] h-[74px] rounded-full border-3 border-white overflow-hidden ${
                  index > 0 && "-ml-3"
                }`}
              >
                <img
                  src={item?.collection?.imageUrl ||
                    "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
                  alt=""
                />
              </div>
            {/each}
            {#if data?.stats?.total_collection === 0}
              <div
                class="flex items-center justify-center text-2xl bg-black text-white w-[74px] h-[74px] rounded-full border-3 border-white -ml-3"
              >
                0
              </div>
            {/if}
            {#if data?.stats?.total_collection !== 0 && data?.top_holding?.length > 3}
              <div
                class="flex items-center justify-center text-2xl bg-black text-white w-[74px] h-[74px] rounded-full border-3 border-white -ml-3"
              >
                +{data?.stats?.total_collection - 3}
              </div>
            {/if}
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

      <div class="flex-1 p-[24px] rounded-[20px] bg-black flex flex-col gap-10">
        {#if loading}
          <div class="flex justify-center items-center h-full h-[525px]">
            <Loading />
          </div>
        {:else}
          <div
            class="flex lg:flex-row flex-col lg:items-center items-start gap-10"
          >
            <div class="flex flex-col">
              <div class="text-[#B7B7B7] font-normal text-2xl">NFT you own</div>
              <div class="text-white font-extrabold text-4xl">
                {data?.stats?.total_holding}
              </div>
            </div>

            <div class="flex flex-col">
              <div class="text-[#B7B7B7] font-normal text-2xl">
                Making trades
              </div>
              <div class="text-white font-extrabold text-4xl">
                {data?.stats?.total_trades}
              </div>
            </div>

            <div class="flex flex-col">
              <div class="text-[#B7B7B7] font-normal text-2xl">Net worth</div>
              <div
                class="flex items-center gap-1 text-white font-extrabold text-4xl"
              >
                <TooltipNumber
                  number={Number(data?.stats?.amount)}
                  type="amount"
                />
                SOL
              </div>
            </div>
          </div>
          <div class="flex justify-between gap-12">
            {#each data?.top_holding || [] as item}
              <NftCard data={item} />
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="absolute bottom-[-80px] left-[-120px] z-10">
      <img src={SvgThree} alt="" />
    </div>

    <div class="absolute top-[-120px] right-[-120px] z-10">
      <img src={SvgOne} alt="" />
    </div>
  </div>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
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
