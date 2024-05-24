<script lang="ts">
  import { onMount } from "svelte";
  import { userPublicAddress } from "~/store";
  import { i18n } from "~/lib/i18n";
  import mixpanel from "mixpanel-browser";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    getLinkData,
    getUserInfo,
    handleValidateAddress,
  } from "~/lib/queryAPI";

  import ConnectedBtn from "./TabLinks/MainWalletLinks/ConnectedBtn.svelte";
  import Google from "./TabLinks/SocialLinks/Google.svelte";
  import Twitter from "./TabLinks/SocialLinks/Twitter.svelte";
  import Discord from "./TabLinks/SocialLinks/Discord.svelte";
  import Telegram from "./TabLinks/SocialLinks/Telegram.svelte";
  import Evm from "./TabLinks/MainWalletLinks/Evm.svelte";
  import Solana from "./TabLinks/MainWalletLinks/Solana.svelte";
  import Sui from "./TabLinks/MainWalletLinks/Sui.svelte";
  import Ton from "./TabLinks/MainWalletLinks/Ton.svelte";

  import EvmLogo from "~/assets/chains/evm.png";
  import SolanaLogo from "~/assets/chains/solana.png";
  import SUILogo from "~/assets/chains/sui.png";
  import TonLogo from "~/assets/chains/ton.png";

  const MultipleLang = {
    title: i18n("optionsPage.links-page-title", "Link Settings"),
  };

  let dataUserSocial: any = {};
  let data = [];
  let chain = "";
  let userLinkWalletData = [];

  const handleCheckChain = async (address) => {
    if (!address) {
      chain = "";
      return;
    }
    try {
      const response = await handleValidateAddress(address);
      chain = response?.type;
    } catch (e) {
      console.log("e");
      chain = "";
    }
  };

  $: queryLinkSocial = createQuery({
    queryKey: ["link-socials"],
    queryFn: () => getLinkData(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryLinkSocial.isError &&
      $queryLinkSocial.data !== undefined &&
      queryLinkSocial?.data?.data?.length !== 0
    ) {
      data = $queryLinkSocial?.data?.data;
      userLinkWalletData = $queryLinkSocial?.data?.data?.filter(
        (item) =>
          item.type !== "twitter" &&
          item.type !== "google" &&
          item.type !== "discord" &&
          item.type !== "telegram"
      );
      if (
        $queryLinkSocial?.data?.data &&
        $queryLinkSocial?.data?.data[0] &&
        $queryLinkSocial?.data?.data[0]?.uid
      ) {
        dataUserSocial = $queryLinkSocial?.data?.data[0] || {};
        handleCheckChain(dataUserSocial?.publicAddress);
      }
    }
  }

  $: {
    if ($userPublicAddress && Object.keys($userPublicAddress)?.length !== 0) {
      handleCheckChain($userPublicAddress);
    }
  }

  onMount(() => {
    mixpanel.track("accounts_page");
  });

  let selectedDisplayName = "";

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryUserInfo.isError &&
      $queryUserInfo &&
      $queryUserInfo.data !== undefined
    ) {
      selectedDisplayName = $queryUserInfo.data.displayName;
    }
  }

  const handleUpdateSelectedDisplayName = (name) => {
    selectedDisplayName = name;
  };

  $: dataSocials =
    data?.filter(
      (item) =>
        item.type === "twitter" ||
        item.type === "google" ||
        item.type === "discord" ||
        item.type === "telegram"
    ) || [];
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
    <div class="xl:title-3 title-2">
      {MultipleLang.title}
    </div>
    <div class="xl:text-base text-lg text-gray-500">
      Management your main wallet or social accounts
    </div>
  </div>

  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-xl font-medium">
        Link your social accounts
      </div>
      <div class="flex flex-wrap items-center gap-6">
        {#each dataSocials as item}
          {#if item.type === "google"}
            <Google
              data={item}
              {selectedDisplayName}
              {handleUpdateSelectedDisplayName}
            />
          {/if}
          {#if item.type === "discord"}
            <Discord
              data={item}
              {selectedDisplayName}
              {handleUpdateSelectedDisplayName}
            />
          {/if}
          {#if item.type === "twitter"}
            <Twitter
              data={item}
              {selectedDisplayName}
              {handleUpdateSelectedDisplayName}
            />
          {/if}
          {#if item.type === "telegram"}
            <Telegram
              data={item}
              {selectedDisplayName}
              {handleUpdateSelectedDisplayName}
            />
          {/if}
        {/each}

        {#if dataSocials && dataSocials?.length === 0}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 1 && dataSocials?.find((item) => item.type === "google")}
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 1 && dataSocials?.find((item) => item.type === "discord")}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 1 && dataSocials?.find((item) => item.type === "twitter")}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 1 && dataSocials?.find((item) => item.type === "telegram")}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
        {/if}

        {#if dataSocials && dataSocials?.length === 2 && dataSocials?.find((item) => item.type === "discord") && dataSocials?.find((item) => item.type === "google")}
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 2 && dataSocials?.find((item) => item.type === "discord") && dataSocials?.find((item) => item.type === "twitter")}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 2 && dataSocials?.find((item) => item.type === "discord") && dataSocials?.find((item) => item.type === "telegram")}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
        {/if}

        {#if dataSocials && dataSocials?.length === 2 && dataSocials?.find((item) => item.type === "google") && dataSocials?.find((item) => item.type === "twitter")}
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 2 && dataSocials?.find((item) => item.type === "google") && dataSocials?.find((item) => item.type === "telegram")}
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
        {/if}

        {#if dataSocials && dataSocials?.length === 2 && dataSocials?.find((item) => item.type === "twitter") && dataSocials?.find((item) => item.type === "telegram")}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 3 && dataSocials?.find((item) => item.type === "discord") && dataSocials?.find((item) => item.type === "twitter") && dataSocials?.find((item) => item.type === "telegram")}
          <Google
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 3 && dataSocials?.find((item) => item.type === "google") && dataSocials?.find((item) => item.type === "twitter") && dataSocials?.find((item) => item.type === "telegram")}
          <Discord
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}

        {#if dataSocials && dataSocials?.length === 3 && dataSocials?.find((item) => item.type === "discord") && dataSocials?.find((item) => item.type === "google") && dataSocials?.find((item) => item.type === "telegram")}
          <!-- <Twitter
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          /> -->
        {/if}

        {#if dataSocials && dataSocials?.length === 3 && dataSocials?.find((item) => item.type === "discord") && dataSocials?.find((item) => item.type === "google") && dataSocials?.find((item) => item.type === "twitter")}
          <Telegram
            data={{}}
            {selectedDisplayName}
            {handleUpdateSelectedDisplayName}
          />
        {/if}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-xl font-medium">
        Your main wallet address
      </div>

      <div class="flex flex-col gap-4">
        {#if chain === ""}
          {#if userLinkWalletData?.find((item) => item.chain === "EVM")}
            <ConnectedBtn
              logo={EvmLogo}
              address={userLinkWalletData?.find((item) => item.chain === "EVM")
                ?.uid}
            />
          {:else}
            <Evm
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "SOL")}
            <ConnectedBtn
              logo={SolanaLogo}
              address={userLinkWalletData?.find((item) => item.chain === "SOL")
                ?.uid}
            />
          {:else}
            <Solana
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "TON")}
            <ConnectedBtn
              logo={TonLogo}
              address={userLinkWalletData?.find((item) => item.chain === "TON")
                ?.uid}
            />
          {:else}
            <Ton
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "MOVE")}
            <ConnectedBtn
              logo={SUILogo}
              address={userLinkWalletData?.find((item) => item.chain === "MOVE")
                ?.uid}
            />
          {:else}
            <Sui
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}

        {#if chain === "EVM"}
          <ConnectedBtn logo={EvmLogo} address={$userPublicAddress} />

          {#if userLinkWalletData?.find((item) => item.chain === "SOL")}
            <ConnectedBtn
              logo={SolanaLogo}
              address={userLinkWalletData?.find((item) => item.chain === "SOL")
                ?.uid}
            />
          {:else}
            <Solana
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "TON")}
            <ConnectedBtn
              logo={TonLogo}
              address={userLinkWalletData?.find((item) => item.chain === "TON")
                ?.uid}
            />
          {:else}
            <Ton
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "MOVE")}
            <ConnectedBtn
              logo={SUILogo}
              address={userLinkWalletData?.find((item) => item.chain === "MOVE")
                ?.uid}
            />
          {:else}
            <Sui
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}

        {#if chain === "SOL"}
          <ConnectedBtn logo={SolanaLogo} address={$userPublicAddress} />

          {#if userLinkWalletData?.find((item) => item.chain === "EVM")}
            <ConnectedBtn
              logo={EvmLogo}
              address={userLinkWalletData?.find((item) => item.chain === "EVM")
                ?.uid}
            />
          {:else}
            <Evm
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "TON")}
            <ConnectedBtn
              logo={TonLogo}
              address={userLinkWalletData?.find((item) => item.chain === "TON")
                ?.uid}
            />
          {:else}
            <Ton
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "MOVE")}
            <ConnectedBtn
              logo={SUILogo}
              address={userLinkWalletData?.find((item) => item.chain === "MOVE")
                ?.uid}
            />
          {:else}
            <Sui
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}

        {#if chain === "MOVE"}
          <ConnectedBtn logo={SUILogo} address={$userPublicAddress} />

          {#if userLinkWalletData?.find((item) => item.chain === "EVM")}
            <ConnectedBtn
              logo={EvmLogo}
              address={userLinkWalletData?.find((item) => item.chain === "EVM")
                ?.uid}
            />
          {:else}
            <Evm
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "SOL")}
            <ConnectedBtn
              logo={SolanaLogo}
              address={userLinkWalletData?.find((item) => item.chain === "SOL")
                ?.uid}
            />
          {:else}
            <Solana
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "TON")}
            <ConnectedBtn
              logo={TonLogo}
              address={userLinkWalletData?.find((item) => item.chain === "TON")
                ?.uid}
            />
          {:else}
            <Ton
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}

        {#if chain === "TON"}
          <ConnectedBtn logo={TonLogo} address={$userPublicAddress} />

          {#if userLinkWalletData?.find((item) => item.chain === "EVM")}
            <ConnectedBtn
              logo={EvmLogo}
              address={userLinkWalletData?.find((item) => item.chain === "EVM")
                ?.uid}
            />
          {:else}
            <Evm
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "SOL")}
            <ConnectedBtn
              logo={SolanaLogo}
              address={userLinkWalletData?.find((item) => item.chain === "SOL")
                ?.uid}
            />
          {:else}
            <Solana
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData?.find((item) => item.chain === "MOVE")}
            <ConnectedBtn
              logo={SUILogo}
              address={userLinkWalletData?.find((item) => item.chain === "MOVE")
                ?.uid}
            />
          {:else}
            <Sui
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
