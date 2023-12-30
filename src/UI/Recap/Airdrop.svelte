<script>
  import Logo from "~/assets/logo-1.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
  import shareIco from "~/assets/recap/share-icon.svg";
  import carIco from "~/assets/recap/car-ico.svg";
  import { createMutation } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { Connection, Transaction } from "@solana/web3.js";

  const handleAirdrop = createMutation({
    mutationFn: async () => {
      const data = await nimbus.post("/recap/airdrop", {
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

  $: console.log("this is data airdrop", $handleAirdrop);
</script>

<div
  class="bg-[#EFF4E8] pt-10 pb-20 overflow-hidden w-full h-screen"
  id="target-slide-4"
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
        You earn <span class="text-[60px]">21</span> airdrop worth
        <span class="text-[60px]">$21,122</span>
      </div>
      <button
        class="text-2xl font-semibold rounded-[32px] p-5 flex gap-4 bg-[#FFA41C]"
      >
        Share <img src={shareIco} alt="" />
      </button>
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
    </div>

    <div class="absolute bottom-[-125px] left-[-145px] z-10 rotate-93_74">
      <img src={SvgTwo} alt="" />
    </div>

    <div class="absolute top-[-175px] right-[-120px] z-10 rotate-131_26">
      <img src={SvgTwo} alt="" class="" />
    </div>
  </div>
</div>

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
