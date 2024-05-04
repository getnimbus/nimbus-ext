<script lang="ts">
  import { onMount } from "svelte";
  import { userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import { shorterAddress } from "~/utils";
  import mixpanel from "mixpanel-browser";
  import { createQuery } from "@tanstack/svelte-query";
  import { handleValidateAddress } from "~/lib/queryAPI";

  import Google from "../SocialLinks/Google.svelte";
  import Twitter from "../SocialLinks/Twitter.svelte";
  import Solana from "../MainWalletLinks/Solana.svelte";
  import Evm from "../MainWalletLinks/Evm.svelte";
  import Ton from "../MainWalletLinks/Ton.svelte";
  import Sui from "../MainWalletLinks/Sui.svelte";

  import EvmLogo from "~/assets/chains/evm.png";
  import SolanaLogo from "~/assets/chains/solana.png";
  import SUILogo from "~/assets/chains/sui.png";
  import TonLogo from "~/assets/chains/ton.png";

  const MultipleLang = {
    title: i18n("optionsPage.links-page-title", "Link Settings"),
  };

  let dataUserSocialLogin: any = {};
  let socialData = [];
  let chain = "";

  $: queryLinkSocial = createQuery({
    queryKey: ["link-socials"],
    queryFn: () => getLinkData(),
    staleTime: Infinity,
    retry: false,
  });

  const getLinkData = async () => {
    const response: any = await nimbus.get("/accounts/link");
    return response;
  };

  $: {
    if (!$queryLinkSocial.isError && $queryLinkSocial.data !== undefined) {
      socialData = $queryLinkSocial?.data?.data;
      if (
        $queryLinkSocial?.data?.data &&
        $queryLinkSocial?.data?.data[0] &&
        $queryLinkSocial?.data?.data[0]?.uid
      ) {
        dataUserSocialLogin = $queryLinkSocial?.data?.data[0] || {};
        handleCheckChain(dataUserSocialLogin?.publicAddress);
      }
    }
  }

  const handleCheckChain = async (address) => {
    try {
      const response = await handleValidateAddress(address);
      chain = response?.type;
    } catch (e) {
      console.log("e");
      chain = "";
    }
  };

  $: {
    if ($userPublicAddress && Object.keys(userPublicAddress).length === 0) {
      handleCheckChain($userPublicAddress);
    }
  }

  onMount(() => {
    mixpanel.track("accounts_page");
  });
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
    <!-- user social login -->
    {#if localStorage.getItem("auth_token")}
      <div class="flex flex-col gap-2">
        <div class="xl:text-base text-xl font-medium">
          Link your social accounts
        </div>
        <div class="flex md:flex-row flex-col items-center gap-6">
          {#each socialData as item}
            {#if localStorage.getItem("socialAuthType") === "google"}
              <Google data={item} isDisabledRemove />
            {/if}
            {#if localStorage.getItem("socialAuthType") === "twitter"}
              <Twitter data={item} isDisabledRemove />
            {/if}
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="xl:text-base text-xl font-medium">
          Connect your main wallet
        </div>

        {#if dataUserSocialLogin && dataUserSocialLogin.publicAddress}
          <div class="xl:text-lg text-2xl flex items-center gap-3">
            {#if chain === "EVM"}
              <img
                src={EvmLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
            {/if}
            {#if chain === "SOL"}
              <img
                src={SolanaLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
            {/if}
            {#if chain === "MOVE"}
              <img
                src={SUILogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
            {/if}
            {#if chain === "TON"}
              <img
                src={TonLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
            {/if}
            {shorterAddress(dataUserSocialLogin?.publicAddress)}
          </div>
        {:else}
          <div class="flex flex-col gap-3">
            <Evm
              data={dataUserSocialLogin}
              reCallAPI={() => {
                dataUserSocialLogin = {};
              }}
            />
            <Solana
              data={dataUserSocialLogin}
              reCallAPI={() => {
                dataUserSocialLogin = {};
              }}
            />
            <Ton
              data={dataUserSocialLogin}
              reCallAPI={() => {
                dataUserSocialLogin = {};
              }}
            />
            <Sui
              data={dataUserSocialLogin}
              reCallAPI={() => {
                dataUserSocialLogin = {};
              }}
            />
          </div>
        {/if}
      </div>
    {/if}

    <!-- user connect wallet -->
    {#if !localStorage.getItem("auth_token")}
      <div class="flex flex-col gap-2">
        <div class="xl:text-base text-xl font-medium">
          Link your social accounts
        </div>
        <div class="flex md:flex-row flex-col items-center gap-6">
          {#each socialData as item}
            {#if item.type === "google"}
              <Google data={item} />
            {/if}
            {#if item.type === "twitter"}
              <Twitter data={item} />
            {/if}
          {/each}

          {#if socialData && socialData.length === 1 && socialData.find((item) => item.type === "google")}
            <Twitter data={{}} />
          {/if}

          {#if socialData && socialData.length === 1 && socialData.find((item) => item.type === "twitter")}
            <Google data={{}} />
          {/if}

          {#if socialData && socialData.length === 0}
            <Google data={{}} />
            <Twitter data={{}} />
          {/if}
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="xl:text-base text-xl font-medium">
          Your main wallet address
        </div>
        <div class="xl:text-lg text-2xl flex items-center gap-3">
          {#if chain === "EVM"}
            <img
              src={EvmLogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
          {/if}
          {#if chain === "SOL"}
            <img
              src={SolanaLogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
          {/if}
          {#if chain === "MOVE"}
            <img
              src={SUILogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
          {/if}
          {#if chain === "TON"}
            <img
              src={TonLogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
          {/if}
          {shorterAddress($userPublicAddress)}
        </div>
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
