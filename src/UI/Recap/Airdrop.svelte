<script>
  import html2canvas from "html2canvas";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import Logo from "~/assets/logo-1.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
  import Share from "~/assets/recap/share-icon.svg";
  import carIco from "~/assets/recap/car-ico.svg";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

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
    const targetElement = document.getElementById("target-slide-3");
    const shareBtn = document.getElementById("btn-share");
    if (targetElement && shareBtn) {
      try {
        await html2canvas(targetElement, {
          ignoreElements: (el) => {
            return el.id === "btn-share";
          },
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
          a.download = "Airdrop.png";
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

  $: networth = (data || []).reduce(
    (total, item) => total + Number(item.value),
    0
  );
</script>

<div
  class="bg-[#EFF4E8] pt-10 pb-20 overflow-hidden w-full h-screen"
  id="target-slide-3"
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
      class="flex-1 h-full px-[35px] flex flex-col justify-center gap-14 items-center text-black"
    >
      <div class="font-bold text-4xl">
        You earn <span class="text-[60px]">{(data && data.length) || 0}</span>
        airdrop worth
        <span class="text-[60px]">
          <TooltipNumber number={networth} type="value" />
        </span>
      </div>
      <div
        id="btn-share"
        class="bg-[#ffa41c] text-black p-4 flex items-center gap-4 text-2xl font-semibold rounded-[32px] w-max cursor-pointer relative z-20"
        on:click={downloadPage}
      >
        <div>Share</div>
        <img src={Share} alt="" />
      </div>

      {#if data && data.length !== 0}
        <div class="xl:flex hidden gap-3 justify-between xl:min-h-60">
          <!-- 1 -->
          <div
            class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-start justify-between rounded-3xl px-6 py-5 gap-6"
          >
            <div class="text-center text-gray-500 flex items-center gap-3">
              <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
            </div>
            <div class="text-white text-[40px]">$12,002</div>
          </div>
          <!-- 2 -->
          <div
            class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-end justify-between rounded-3xl px-6 py-5 gap-6"
          >
            <div class="text-center text-gray-500 flex items-center gap-3">
              <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
            </div>
            <div class="text-white text-[40px]">$12,002</div>
          </div>
          <!-- 3 -->
          <div
            class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-start justify-between rounded-3xl px-6 py-5 gap-6"
          >
            <div class="text-center text-gray-500 flex items-center gap-3">
              <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
            </div>
            <div class="text-white text-[40px]">$12,002</div>
          </div>
          <!-- 4 -->
          <div
            class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-end justify-between rounded-3xl px-6 py-5 gap-6"
          >
            <div class="text-center text-gray-500 flex items-center gap-3">
              <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
            </div>
            <div class="text-white text-[40px]">$12,002</div>
          </div>
          <!-- 5 -->
          <div
            class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-start justify-between rounded-3xl px-6 py-5 gap-6"
          >
            <div class="text-center text-gray-500 flex items-center gap-3">
              <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
            </div>
            <div class="text-white text-[40px]">$12,002</div>
          </div>
        </div>

        <div class="flex xl:hidden flex-col gap-3 justify-between">
          <div class="flex gap-3 justify-center">
            <!-- 1 -->
            <div
              class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-start justify-between rounded-3xl px-6 py-5 gap-6"
            >
              <div class="text-center text-gray-500 flex items-center gap-3">
                <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
              </div>
              <div class="text-white text-[40px]">$12,002</div>
            </div>
            <!-- 2 -->
            <div
              class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-end justify-between rounded-3xl px-6 py-5 gap-6"
            >
              <div class="text-center text-gray-500 flex items-center gap-3">
                <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
              </div>
              <div class="text-white text-[40px]">$12,002</div>
            </div>
            <!-- 3 -->
            <div
              class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-start justify-between rounded-3xl px-6 py-5 gap-6"
            >
              <div class="text-center text-gray-500 flex items-center gap-3">
                <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
              </div>
              <div class="text-white text-[40px]">$12,002</div>
            </div>
          </div>
          <div class="flex gap-3 justify-center">
            <!-- 4 -->
            <div
              class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-end justify-between rounded-3xl px-6 py-5 gap-6"
            >
              <div class="text-center text-gray-500 flex items-center gap-3">
                <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
              </div>
              <div class="text-white text-[40px]">$12,002</div>
            </div>
            <!-- 5 -->
            <div
              class="bg-black w-[240px] flex flex-col card-shadow-airdrop self-start justify-between rounded-3xl px-6 py-5 gap-6"
            >
              <div class="text-center text-gray-500 flex items-center gap-3">
                <img src={carIco} alt="" class="w-10 h-10 rounded-full" /> 2000 JTO
              </div>
              <div class="text-white text-[40px]">$12,002</div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="absolute bottom-[-125px] left-[-145px] z-10 rotate-93_74">
      <img src={SvgTwo} alt="" />
    </div>

    <div class="absolute top-[-175px] right-[-120px] z-10 rotate-131_26">
      <img src={SvgTwo} alt="" class="" />
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
  .rotate-131_26 {
    transform: rotate(-131.26deg);
  }

  .rotate-93_74 {
    transform: rotate(93.74deg);
  }

  .card-shadow-airdrop {
    box-shadow: 20px 20px 40px 0px #48513c8a;
  }
</style>
