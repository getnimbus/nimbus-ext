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
  import CardNftRecap from "~/components/CardNFTRecap.svelte";

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

  import NFTOne from "~/assets/recap/nft-card-1.png";

  const fakeData = {
    tokens: {
      stats: {
        total_holding: 100,
        networth_change: 100,
        total_txs: 100,
        total_gas_fee_in_sol: 100,
        total_gas_fee_in_eth: 100,
      },
      holding: [
        {
          owner: "ArTbfyWWNBLkDhU2ar8RBEPDHkEv6jVWJTwxjDnVYnMX",
          cmc_id: 0,
          cg_id: "lamas-finance",
          cmc_slug: null,
          name: "Lamas Finance",
          symbol: "LMF",
          logo: "https://www.lamas.co/resource/lmf_token.png",
          amount: "0",
          amountRaw: "0",
          balance: "0",
          contractAddress: "LMFzmYL6y1FX8HsEmZ6yNKNzercBmtmpg2ZoLwuUboU",
          contractDecimals: 9,
          rate: 0.3278586024970768,
          price: {
            price: 0.3278586024970768,
            symbol: "LMF",
            decimal: 9,
            source: "C",
          },
          profit: {
            address: "LMFzmYL6y1FX8HsEmZ6yNKNzercBmtmpg2ZoLwuUboU",
            realizedProfit: 0,
            averageCost: null,
            cost: 0,
            chain: "SOL",
            type: "TOKEN",
          },
          avgCost: 0,
          last_transferred_at: null,
          positionId: "SOL-LMFzmYL6y1FX8HsEmZ6yNKNzercBmtmpg2ZoLwuUboU",
          category: "Other",
          sector: "Other",
          rank: "No rank yet",
          positionType: "Other",
          chain: "SOL",
        },
      ],
      top_gainer: [
        {
          owner: "ArTbfyWWNBLkDhU2ar8RBEPDHkEv6jVWJTwxjDnVYnMX",
          cmc_id: 0,
          cg_id: "lamas-finance",
          cmc_slug: null,
          name: "Lamas Finance",
          symbol: "LMF",
          logo: "https://www.lamas.co/resource/lmf_token.png",
          amount: "0",
          amountRaw: "0",
          balance: "0",
          contractAddress: "LMFzmYL6y1FX8HsEmZ6yNKNzercBmtmpg2ZoLwuUboU",
          contractDecimals: 9,
          rate: 0.3278586024970768,
          price: {
            price: 0.3278586024970768,
            symbol: "LMF",
            decimal: 9,
            source: "C",
          },
          profit: {
            address: "LMFzmYL6y1FX8HsEmZ6yNKNzercBmtmpg2ZoLwuUboU",
            realizedProfit: 0,
            averageCost: null,
            cost: 0,
            chain: "SOL",
            type: "TOKEN",
          },
          avgCost: 0,
          last_transferred_at: null,
          positionId: "SOL-LMFzmYL6y1FX8HsEmZ6yNKNzercBmtmpg2ZoLwuUboU",
          category: "Other",
          sector: "Other",
          rank: "No rank yet",
          positionType: "Other",
          chain: "SOL",
        },
      ],
    },
    nfts: {
      stats: {
        total_holding: 100,
        total_trades: 100,
        networth: 100, // in USD
        amount: 100, // in SOL
      },
      top_holding: [
        {
          attributes: [
            {
              trait_type: "Gender",
              value: "Male",
            },
            {
              trait_type: "Type",
              value: "Light",
            },
            {
              trait_type: "Expression",
              value: "Joy",
            },
            {
              trait_type: "Hair",
              value: "Aviator",
            },
            {
              trait_type: "Eyes",
              value: "Closed",
            },
            {
              trait_type: "Clothing",
              value: "Tuxedo",
            },
            {
              trait_type: "Background",
              value: "Violet",
            },
          ],
          royalty: 0,
          imageUrl:
            "https://madlads.s3.us-west-2.amazonaws.com/images/2736.png",
          tokenId: "2736",
          contractAddress: "4BehroxbhTuevXv3NACTsHTFRrSkv66fN7hUhDyKsJsA",
          name: "Mad Lads #2736",
          collection: {
            description: "",
            externalUrl: "https://madlads.com",
            id: "mad_lads",
            imageUrl:
              "https://madlads.s3.us-west-2.amazonaws.com/images/2736.png",
            name: "Mad Lads",
            totalItems: 2,
            chain: "SOL",
          },
          collectionId: "mad_lads",
          rarityScore: 0,
          rank: "N/A",
          price: 94.8999,
          cost: 1669.289241,
        },
      ],
    },
    airdrops: [
      {
        protocol: "pyth",
        protocolLabel: "Pyth",
        token: "pyth",
        ticker: "PYTH",
        eligible: false,
        amount: 0,
        note: "This is based on a single address. This does not include any other addresses that may be associated with this account. This data is provided by pyth.network",
        potentialValueUsdc: 0,
      },
    ],
  };

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
      <div class="bg-[#EBFDFF] h-full">
        <div class="flex flex-col h-full max-w-[2000px] m-auto w-[90%]">
          <img
            src={Logo}
            alt="logo"
            class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
          />
          <div class="flex-1 h-full flex items-center gap-20 px-[35px]">
            <div class="flex-[0.7] flex flex-col">
              <div class="flex flex-col gap-10">
                <div class="text-[#323842] text-5xl font-bold">
                  2023 Solana Recap
                </div>
                <div class="flex flex-col gap-6">
                  <div class="text-[#565E6C] font-normal text-sm">
                    2023 has proven to be a challenging year for every holder,
                    but we've managed to weather the storm and emerge from the
                    bottom. This resilience is a significant achievement, and
                    now let's reflect on the moments we've overcome together.
                  </div>
                  <div class="w-max">
                    <SolanaAuth text="Connect wallet" />
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1 flex flex-col">
              <CardNftRecap nft={NFTOne} />
            </div>
          </div>
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
