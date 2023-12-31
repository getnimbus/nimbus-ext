<script>
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";
  import { userPublicAddress } from "~/store";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import {
    Connection,
    Transaction,
    VersionedTransaction,
  } from "@solana/web3.js";
  import html2canvas from "html2canvas";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import CardNftRecap from "~/components/CardNFTRecap.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";

  import Logo from "~/assets/logo-1.svg";
  import HammerIcon from "~/assets/recap/hero/hammer.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import NFTTwo from "~/assets/recap/nft-card-1.png";
  import dotIcon from "~/assets/recap/2-dot-icon.svg";
  import goldImg from "~/assets/Gold4.svg";

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  let openScreenSuccess = false;
  let isOpenModal = false;

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

  const triggerScreenSuccess = async () => {
    openScreenSuccess = true;
    triggerFirework();
    await wait(2000);
    openScreenSuccess = false;
    isOpenModal = true;
  };

  const downloadPage = async () => {
    const targetElement = document.getElementById("target-slide-4");
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

  const handleMintNFT = createMutation({
    mutationFn: async () => {
      const data = await nimbus.post("/recap/mint-nft", {
        image: "", // TODO: Add base 64 image here
      });

      console.log(data.data.result.encoded_transaction);
      const signedTx = await $walletStore.signTransaction(
        Transaction.from(
          Buffer.from(data.data.result.encoded_transaction, "base64")
        )
      );
      const connection = new Connection(
        "https://devnet-rpc.shyft.to?api_key=Gny0V25q6Y2kMjze" // DEVNET
        // "https://rpc.shyft.to?api_key=Qjb6SubTTbLrkmNo" // PROD
      );
      const result = await $walletStore.sendTransaction(signedTx, connection);
      console.log(result);
      triggerScreenSuccess();
      return result;
    },
  });
</script>

<div
  class="bg-[#E8F4EF] pt-10 pb-20 overflow-hidden w-full h-screen"
  id="target-slide-4"
>
  <div
    class="relative flex flex-col gap-20 h-full max-w-[2400px] m-auto w-[96%]"
  >
    <div class="flex justify-between items-center">
      <img
        src={Logo}
        alt="logo"
        class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
      />
      <div class="flex justify-end items-center gap-6 pr-[35px]">
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px]"
        >
          6<span class="text-gray-500 ml-[3px] text-2xl">d</span>
        </div>
        <img src={dotIcon} alt="" class="text-xl" />
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px]"
        >
          21<span class="text-gray-500 ml-[3px] text-2xl">h</span>
        </div>
        <img src={dotIcon} alt="" class="text-xl" />
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px]"
        >
          15<span class="text-gray-500 ml-[3px] text-2xl">m</span>
        </div>
        <img src={dotIcon} alt="" class="text-xl" />
        <div
          class="bg-black text-white text-[32px] leading-[48px] py-[14px] px-[19px] rounded-[12px]"
        >
          5<span class="text-gray-500 ml-[3px] text-2xl">s</span>
        </div>
      </div>
    </div>
    <div class="px-[35px] h-[90%] text-white">
      <div class="h-full rounded-[32px] bg-black">
        <div
          class="mx-auto large_screen_width relative p-[60px] h-full w-full flex xl:flex-row flex-col xl:justify-start justify-center items-center gap-20"
        >
          <div class="flex flex-col justify-between gap-[60px]">
            <div class="text-[60px] font-bold">Mint You 2023 recap</div>
            <div class="flex flex-col justify-between gap-8">
              <div class="flex flex-col justify-between gap-5">
                <div class="flex justify-between items-center">
                  <div class="text-white text-[24px]">Total mint</div>
                  <div class="flex items-end">
                    <div class="text-[#4DF6E2] text-[40px]">45</div>
                    <div class="text-[#646464] text-[36px]">/100</div>
                  </div>
                </div>

                <div class="w-full bg-gray-200 rounded-full h-6">
                  <div
                    class="bg-[#4DF6E2] h-6 rounded-full"
                    style="width: 45%"
                  />
                </div>
              </div>
              <div class="flex gap-10 items-center text-black">
                <button
                  class="p-5 font-semibold text-2xl flex items-center gap-4 rounded-[32px] bg-[#4DF6E2]"
                  on:click={$handleMintNFT.mutate()}
                >
                  Mint 0.05 SOL <img
                    src={HammerIcon}
                    alt=""
                    class="w-10 h-10"
                  />
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
            <CardNftRecap nft={NFTTwo} />
          </div>
        </div>
      </div>
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
        Mint Nimbus recap NFT successfully
      </div>
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Thank you for Mint our recap NFT. Ready to receive exclusive benefit
        with us!
      </div>
      <div class="flex flex-col items-center">
        <img src={goldImg} alt="" class="w-40 h-40" />
        <div class="xl:text-2xl text-4xl text-white font-medium">
          You have received 50 GM Points
        </div>
      </div>
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
        <div on:click={() => console.log("sharing tweet")}>
          <Button>
            <div class="py-2 px-3">Share!</div>
          </Button>
        </div>
      </div>
    </div>
  </div>
</AppOverlay>

<style>
  @media (min-width: 2000px) {
    .large_screen_width {
      width: 1700px;
    }
  }
  .zindex {
    z-index: 99999;
  }
</style>
