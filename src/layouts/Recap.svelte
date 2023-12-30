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
  import { useQueryClient, createQuery } from "@tanstack/svelte-query";
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
  import CardNftRecap from "~/components/CardNFTRecap.svelte";
  import Loading from "~/components/Loading.svelte";

  import WalletModal from "~/UI/SolanaCustomWalletBtn/WalletModal.svelte";

  import Logo from "~/assets/logo-1.svg";
  import User from "~/assets/user.png";
  import NFTOne from "~/assets/recap/nft-card-3.png";
  import NFTTwo from "~/assets/recap/nft-card-1.png";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
  import Arrow from "~/assets/recap/hero/arrow-right.svg";

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

  let showPopover = false;
  let isLoading = false;
  let data;

  $: solanaPublicAddress = $walletStore?.publicKey?.toBase58();

  $: {
    if (solanaPublicAddress) {
      userAddress = solanaPublicAddress;

      const solanaToken = localStorage.getItem("solana_token");
      if (!solanaToken) {
        isLoading = true;
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

  // trigger Solana wallet
  const maxNumberOfWallets = 3;
  let modalVisible = false;
  const openModal = () => {
    modalVisible = true;
  };
  const closeModal = () => (modalVisible = false);
  async function connectWallet(event) {
    closeModal();
    await $walletStore.select(event.detail);
    await $walletStore.connect();
  }

  const getRecapData = async (address: string) => {
    const response: any = await nimbus.get(
      `/recap?address=${"DD9eeertZsaHXzxiBwaBV9BSgMhPHb2yuvBH5ivuxAFV"}`
    );
    return response?.data;
  };

  $: query = createQuery({
    queryKey: ["recap", userAddress],
    queryFn: () => getRecapData(userAddress),
    staleTime: Infinity,
    retry: false,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      userPublicAddressChain === "SOL" &&
      userAddress.length !== 0,
  });

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      Object.keys($query.data).length !== 0
    ) {
      data = $query.data;
    }
  }

  $: console.log("data: ", data);
</script>

<ErrorBoundary>
  <!-- <Swiper
    direction="vertical"
    mousewheel={true}
    cssMode={true}
    slidesPerView={1}
    speed={2000}
    pagination={{ clickable: true, dynamicBullets: true }}
    class="h-screen"
  >
    <SwiperSlide>
      <div class="bg-[#EBFDFF] h-full overflow-hidden">
        <div class="flex flex-col h-full max-w-[2000px] m-auto w-[90%]">
          <img
            src={Logo}
            alt="logo"
            class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
          />
          <div
            class="flex-1 h-full flex xl:flex-row flex-col items-center item_start xl:justify-between justify-center gap-20 px-[35px]"
          >
            <div class="flex flex-col gap-10">
              <div
                class="text-[#202025] text-[100px] text_title_lg_view font-bold"
              >
                2023 Solana Recap
              </div>
              <div class="flex flex-col gap-6">
                {#if userPublicAddressChain === "SOL" && userAddress}
                  <div
                    class="relative w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black xl:text-xl text-2xl font-semibold"
                    on:click={() => {
                      showPopover = true;
                    }}
                  >
                    {#if isLoading}
                      <Loading />
                    {:else}
                      {shorterAddress(userAddress)}
                    {/if}

                    {#if showPopover && $user && Object.keys($user).length !== 0}
                      <div
                        class="bg-white absolute top-20 right-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg w-full"
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
                          }}
                        >
                          Log out
                        </div>
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div
                    class="w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black xl:text-xl text-2xl font-semibold"
                  >
                    Connect My Wallet
                    <img src={Arrow} alt="" />
                  </div>
                {/if}
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-black font-normal text-base xl:px-0 px-[35px]">
                2023 has proven to be a challenging year for every holder, but
                we've managed to weather the storm and emerge from the bottom.
                This resilience is a significant achievement, and now let's
                reflect on the moments we've overcome together.
              </div>

              <div class="flex justify-center gap-10 py-10 px-16">
                <div class="relative">
                  <div class="absolute top-[-110px] left-[-160px]">
                    <img
                      src={SvgOne}
                      alt=""
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <CardNftRecap nft={NFTTwo} />
                </div>
                <div class="relative">
                  <div class="absolute bottom-[-130px] right-[-150px]">
                    <img
                      src={SvgTwo}
                      alt=""
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <CardNftRecap nft={NFTOne} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SwiperSlide>

    {#if userPublicAddressChain === "SOL" && userAddress}
      <SwiperSlide>
        <TokenHolding data={data?.tokens} loading={$query.isLoading} />
      </SwiperSlide>

      <SwiperSlide>
        <NftHolding data={data?.nfts} loading={$query.isLoading} />
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
  </Swiper> -->

  <div class="bg-[#EBFDFF] h-full overflow-hidden py-10">
    <div class="flex flex-col gap-20 h-full max-w-[2400px] m-auto w-[96%]">
      <img
        src={Logo}
        alt="logo"
        class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
      />
      <div
        class="flex-1 h-full flex xl:flex-row flex-col items-center item_start xl:justify-between justify-center gap-20 px-[35px]"
      >
        <div class="flex flex-col gap-10">
          <div class="text-[#202025] text-[100px] text_title_lg_view font-bold">
            2023 Solana Recap
          </div>
          <div class="flex flex-col gap-6">
            {#if userPublicAddressChain === "SOL" && userAddress}
              <div
                class="relative w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black text-2xl font-semibold"
                on:click={() => {
                  showPopover = true;
                }}
              >
                {#if isLoading}
                  <Loading />
                {:else}
                  {shorterAddress(userAddress)}
                {/if}

                {#if showPopover && $user && Object.keys($user).length !== 0}
                  <div
                    class="bg-white absolute top-20 right-0 z-50 flex flex-col gap-1 px-3 xl:py-2 py-3 text-sm transform rounded-lg w-full"
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
                      }}
                    >
                      Log out
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div
                class="w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black text-2xl font-semibold"
                on:click={() => {
                  openModal();
                }}
              >
                Connect My Wallet
                <img src={Arrow} alt="" />
              </div>
            {/if}
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="text-black font-normal text-base">
            2023 has proven to be a challenging year for every holder, but we've
            managed to weather the storm and emerge from the bottom. This
            resilience is a significant achievement, and now let's reflect on
            the moments we've overcome together.
          </div>

          <div class="flex justify-center gap-10 py-10 px-16">
            <div class="relative">
              <div class="absolute top-[-80px] left-[-160px]">
                <img src={SvgOne} alt="" class="w-full h-full object-contain" />
              </div>
              <CardNftRecap nft={NFTTwo} />
            </div>
            <div class="relative">
              <div class="absolute bottom-[-130px] right-[-150px]">
                <img src={SvgTwo} alt="" class="w-full h-full object-contain" />
              </div>
              <CardNftRecap nft={NFTOne} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if userPublicAddressChain === "SOL" && userAddress}
    <TokenHolding data={data?.tokens} loading={$query.isLoading} />
    <NftHolding data={data?.nfts} loading={$query.isLoading} />
    <Airdrop />
    <MintNft />
  {/if}

  <Promote />
</ErrorBoundary>

<WalletProvider localStorageKey="walletAdapter" {wallets} autoConnect />

{#if modalVisible}
  <WalletModal
    on:close={closeModal}
    on:connect={connectWallet}
    {maxNumberOfWallets}
  />
{/if}

<style windi:preflights:global windi:safelist:global>
  @media (min-width: 1024px) {
    @media not all and (min-width: 1280px) {
      .text_title_lg_view {
        font-size: 60px;
      }
      .item_start {
        -webkit-box-align: start;
        -ms-flex-align: start;
        -webkit-align-items: flex-start;
        align-items: flex-start;
      }
    }
  }
</style>
