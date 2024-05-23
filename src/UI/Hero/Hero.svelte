<script lang="ts">
  import { navigateTo } from "svelte-router-spa";
  import mixpanel from "mixpanel-browser";
  import * as browser from "webextension-polyfill";
  import {
    tab,
    chain,
    isDarkMode,
    triggerConnectWallet,
    triggerSync,
    typeWallet,
    wallet,
    user,
    triggerModalAddAddress,
  } from "~/store";
  import { triggerDrivePortfolio } from "~/utils/functions";
  import { bigGeneration, otherGeneration } from "~/lib/chains";
  import { i18n } from "~/lib/i18n";
  import { handleValidateAddress } from "~/lib/queryAPI";

  import Button from "~/components/Button.svelte";

  import Plus from "~/assets/plus.svg";
  import checkMark from "~/assets/check.svg";
  import heroImage from "~/assets/recap/hero/heroimage.png";

  const MultipleLang = {
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Wallet"
      ),
    },
  };

  let search = "";

  const handleSearch = (event) => {
    search = event.target.value;
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

      search = "";
    }
  };
</script>

<div class="flex xl:flex-row flex-col xl:gap-0 gap-10">
  <div
    class="xl:order-1 order-2 xl:flex-[0.7] flex-1 flex flex-col items-start gap-6"
  >
    <div class="flex flex-col gap-4">
      <div class="font-bold text-4xl">Your Personalized portfolio</div>
      <div class="flex flex-col xl:gap-2 gap-4">
        <div class="xl:text-lg text-xl">
          Track your Web3 investment across 60+ chains and CEX in one single
          place
        </div>
        <div class="grid grid-cols-2 grid-rows-2 xl:text-base text-lg">
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
        <Button
          variant="tertiary"
          on:click={() => {
            triggerModalAddAddress.update((n) => (n = true));
          }}
        >
          <img src={Plus} alt="" class="w-3 h-3" />
          <div class="text-white">
            {MultipleLang.content.btn_text}
          </div>
        </Button>
      </div>
    {:else}
      <div class="flex flex-col justify-center items-start gap-5 w-full">
        <div class="w-full flex flex-col items-start xl:gap-1 gap-2">
          <div class="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Type your wallet to see demo"
              autofocus
              on:change={(event) => {
                handleSearch(event);
              }}
              on:keydown={(event) => {
                if (
                  search &&
                  search?.length !== 0 &&
                  (event.which == 13 || event.keyCode == 13)
                ) {
                  handleSearchAddress(search);
                }
              }}
              bind:value={search}
              class={`xl:px-5 xl:py-3 px-6 py-4 border border-gray-300 focus:ring-0 xl:text-sm text-base font-normal rounded-xl w-full ${
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
            class="hover:underline text-[#1E96FC] xl:text-base text-lg cursor-pointer"
            on:click={() => {
              mixpanel.track("user_search");
              chain.update((n) => (n = "ALL"));
              wallet.update(
                (n) => (n = "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0")
              );
              typeWallet.update((n) => (n = "EVM"));
              navigateTo(
                `/?type=EVM&chain=ALL&address=0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0`
              );
              triggerDrivePortfolio?.destroy();
            }}
          >
            or try Demo account
          </div>
        </div>

        <div class="w-full flex gap-4 justify-start">
          <div class="w-max">
            <Button
              on:click={() => {
                triggerConnectWallet.update((n) => (n = true));
                triggerDrivePortfolio?.destroy();
              }}
            >
              Connect Wallet
            </Button>
          </div>
          <div class="xl:hidden block w-max">
            <Button
              on:click={() => {
                triggerSync.update((n) => (n = true));
                triggerDrivePortfolio?.destroy();
              }}
              variant="secondary"
            >
              Sync from Desktop
            </Button>
          </div>
        </div>
      </div>
    {/if}

    <div class="flex items-center gap-3">
      <div class="text-base">Community</div>
      <a
        target="_blank"
        href="https://discord.gg/u5b9dTrSTr"
        aria-label="Learn more about GetNimbus"
      >
        <img
          alt="link Discord"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          style="color:transparent"
          src="https://getnimbus.io/logoSocialMedia/discord.svg"
          class="w-[30px] h-[30px]"
        />
      </a>
      <a
        target="_blank"
        href="https://t.me/getnimbus"
        aria-label="Learn more about GetNimbus"
      >
        <img
          alt="link Telegram"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          style="color:transparent"
          src="https://getnimbus.io/logoSocialMedia/telegram.svg"
          class="w-[30px] h-[30px]"
        />
      </a>
      <a
        target="_blank"
        href="https://twitter.com/get_nimbus"
        aria-label="Learn more about GetNimbus"
      >
        <img
          alt="link Twitter"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          style="color:transparent"
          src="https://getnimbus.io/logoSocialMedia/twitterX1.svg"
          class="w-[26px] h-[26px]"
        />
      </a>
    </div>
  </div>

  <div class="xl:order-2 order-1 flex-1 xl:ml-0 -ml-5">
    <img
      src={heroImage}
      alt=""
      loading="lazy"
      decoding="async"
      sizes="(max-width: 320px) 280px, 
                (max-width: 640px) 640px, 
                960px"
      class="object-cover w-full h-full"
    />
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
