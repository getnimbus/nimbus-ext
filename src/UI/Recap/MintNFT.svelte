<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { Buffer as BufferPolyfill } from "buffer";
  import mixpanel from "mixpanel-browser";
  import { Connection, Transaction } from "@solana/web3.js";
  import html2canvas from "html2canvas";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration";
  dayjs.extend(duration);

  import CardNftRecap from "~/components/CardNFTRecap.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";

  import Logo from "~/assets/logo-1.svg";
  import HammerIcon from "~/assets/recap/hero/hammer.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import dotIcon from "~/assets/recap/2-dot-icon.svg";
  import goldImg from "~/assets/Gold4.svg";

  export let data;

  let days: number = 0;
  let hours: number = 0;
  let minutes: number = 0;
  let seconds: number = 0;

  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  const getTargetDate = () => {
    return dayjs("2024-01-15", "YYYY-MM-DD");
  };

  // Set the target date for the countdown
  const targetDate = getTargetDate();

  const updateCountdown = () => {
    const now = dayjs();
    if (now.isAfter(targetDate)) {
      days = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;
      clearInterval(interval);
    } else {
      const duration = dayjs.duration(targetDate.diff(now));

      days = duration.days();
      hours = duration.hours();
      minutes = duration.minutes();
      seconds = duration.seconds();
    }
  };

  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    getDataRecapMintNFT();
    updateCountdown(); // Initial update
    interval = setInterval(updateCountdown, 1000);
  });

  onDestroy(() => {
    clearInterval(intervalId);
    clearInterval(interval);
  });

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  let openScreenSuccess = false;
  let isOpenModal = false;

  let intervalId = null;
  let dataMint;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const dispatch = createEventDispatcher();

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const triggerScreenSuccess = async () => {
    openScreenSuccess = true;
    triggerFirework();
    await wait(2000);
    openScreenSuccess = false;
    isOpenModal = true;
  };

  const downloadPage = async () => {
    mixpanel.track("recap_share_mintnft");
    const targetElement = document.getElementById("target-slide-4");
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
          a.download = "MintNFTRecap.png";
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

  const getDataRecapMintNFT = async () => {
    try {
      const response = await nimbus.get(
        `/recap/mint-stats?address=${solanaPublicAddress}`
      );
      if (response?.data?.totalMinted) {
        dataMint = response?.data;
      }
    } catch (e) {
      console.log(e);
    }
  };

  $: {
    intervalId = setInterval(() => {
      getDataRecapMintNFT();
    }, 30_000); // 30s
  }

  const handleMintNFT = createMutation({
    onError: (error) => {
      console.log(error);
      mixpanel.track("recap_mint_error");
      toastMsg = "Something wrong while minting. Please try again!";
      isSuccessToast = false;
      trigger();
    },
    mutationFn: async () => {
      mixpanel.track("recap_mint");
      const data = await nimbus.post("/recap/mint-nft-v2", {
        owner: solanaPublicAddress,
      });
      // TODO: Update me once deployed
      const connection = new Connection(
        // "https://devnet-rpc.shyft.to?api_key=gsusEvomKHQwwltu" // DEVNET
        "https://rpc.shyft.to?api_key=b4feHxaBppbRqTHc" // PROD
        // "https://rpc.shyft.to?api_key=gsusEvomKHQwwltu"
      );
      const result = await $walletStore.sendTransaction(
        Transaction.from(
          BufferPolyfill.from(data.data.result.encoded_transaction, "base64")
        ),
        connection
      );
      mixpanel.track("recap_mint_success");
      triggerScreenSuccess();
      return result;
    },
  });

  const handleMintNFTClick = () => {
    if (solanaPublicAddress) {
      $handleMintNFT.mutate();
      return;
    }
    dispatch("connect");
    mixpanel.track("recap_connect_wallet");
  };
</script>

<div
  class="bg-[#E8F4EF] pt-10 pb-20 overflow-hidden w-full min-h-screen flex"
  id="target-slide-4"
>
  <div
    class="flex-1 relative flex flex-col gap-20 h-full max-w-[1400px] m-auto"
  >
    <div class="flex justify-between items-center">
      <img
        src={Logo}
        alt="logo"
        class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px] transform translate-x-2"
      />
      <div class="flex justify-end items-center gap-6 pr-[35px]">
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px] w-[100px] flex items-center justify-center"
        >
          {days}<span class="text-gray-500 ml-[3px] text-2xl">d</span>
        </div>
        <img src={dotIcon} alt="" class="text-xl" />
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px] w-[100px] flex items-center justify-center"
        >
          {hours}<span class="text-gray-500 ml-[3px] text-2xl">h</span>
        </div>
        <img src={dotIcon} alt="" class="text-xl" />
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px] w-[100px] flex items-center justify-center"
        >
          {minutes}<span class="text-gray-500 ml-[3px] text-2xl">m</span>
        </div>
        <img src={dotIcon} alt="" class="text-xl" />
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px] w-[100px] flex items-center justify-center"
        >
          {seconds}<span class="text-gray-500 ml-[3px] text-2xl">s</span>
        </div>
      </div>
    </div>
    <div class="px-[35px] h-[90%] text-white">
      <div class="h-full rounded-[32px] bg-black">
        <div
          class="mx-auto relative p-[60px] h-full w-full flex xl:flex-row flex-col xl:justify-start justify-center items-center gap-20"
        >
          <div class="flex flex-col justify-between gap-[60px]">
            <div class="text-[60px] font-bold">Mint Your 2023 Recap</div>
            <div class="flex flex-col justify-between gap-8">
              <div class="flex flex-col justify-between gap-5">
                <div class="flex justify-between items-center">
                  <div class="text-white text-[24px]">Total mint</div>
                  <div class="flex items-end">
                    <div class="text-[#4DF6E2] text-[40px]">
                      {dataMint?.totalMinted || 0}
                    </div>
                    <div class="text-[#646464] text-[36px]">
                      /{dataMint?.next || 0}
                    </div>
                  </div>
                </div>

                <div class="w-full bg-gray-200 rounded-full h-6">
                  <div
                    class="relative bg-gray-300 h-6 rounded-full w-full overflow-hidden"
                  >
                    <div
                      class="absolute top-0 left-0 h-full bg-[#4DF6E2]"
                      style={`width: ${
                        dataMint?.next === 0
                          ? 100
                          : (dataMint?.totalMinted / dataMint?.next) * 100
                      }%`}
                    ></div>
                  </div>
                </div>
              </div>
              <div class="flex gap-10 items-center text-black">
                <button
                  class={`p-5 font-semibold text-2xl flex items-center gap-4 rounded-[32px] ${
                    dayjs().isAfter(targetDate)
                      ? "bg-[#dddddd]"
                      : "bg-[#4DF6E2]"
                  }`}
                  on:click={handleMintNFTClick}
                  disabled={dayjs().isAfter(targetDate)}
                >
                  {#if $handleMintNFT.isLoading}
                    Minting... <img src={HammerIcon} alt="" class="w-10 h-10" />
                  {:else if !solanaPublicAddress}
                    Connect wallet
                  {:else}
                    Mint {dataMint?.mintFee && dataMint?.mintFee !== 0
                      ? dataMint?.mintFee + " SOL"
                      : "Free"}
                    <img src={HammerIcon} alt="" class="w-10 h-10" />
                  {/if}
                </button>
                <button
                  class="p-5 font-semibold text-2xl flex items-center gap-4 rounded-[32px] bg-[#FFA41C]"
                  on:click={downloadPage}
                >
                  Share <img src={Share} alt="" class="w-10 h-10" />
                </button>
              </div>
            </div>
          </div>
          <div class="xl:absolute right-[120px]">
            <CardNftRecap {data} />
          </div>
        </div>
      </div>
    </div>
  </div>
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

{#if openScreenSuccess}
  <div
    class="fixed h-screen w-screen top-0 left-0 zindex flex items-center justify-center bg-[#000000cc]"
    on:click={() => {
      setTimeout(() => {
        openScreenSuccess = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-6">
      <div class="text-4xl text-white font-bold">
        Mint Solana RE2023 NFT successfully
      </div>
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Thank you for Mint our recap NFT. Ready to receive exclusive benefit
        with us!
      </div>
      <!-- <div class="flex flex-col items-center">
        <img src={goldImg} alt="" class="w-40 h-40" />
        <div class="xl:text-2xl text-4xl text-white font-medium">
          You have received 50 GM Points
        </div>
      </div> -->
    </div>
  </div>
{/if}

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModal}
  on:close={() => {
    isOpenModal = false;
  }}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">Sharing us on Twitter!</div>
      <div class="flex items-center justify-between">
        <div class="xl:text-base text-2xl text-gray-500 flex-[0.8]">
          Tweet your top moments, achievements, and favorite memories using our
          Nimbus Recap NFT
        </div>
        <a
          target="_blank"
          href="https://twitter.com/intent/tweet?text=2023%20has%20proven%20to%20be%20a%20challenging%20year%20for%20every%20holder%20and%20now%20let%27s%20reflect%20on%20my%20journey%20with%20%40solana%0Ahttps%3A%2F%2Fapp.getnimbus.io%2Frecap%0AIt%27s%20cool%20to%20be%20a%20part%20of%20Solana%0A%0A%23SolanaRE2023"
        >
          <Button>
            <div class="py-2 px-3">Share!</div>
          </Button>
        </a>
      </div>
    </div>
  </div>
</AppOverlay>

<style>
  .zindex {
    z-index: 99999;
  }
</style>
