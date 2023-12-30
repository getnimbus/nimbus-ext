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

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgThree from "~/assets/recap/hero/svgThree.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import dotIcon from "~/assets/recap/2-dot-icon.svg";
  import mintBtn from "~/assets/recap/mint/mint-nft-btn.svg";
  import shareBtn from "~/assets/recap/mint/share-btn.svg";
  import NFTimg from "~/assets/recap/nft-card-3.png";
  import CardNftRecap from "~/components/CardNFTRecap.svelte";

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

<div class="bg-[#E8F4EF] overflow-hidden w-full h-full" id="target-slide-2">
  <div
    class="flex flex-col justify-between h-full max-w-[2000px] gap-2 m-auto w-[90%] py-5"
  >
    <!-- header  -->
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
    <div class="relative px-[35px] h-[90%] text-white">
      <div
        class="bg-black relative rounded-[32px] p-[60px] h-full w-full flex items-center"
      >
        <div class="flex flex-col justify-between gap-[60px]">
          <div class="text-[60px] font-bold">Mint You 2023 recap</div>
          <div class="flex flex-col justify-between gap-8">
            <div class="flex flex-col justify-between gap-5">
              <div class="flex justify-between text-2xl">
                <div>Total mint</div>
                <div>
                  <span class="text-[#4DF6E2]">45</span>/<span
                    class="text-gray-500 text-xl">100</span
                  >
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-6">
                <div class="bg-[#4DF6E2] h-6 rounded-full" style="width: 45%" />
              </div>
            </div>
            <div class="flex justify-between items-center text-black">
              <button
                class="p-5 font-semibold text-2xl flex items-center gap-4 rounded-[32px] bg-[#4DF6E2]"
                on:click={$handleMintNFT.mutate()}
              >
                Mint 0.05 SOL ($5.25) <img src={mintBtn} alt="" />
              </button>
              <button
                class="p-5 font-semibold text-2xl flex items-center gap-4 rounded-[32px] bg-[#FFA41C]"
              >
                Share <img src={shareBtn} alt="" />
              </button>
            </div>
          </div>
        </div>
        <div class="absolute right-[120px]">
          <CardNftRecap nft={NFTimg} />
        </div>
      </div>
    </div>
  </div>
</div>

<style></style>
