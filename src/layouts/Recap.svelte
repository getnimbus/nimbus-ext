<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation, Mousewheel } from "swiper";
  SwiperCore.use([Pagination, Navigation, Mousewheel]);
  import { chain, typeWallet, user, userPublicAddress, wallet } from "~/store";
  import { nimbus } from "~/lib/network";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import {
    BackpackWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { useQueryClient } from "@tanstack/svelte-query";
  import bs58 from "bs58";
  import { onMount } from "svelte";
  import onboard from "~/lib/web3-onboard";
  import mixpanel from "mixpanel-browser";
  import { shorterAddress, clickOutside } from "~/utils";

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
  import AppOverlay from "~/components/Overlay.svelte";
  import Loading from "~/components/Loading.svelte";

  import Logo from "~/assets/logo-1.svg";
  import User from "~/assets/user.png";
  import NFTOne from "~/assets/recap/nft-card-3.png";
  import NFTTwo from "~/assets/recap/nft-card-1.png";

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

  const wallets$ = onboard.state.select("wallets");

  const queryClient = useQueryClient();

  let userPublicAddressChain = "EVM";
  let userAddress = $userPublicAddress;
  let invitation = "";
  let isOpenAuthModal = false;
  let showPopover = false;
  let isLoading = false;

  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  $: {
    if (solanaPublicAddress) {
      userAddress = solanaPublicAddress;

      const solanaToken = localStorage.getItem("solana_token");
      if (!solanaToken) {
        isLoading = true;
        isOpenAuthModal = false;
        handleSignOut();
        handleGetSolanaNonce(solanaPublicAddress);
      }
    } else {
      userAddress = $userPublicAddress;
    }
  }

  $: {
    if (userAddress) {
      handleValidateAddress(userAddress);
    }
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationParams = urlParams.get("invitation");
    if (invitationParams) {
      invitation = invitationParams;
    }
    const solanaToken = localStorage.getItem("solana_token");

    if (solanaToken) {
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
      userAddress = $userPublicAddress;
    } else {
      handleSignOut();
    }
  });

  const disconnect = (value: any) => {
    if (value && Object.keys(value).length !== 0) {
      onboard.disconnectWallet({ label: value.label });
    }
  };

  const handleSignOut = () => {
    try {
      user.update((n) => (n = {}));
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
      userPublicAddress.update((n) => (n = ""));

      localStorage.removeItem("public_address");

      localStorage.removeItem("evm_token");
      disconnect($wallets$?.[0]);

      queryClient.invalidateQueries(["list-address"]);
      queryClient.invalidateQueries(["users-me"]);
      mixpanel.reset();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignSolanaAddressMessage = async (signatureString) => {
    if ($walletStore.connected) {
      const res = await $walletStore?.signMessage(
        Uint8Array.from(
          Array.from(`I am signing my one-time nonce: ${signatureString}`).map(
            (letter) => letter.charCodeAt(0)
          )
        )
      );
      if (res) {
        return bs58.encode(res);
      } else {
        return "";
      }
    }
  };

  const handleGetSolanaNonce = async (address) => {
    try {
      const res: any = await nimbus.post("/users/nonce", {
        publicAddress: address,
        referrer: invitation.length !== 0 ? invitation : undefined,
      });
      if (res && res.data) {
        const signatureString = await handleSignSolanaAddressMessage(
          res?.data?.nonce
        );
        if (signatureString) {
          const payload = {
            signature: signatureString,
            publicAddress: address,
          };
          handleGetSolanaToken(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetSolanaToken = async (data) => {
    try {
      const res = await nimbus.post("/auth/solana", data);
      if (res?.data?.result) {
        localStorage.setItem("solana_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
      }
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };
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
          <div
            class="flex-1 h-full flex xl:flex-row flex-col items-center xl:gap-20 gap-10 px-[35px]"
          >
            <div class="xl:flex-[0.7] flex-0 flex flex-col">
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
                  <div
                    class="relative w-max flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] border-[#27326f] text-[#27326f] xl:text-base text-2xl font-semibold"
                  >
                    {#if userPublicAddressChain === "SOL" && userAddress}
                      <span
                        on:click={() => {
                          showPopover = true;
                        }}
                      >
                        {#if isLoading}
                          <Loading />
                        {:else}
                          {shorterAddress(userAddress)}
                        {/if}
                      </span>
                    {:else}
                      <span
                        on:click={() => {
                          isOpenAuthModal = true;
                        }}
                      >
                        Connect wallet
                      </span>
                    {/if}

                    {#if showPopover}
                      <div
                        class="select_content absolute top-15 right-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg w-full"
                        style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
                        use:clickOutside
                        on:click_outside={() => (showPopover = false)}
                      >
                        <div
                          class="text-2xl font-medium text-red-500 cursor-pointer xl:text-base rounded-md transition-all px-2 py-1 text-center"
                          on:click={() => {
                            handleSignOut();
                            localStorage.removeItem("solana_token");
                            $walletStore.disconnect();
                            showPopover = false;
                            isOpenAuthModal = false;
                          }}
                        >
                          Log out
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1 flex justify-end relative">
              <div class="relative z-2">
                <CardNftRecap nft={NFTTwo} />
              </div>
              <div class="absolute bottom-16 left-4 z-1">
                <CardNftRecap nft={NFTOne} />
              </div>
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

<!-- Modal connect wallet -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenAuthModal}
  on:close={() => (isOpenAuthModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="xl:title-3 title-1 font-medium">
      Connect wallet to enjoy more features
    </div>
    <div class="flex items-center justify-center gap-4">
      <SolanaAuth text="Login with Solana" />
    </div>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global>
</style>
