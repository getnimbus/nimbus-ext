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
  <div class="px-10">
    {#if userPublicAddressChain !== "SOL"}
      <div class="flex flex-col items-center justify-center gap-4 h-screen">
        <div class="font-medium xl:title-3 title-1">
          Connect your wallet to take a look recap for last year
        </div>
        <SolanaAuth text="Connect wallet" />
      </div>
    {:else}
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

        <SwiperSlide>
          <Promote />
        </SwiperSlide>
      </Swiper>
    {/if}
  </div>
</ErrorBoundary>

<WalletProvider localStorageKey="walletAdapter" {wallets} autoConnect />

<style windi:preflights:global windi:safelist:global>
</style>
