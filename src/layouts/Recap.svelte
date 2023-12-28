<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation, Mousewheel } from "swiper";
  SwiperCore.use([Pagination, Navigation, Mousewheel]);
  import { userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import {
    BackpackWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import "swiper/swiper.scss";
  import "swiper/components/pagination/pagination.scss";

  import TokenHolding from "~/UI/Recap/TokenHolding.svelte";
  import Airdrop from "~/UI/Recap/Airdrop.svelte";
  import MintNft from "~/UI/Recap/MintNFT.svelte";
  import NftHolding from "~/UI/Recap/NFTHolding.svelte";
  import Promote from "~/UI/Recap/Promote.svelte";
  import SolanaAuth from "~/UI/Auth/SolanaAuth.svelte";

  import Logo from "~/assets/logo-1.svg";

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      userPublicAddressChain = response?.data.type;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ];

  let userPublicAddressChain = "EVM";
  let userAddress = $userPublicAddress;

  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  $: {
    if (solanaPublicAddress) {
      userAddress = solanaPublicAddress;
    } else {
      userAddress = $userPublicAddress;
    }
  }

  $: {
    if (userAddress) {
      handleValidateAddress(userAddress);
    }
  }

  $: console.log("userAddress: ", userAddress);
</script>

<ErrorBoundary>
  <Swiper
    direction="vertical"
    mousewheel={true}
    cssMode={true}
    slidesPerView={1}
    speed={2000}
    pagination={{ clickable: true, dynamicBullets: true }}
    class="h-screen"
  >
    <SwiperSlide>
      <div class="bg-[#EBFDFF] min-h-screen">
        <div class="flex max-w-[2000px] m-auto w-[90%]">
          <div class="flex flex-col">
            <img
              src={Logo}
              alt="logo"
              class="-ml-10 xl:w-[177px] w-[220px] xl:h-[60px] h-[100px]"
            />
            <div>
              <div class="text-[#323842] text-5xl font-bold">
                2023 Solana Recap
              </div>
              <div class="flex flex-col">
                <div class="text-[#565E6C] font-normal text-sm">
                  2023 has proven to be a challenging year for every holder, but
                  we've managed to weather the storm and emerge from the bottom.
                  This resilience is a significant achievement, and now let's
                  reflect on the moments we've overcome together.
                </div>
                <SolanaAuth text="Connect wallet" />
              </div>
            </div>
          </div>
          <div>hello</div>
        </div>
      </div>
    </SwiperSlide>

    {#if userPublicAddressChain === "SOL" && userAddress}
      <SwiperSlide>
        <TokenHolding />
      </SwiperSlide>

      <SwiperSlide>
        <NftHolding />
      </SwiperSlide>

      <SwiperSlide>
        <Airdrop />
      </SwiperSlide>

      <SwiperSlide>
        <MintNft />
      </SwiperSlide>
    {/if}

    <SwiperSlide>
      <Promote />
    </SwiperSlide>
  </Swiper>
</ErrorBoundary>

<WalletProvider localStorageKey="walletAdapter" {wallets} autoConnect />

<style windi:preflights:global windi:safelist:global>
</style>
