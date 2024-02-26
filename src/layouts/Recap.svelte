<script lang="ts">
  import {
    // BackpackWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import { createQuery } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { userPublicAddress } from "~/store";
  import { inview } from "svelte-inview";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import CardNftRecap from "~/components/CardNFTRecap.svelte";
  import Airdrop from "~/UI/Recap/Airdrop.svelte";
  import MintNft from "~/UI/Recap/MintNFT.svelte";
  import NftHolding from "~/UI/Recap/NFTHolding.svelte";
  import Promote from "~/UI/Recap/Promote.svelte";
  import TokenHolding from "~/UI/Recap/TokenHolding.svelte";
  import WalletModal from "~/UI/SolanaCustomWalletBtn/WalletModal.svelte";

  import Logo from "~/assets/logo-1.svg";
  import Arrow from "~/assets/recap/hero/arrow-right.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
  import SuperteamLogo from "~/assets/superteamvn.png";

  const NFTOne = {
    solHolding: 5.5,
    summaryLabel: "Bonk Friend",
    tag: "Top 10",
  };

  const NFTTwo = {
    solHolding: 68.78,
    summaryLabel: "True Holder",
    tag: "Top 8",
  };

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      if (response?.data) {
        userPublicAddressChain = response?.data?.type;
      }
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // new BackpackWalletAdapter(),
  ];

  let userPublicAddressChain = "EVM";
  let userAddress = $userPublicAddress;

  let data;
  let inputAddress;

  onMount(() => {
    $walletStore.disconnect();
  });

  // trigger Solana wallet
  let modalVisible = false;
  const maxNumberOfWallets = 5;
  const openModal = () => {
    modalVisible = true;
  };

  const closeModal = () => (modalVisible = false);

  const connectWallet = async (event) => {
    closeModal();
    try {
      localStorage.removeItem("walletAdapter");
      await walletStore.resetWallet();
      await walletStore.setConnecting(false);
      await $walletStore.disconnect();
      await $walletStore.select(event.detail);
      await $walletStore.connect();
    } catch (error) {
      console.log(error);
    }
  };

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

  const getRecapData = async (address: string) => {
    const response: any = await nimbus.get(`/recap?address=${address}`);
    return response?.data;
  };

  $: query = createQuery({
    queryKey: ["recap", userAddress],
    queryFn: () => getRecapData(userAddress),
    staleTime: Infinity,
    retry: false,
    enabled: !!userAddress,
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
</script>

<svelte:head>
  <title>Your Solana 2023 Recap</title>
  <meta
    name="description"
    content="Recap your journey with Solana in 2023, mint your momemnt"
  />
  <meta property="twitter:image" content="/assets/logo/logoN.png" />
</svelte:head>

<ErrorBoundary>
  <div class="recap-wrapper" id="recap-wrapper">
    <div
      class="recap-container"
      use:inview={{
        threshold: 0.1,
      }}
      on:inview_change={(event) => {
        const { inView, entry, scrollDirection, observer, node } = event.detail;
        if (inView) {
          document
            .getElementById("recap-wrapper")
            ?.classList.add("recap-wrapper");
        }
      }}
    >
      <div class="bg-[#EBFDFF] min-h-screen overflow-hidden py-10 flex">
        <div class="flex 1 flex flex-col gap-20 h-full max-w-[1400px] m-auto">
          <img
            src={Logo}
            alt="logo"
            class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px] transform translate-x-2"
          />
          <div
            class="flex-1 h-full flex xl:flex-row flex-col items-center item_start xl:justify-between justify-center gap-20 px-[35px]"
          >
            <div class="flex flex-col gap-10">
              <div
                class="text-[#202025] text-[100px] text_title_lg_view font-bold mt-3"
              >
                2023 Solana Recap
              </div>
              <div class="flex flex-col gap-6">
                <div class="space-y-4">
                  <div class="w-max">
                    <input
                      type="text"
                      name="address"
                      class="block w-full rounded-full border-0 py-4 px-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-3xl"
                      placeholder="Your wallet address"
                      bind:value={inputAddress}
                    />
                  </div>
                  <div
                    class="w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black text-2xl font-semibold"
                    on:click={() => {
                      userAddress = inputAddress;
                      try {
                        mixpanel.track("recap_input_wallet", inputAddress);
                      } catch (error) {
                        console.log(error);
                      }

                      window.scrollTo({
                        top: 800,
                        left: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    View my Recap
                    <img src={Arrow} alt="" />
                  </div>
                </div>
                <div class="lg:text-base text-2xl mt-[-12px] text-black">
                  <div>1021+ users viewed their Solana Recap 2023</div>
                  <div class="mt-3">
                    Made with ❤️ from <img
                      src={SuperteamLogo}
                      width="24"
                      height="24"
                      class="rounded-full"
                    /> Superteam Vietnam
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="text-black font-normal lg:text-base text-2xl">
                2023 has proven to be a challenging year for every holder, but
                we've managed to weather the storm and emerge from the bottom.
                This resilience is a significant achievement, and now let's
                reflect on the moments we've overcome together.
              </div>

              <div class="flex justify-center gap-10 py-10 px-16">
                <div class="relative">
                  <div class="absolute top-[-80px] left-[-160px]">
                    <img
                      src={SvgOne}
                      alt=""
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <CardNftRecap data={NFTOne} />
                </div>
                <div class="relative">
                  <div class="absolute bottom-[-130px] right-[-150px]">
                    <img
                      src={SvgTwo}
                      alt=""
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <CardNftRecap data={NFTTwo} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {#if userPublicAddressChain === "SOL" && userAddress}
      <div
        class="recap-container"
        id="recap-holding"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.add("recap-wrapper");
          }
        }}
      >
        <TokenHolding
          data={data?.tokens}
          summary={data?.mintNFT}
          loading={$query.isLoading}
        />
      </div>
      <div
        class="recap-container"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.add("recap-wrapper");
          }
        }}
      >
        <NftHolding data={data?.nfts} loading={$query.isLoading} />
      </div>
      <div
        class="recap-container"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.add("recap-wrapper");
          }
        }}
      >
        <Airdrop data={data?.airdrops} loading={$query.isLoading} />
      </div>
      <div
        class="recap-container"
        use:inview={{
          threshold: 0.1,
        }}
        on:inview_change={(event) => {
          const { inView, entry, scrollDirection, observer, node } =
            event.detail;
          if (inView) {
            document
              .getElementById("recap-wrapper")
              ?.classList.remove("recap-wrapper");
          }
        }}
      >
        <MintNft
          data={data?.mintNFT}
          on:connect={() => {
            openModal();
          }}
        />
      </div>
    {/if}
    <div
      class="no-snap"
      use:inview={{
        threshold: 0.1,
      }}
      on:inview_change={(event) => {
        const { inView, entry, scrollDirection, observer, node } = event.detail;
        if (inView) {
          document
            .getElementById("recap-wrapper")
            ?.classList.remove("recap-wrapper");
        }
      }}
    >
      <Promote />
    </div>
  </div>
</ErrorBoundary>

<WalletProvider
  localStorageKey="walletAdapter"
  {wallets}
  autoConnect
  onError={console.log}
/>

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

  :global(img) {
    display: inline-block;
  }

  :global(.recap-wrapper) {
    scroll-snap-type: y mandatory;
  }

  :global(#recap-wrapper) {
    position: relative;
    width: 100%;
    min-height: 100vh;
    scroll-behavior: smooth;
    overflow: auto;
  }

  :global(.recap-container) {
    width: 100%;
    min-height: 100vh;
    background-size: cover;
    scroll-snap-align: start;
  }
</style>
