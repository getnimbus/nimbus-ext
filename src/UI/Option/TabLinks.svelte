<script lang="ts">
  import { onMount } from "svelte";
  import { userPublicAddress, userSocialPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import { shorterAddress } from "~/utils";

  import Google from "../SocialLinks/Google.svelte";
  import Solana from "../MainWalletLinks/Solana.svelte";
  import Evm from "../MainWalletLinks/Evm.svelte";

  import EvmLogo from "~/assets/chains/evm.png";
  import SolanaLogo from "~/assets/chains/solana.png";
  import GoogleLogo from "~/assets/google.png";

  const MultipleLang = {
    title: i18n("optionsPage.links-page-title", "Link Settings"),
  };

  let uid = "";
  let dataUserSocialLogin: any = {};
  let socialData = [];
  let chain = "";

  const handleValidateAddress = async (address: string) => {
    const response = await nimbus.get(`/v2/address/${address}/validate`);
    chain = response?.data?.type;
  };

  onMount(() => {
    uid = localStorage.getItem("public_address");
  });

  $: {
    if (uid) {
      getLinkViaUid(uid);
      getLinkViaAddress(uid);
    }
  }

  const getLinkViaAddress = async (address: string) => {
    const response: any = await nimbus.get(`/accounts/link?address=${address}`);
    socialData = response?.data;
  };

  const getLinkViaUid = async (id: string) => {
    const response: any = await nimbus.get(`/accounts/link?id=${id}`);
    dataUserSocialLogin = response?.data[0] || {};
    if (dataUserSocialLogin?.publicAddress) {
      getLinkViaAddress(dataUserSocialLogin?.publicAddress);
      userSocialPublicAddress.update(
        (n) => (n = dataUserSocialLogin?.publicAddress)
      );
    }
  };

  $: {
    if (dataUserSocialLogin && dataUserSocialLogin?.publicAddress) {
      handleValidateAddress(dataUserSocialLogin?.publicAddress);
    } else {
      handleValidateAddress($userPublicAddress);
    }
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
    <div class="xl:title-3 title-1">
      {MultipleLang.title}
    </div>
    <div class="xl:text-base text-xl text-gray-500">
      Management your main wallet or social accounts
    </div>
  </div>

  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-2xl font-medium">
        Link your social accounts
      </div>

      {#if localStorage.getItem("auth_token")}
        {#if dataUserSocialLogin && Object.keys(dataUserSocialLogin).length !== 0}
          <Google
            data={dataUserSocialLogin}
            isDisabledRemove={dataUserSocialLogin?.type === "google"}
            reCallAPI={() => {
              getLinkViaAddress($userPublicAddress);
            }}
          />
        {:else}
          <div class="flex flex-col gap-3">
            {#each socialData as item}
              {#if localStorage.getItem("socialAuthType") === "google"}
                <Google
                  data={item}
                  isDisabledRemove
                  reCallAPI={() => {
                    getLinkViaAddress($userPublicAddress);
                  }}
                />
              {/if}
            {/each}
          </div>
        {/if}
      {:else}
        <div class="flex flex-col gap-3">
          {#if socialData && socialData.length !== 0}
            {#each socialData as item}
              {#if item.type === "google"}
                <Google
                  data={item}
                  reCallAPI={() => {
                    getLinkViaAddress($userPublicAddress);
                  }}
                />
              {/if}
            {/each}
          {:else}
            <div>
              {#if localStorage.getItem("evm_token") || localStorage.getItem("solana_token")}
                <Google
                  data={{}}
                  reCallAPI={() => {
                    getLinkViaAddress($userPublicAddress);
                  }}
                />
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if dataUserSocialLogin && Object.keys(dataUserSocialLogin).length !== 0 && localStorage.getItem("auth_token")}
      <div class="flex flex-col gap-2">
        {#if !dataUserSocialLogin?.publicAddress}
          <div class="xl:text-base text-2xl font-medium">
            Connect your main wallet
          </div>
          <div class="flex flex-col gap-3">
            <Evm
              data={dataUserSocialLogin}
              reCallAPI={() => {
                dataUserSocialLogin = {};
                getLinkViaUid(uid);
                getLinkViaAddress($userPublicAddress);
              }}
            />
            <Solana
              data={dataUserSocialLogin}
              reCallAPI={() => {
                dataUserSocialLogin = {};
                getLinkViaUid(uid);
                getLinkViaAddress($userPublicAddress);
              }}
            />
          </div>
        {:else}
          <div class="xl:text-base text-2xl font-medium">
            Your main wallet address
          </div>
          <div class="xl:text-lg text-3xl flex items-center gap-3">
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
            {dataUserSocialLogin?.publicAddress}
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        <div class="xl:text-base text-2xl font-medium">
          Your main wallet address
        </div>
        <div class="xl:text-lg text-3xl flex items-center gap-3">
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
