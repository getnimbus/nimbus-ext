<script>
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import {
    Connection,
    Transaction,
    VersionedTransaction,
  } from "@solana/web3.js";
  import html2canvas from "html2canvas";
  import { Toast, Progressbar } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import CardNftRecap from "~/components/CardNFTRecap.svelte";

  import Logo from "~/assets/logo-1.svg";
  import HammerIcon from "~/assets/recap/hero/hammer.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import NFTTwo from "~/assets/recap/nft-card-1.png";
  import dotIcon from "~/assets/recap/2-dot-icon.svg";

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
    <div class="px-[35px] h-[90%] text-white rounded-[32px] bg-black">
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
              <Progressbar progress={90} animate size="h-6" />
            </div>
            <div class="flex justify-between items-center text-black">
              <button
                class="p-5 font-semibold text-2xl flex items-center gap-4 rounded-[32px] bg-[#4DF6E2]"
                on:click={$handleMintNFT.mutate()}
              >
                Mint 0.05 SOL ($5.25) <img src={HammerIcon} alt="" />
              </button>
              <button
                class="p-5 font-semibold text-2xl flex items-center gap-4 rounded-[32px] bg-[#FFA41C]"
                on:click={downloadPage}
              >
                Share <img src={Share} alt="" />
              </button>
            </div>
          </div>
        </div>
        <div class="xl:absolute right-[120px]">
          <CardNftRecap nft={NFTTwo} />
        </div>
      </div>
    </div>
    <!-- <div class="flex-1 h-full px-[35px]">
      <div
        class="bg-black rounded-[32px] p-[60px] h-full flex justify-between gap-20"
      >
        <div class="flex-1 flex flex-col gap-10 justify-between">
          <div class="text-white text-[60px] xl:w-1/2 w-full font-bold">
            Mint your 2023 recap
          </div>
          <div class="xl:hidden block">
            <CardNftRecap nft={NFTTwo} />
          </div>
          <div class="flex flex-col xl:gap-20 gap-10 w-max">
            <div class="w-full flex flex-col gap-6">
              <div class="flex justify-between items-center">
                <div class="text-white text-[24px]">Total mint</div>
                <div class="flex items-end">
                  <div class="text-[#4DF6E2] text-[40px]">45</div>
                  <div class="text-[#646464] text-[36px]">/100</div>
                </div>
              </div>
              <Progressbar progress={90} animate size="h-6" />
            </div>
            <div class="flex items-center gap-10">
              <div
                class="bg-[#4DF6E2] text-black p-4 flex items-center gap-4 text-2xl font-semibold rounded-[32px] w-max cursor-pointer relative z-20"
                on:click={$handleMintNFT.mutate()}
              >
                Mint 0.05 SOL ($5.25)
                <img src={HammerIcon} alt="" />
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
          </div>
        </div>
      </div>

      <div class="xl:block hidden">
        <CardNftRecap nft={NFTTwo} />
      </div>
    </div> -->
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
  @media (min-width: 2000px) {
    .large_screen_width {
      width: 1700px;
    }
  }
</style>
