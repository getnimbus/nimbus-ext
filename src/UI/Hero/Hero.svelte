<script lang="ts">
  import { navigate } from "svelte-navigator";
  import mixpanel from "mixpanel-browser";
  import * as browser from "webextension-polyfill";
  import { nimbus } from "~/lib/network";
  import {
    tab,
    chain,
    isDarkMode,
    triggerConnectWallet,
    triggerSync,
    typeWallet,
    wallet,
    user,
  } from "~/store";
  import { drivePortfolio } from "~/utils";
  import { bigGeneration, otherGeneration } from "~/lib/chains";

  import Button from "~/components/Button.svelte";

  import Plus from "~/assets/plus.svg";
  import checkMark from "~/assets/check.svg";
  import heroImage from "~/assets/recap/hero/heroimage.png";

  export let handleOpenAddModal = () => {};
  export let btntext;

  let search = "";
  let timerDebounce;

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      search = value;
    }, 300);
  };

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return response?.data;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const handleSearchAddress = async (value: string) => {
    if (value) {
      mixpanel.track("user_search");
      const validateAccount = await handleValidateAddress(value);
      chain.update((n) => (n = "ALL"));
      wallet.update((n) => (n = validateAccount?.address));
      typeWallet.update((n) => (n = validateAccount?.type));

      browser.storage.sync.set({
        selectedWallet: validateAccount?.address,
      });
      browser.storage.sync.set({ selectedChain: "ALL" });
      browser.storage.sync.set({
        typeWalletAddress: validateAccount?.type,
      });

      if (bigGeneration.includes(validateAccount?.type)) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?tab=${$tab}&type=${validateAccount?.type}&chain=ALL&address=${validateAccount?.address}`
        );
      }

      if (otherGeneration.includes(validateAccount?.type)) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?tab=${$tab}&type=${validateAccount?.type}&address=${validateAccount?.address}`
        );
      }
    }
  };
</script>

<div class="flex xl:flex-row flex-col xl:gap-0 gap-10">
  <div
    class="xl:order-1 order-2 xl:flex-[0.7] flex-1 flex flex-col items-start gap-6"
  >
    <div class="flex flex-col gap-4">
      <div class="font-bold xl:text-5xl text-6xl">
        Your Personalized portfolio
      </div>
      <div class="flex flex-col xl:gap-2 gap-4">
        <div class="xl:text-lg text-3xl">
          Track your Web3 investment across 60+ chains and CEX in one single
          place
        </div>
        <div class="grid grid-cols-2 grid-rows-2 xl:text-base text-2xl">
          <div class="flex gap-1 items-center">
            <img src={checkMark} alt="" class="w-max h-max" /> Token & NFT
          </div>
          <div class="flex gap-1 items-center">
            <img src={checkMark} alt="" class="w-max h-max" /> Profit and Loss
          </div>
          <div class="flex gap-1 items-center">
            <img src={checkMark} alt="" class="w-max h-max" /> Risk Analysis
          </div>
          <div class="flex gap-1 items-center">
            <img src={checkMark} alt="" class="w-max h-max" /> Whales list
          </div>
        </div>
      </div>
    </div>

    {#if Object.keys($user).length !== 0}
      <div class="w-max">
        <Button variant="tertiary" on:click={handleOpenAddModal}>
          <img src={Plus} alt="" width="12" height="12" />
          <div class="text-2xl font-medium text-white xl:text-base">
            {btntext}
          </div>
        </Button>
      </div>
    {:else}
      <div class="flex flex-col justify-center items-start gap-5 w-full">
        <div class="w-full flex flex-col items-start xl:gap-1 gap-2">
          <div class="relative flex-1 w-full">
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Type your wallet to see demo"
              on:keyup={({ target: { value } }) => debounceSearch(value)}
              on:keydown={(event) => {
                if (
                  search &&
                  search?.length !== 0 &&
                  (event.which == 13 || event.keyCode == 13)
                ) {
                  handleSearchAddress(search);
                }
              }}
              autofocus
              value={search}
              class={`xl:px-5 xl:py-3 px-6 py-4 border border-gray-300 focus:ring-0 xl:text-sm text-lg font-normal rounded-xl w-full ${
                !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
              } ${
                $isDarkMode
                  ? "text-white"
                  : "text-[#5E656B] placeholder-[#5E656B]"
              }`}
            />
            {#if search.length !== 0}
              <div
                class="absolute h-full w-10 top-0 right-0 z-10 flex justify-center items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                >
                  <path
                    fill="currentColor"
                    d="M8.293 2.293a1 1 0 0 1 1.414 0l4.5 4.5a1 1 0 0 1 0 1.414l-4.5 4.5a1 1 0 0 1-1.414-1.414L11 8.5H1.5a1 1 0 0 1 0-2H11L8.293 3.707a1 1 0 0 1 0-1.414"
                  />
                </svg>
              </div>
            {/if}
          </div>

          <div
            class="hover:underline text-[#1E96FC] xl:text-base text-2xl cursor-pointer"
            on:click={() => {
              mixpanel.track("user_search");
              chain.update((n) => (n = "ALL"));
              wallet.update(
                (n) => (n = "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0")
              );
              typeWallet.update((n) => (n = "EVM"));
              navigate(
                `/?type=EVM&chain=ALL&address=0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0`
              );
              drivePortfolio.destroy();
            }}
          >
            or try Demo account
          </div>
        </div>

        <div class="w-full flex justify-start">
          <div class="xl:block hidden">
            <Button
              on:click={() => {
                triggerConnectWallet.update((n) => (n = true));
                drivePortfolio.destroy();
              }}
            >
              <div class="text-2xl font-medium xl:text-base">
                Connect Wallet
              </div>
            </Button>
          </div>

          <div class="xl:hidden block">
            <Button
              on:click={() => {
                triggerSync.update((n) => (n = true));
                drivePortfolio.destroy();
              }}
            >
              <div class="text-2xl font-medium xl:text-base">
                Sync from Desktop
              </div>
            </Button>
          </div>
        </div>
      </div>
    {/if}

    <div class="flex items-center xl:gap-3 gap-6">
      <div class="xl:text-base text-lg">Community</div>
      <a target="_blank" href="https://discord.gg/u5b9dTrSTr">
        <img
          alt="link Discord"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          style="color:transparent"
          src="https://getnimbus.io/logoSocialMedia/discord.svg"
          class="xl:w-[30px] xl:h-[30px] w-[40px] h-[40px]"
        />
      </a>
      <a target="_blank" href="https://t.me/getnimbus">
        <img
          alt="link Telegram"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          style="color:transparent"
          src="https://getnimbus.io/logoSocialMedia/telegram.svg"
          class="xl:w-[30px] xl:h-[30px] w-[40px] h-[40px]"
        />
      </a>
      <a target="_blank" href="https://twitter.com/get_nimbus">
        <img
          alt="link Twitter"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          style="color:transparent"
          src="https://getnimbus.io/logoSocialMedia/twitterX1.svg"
          class="xl:w-[26px] xl:h-[26px] w-[36px] h-[36px]"
        />
      </a>
    </div>
  </div>

  <div class="xl:order-2 order-1 flex-1">
    <img src={heroImage} alt="" class="object-cover w-full h-full" />
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
