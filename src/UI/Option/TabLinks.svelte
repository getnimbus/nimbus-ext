<script lang="ts">
  import { onMount } from "svelte";
  import { userPublicAddress, userSocialPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import { shorterAddress } from "~/utils";
  import mixpanel from "mixpanel-browser";

  import Google from "../SocialLinks/Google.svelte";
  import Twitter from "../SocialLinks/Twitter.svelte";
  import Solana from "../MainWalletLinks/Solana.svelte";
  import Evm from "../MainWalletLinks/Evm.svelte";

  import EvmLogo from "~/assets/chains/evm.png";
  import SolanaLogo from "~/assets/chains/solana.png";

  const MultipleLang = {
    title: i18n("optionsPage.links-page-title", "Link Settings"),
  };

  let uid = "";
  let dataUserSocialLogin: any = {};
  let socialData = [];
  let chain = "";

  const handleValidateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      chain = response?.data?.type;
    } catch (e) {
      console.log("e: ", e);
    }
  };

  onMount(() => {
    uid = localStorage.getItem("public_address");
  });

  $: {
    if (uid) {
      getLinkData();
    }
  }

  const getLinkData = async () => {
    try {
      const response: any = await nimbus.get("/accounts/link");
      socialData = response?.data;
      if (
        response?.data &&
        response?.data[0] &&
        response?.data[0]?.publicAddress
      ) {
        dataUserSocialLogin = response?.data[0] || {};
        userSocialPublicAddress.update(
          (n) => (n = dataUserSocialLogin?.publicAddress)
        );
      }
    } catch (e) {
      console.log("e: ", e);
    }
  };

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
    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-xl font-medium">
        Link your social accounts
      </div>

      <!-- user social login -->
      {#if localStorage.getItem("auth_token")}
        <div class="flex flex-col gap-3">
          {#each socialData as item}
            {#if localStorage.getItem("socialAuthType") === "google"}
              <Google
                data={item}
                isDisabledRemove
                reCallAPI={() => {
                  getLinkData();
                }}
              />
            {/if}
            {#if localStorage.getItem("socialAuthType") === "twitter"}
              <Twitter
                data={item}
                isDisabledRemove
                reCallAPI={() => {
                  getLinkData();
                }}
              />
            {/if}
          {/each}
        </div>
      {/if}

      <!-- user connect wallet -->
      {#if !localStorage.getItem("auth_token")}
        <div class="flex flex-col gap-3">
          {#each socialData as item}
            {#if item.type === "google"}
              <Google
                data={item}
                reCallAPI={() => {
                  getLinkData();
                }}
              />
            {/if}
            {#if item.type === "twitter"}
              <Twitter
                data={item}
                reCallAPI={() => {
                  getLinkData();
                }}
              />
            {/if}
          {/each}
        </div>

        <div class="flex flex-col gap-3">
          {#if socialData && socialData.length === 1 && socialData.find((item) => item.type === "google")}
            <Twitter
              data={{}}
              reCallAPI={() => {
                getLinkData();
              }}
            />
          {/if}

          {#if socialData && socialData.length === 1 && socialData.find((item) => item.type === "twitter")}
            <Google
              data={{}}
              reCallAPI={() => {
                getLinkData();
              }}
            />
          {/if}
        </div>
      {/if}
    </div>

    {#if socialData && socialData.length !== 0 && socialData[0].publicAddress === null && localStorage.getItem("auth_token")}
      <div class="flex flex-col gap-2">
        <div class="xl:text-base text-xl font-medium">
          Connect your main wallet
        </div>
        <div class="flex flex-col gap-3">
          <Evm
            data={dataUserSocialLogin}
            reCallAPI={() => {
              dataUserSocialLogin = {};
              getLinkData();
            }}
          />
          <Solana
            data={dataUserSocialLogin}
            reCallAPI={() => {
              dataUserSocialLogin = {};
              getLinkData();
            }}
          />
        </div>
      </div>
    {:else}
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
          {shorterAddress($userPublicAddress)}
        </div>
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
