<script lang="ts">
  import { onMount } from "svelte";
  import { userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";
  import { shorterAddress } from "~/utils";
  import mixpanel from "mixpanel-browser";
  import { createQuery } from "@tanstack/svelte-query";
  import { handleValidateAddress } from "~/lib/queryAPI";

  import Google from "./TabLinks/SocialLinks/Google.svelte";
  import Twitter from "./TabLinks/SocialLinks/Twitter.svelte";
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
      data = $queryLinkSocial?.data?.data;
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

  const handleFormatDataWithoutSocial = async (data) => {
    userLinkWalletData = await Promise.all(
      data?.map(async (item) => {
        const validateAddress = await handleValidateAddress(item?.uid);
        return {
          ...item,
          chain: validateAddress.type,
        };
      })
    );
  };

  $: {
    if (data && data.length !== 0) {
      handleFormatDataWithoutSocial(
        data?.filter(
          (item) => item.type !== "twitter" && item.type !== "google"
        )
      );
    }
  }
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
      <div class="flex md:flex-row flex-col items-center gap-6">
        {#each data?.filter((item) => item.type === "twitter" || item.type === "google") as item}
          {#if item.type === "google"}
            <Google data={item} />
          {/if}
          {#if item.type === "twitter"}
            <Twitter data={item} />
          {/if}
        {/each}

        {#if data && data.length === 1 && data.find((item) => item.type === "google")}
          <Twitter data={{}} />
        {/if}

        {#if data && data.length === 1 && data.find((item) => item.type === "twitter")}
          <Google data={{}} />
        {/if}

        {#if data && data.length === 0}
          <Google data={{}} />
          <Twitter data={{}} />
        {/if}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-xl font-medium">
        Your main wallet address
      </div>

      <div class="flex flex-col gap-4">
        {#if chain === ""}
          <Solana
            data={dataUserSocial}
            isPrimaryLogin={dataUserSocial.isPrimaryLogin}
          />

          <Evm
            data={dataUserSocial}
            isPrimaryLogin={dataUserSocial.isPrimaryLogin}
          />

          <Ton
            data={dataUserSocial}
            isPrimaryLogin={dataUserSocial.isPrimaryLogin}
          />

          <Sui
            data={dataUserSocial}
            isPrimaryLogin={dataUserSocial.isPrimaryLogin}
          />
        {/if}

        {#if chain === "EVM"}
          <div class="xl:text-lg text-2xl flex items-center gap-3">
            <img
              src={EvmLogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
            {shorterAddress($userPublicAddress)}
          </div>

          {#if userLinkWalletData.find((item) => item.chain === "SOL")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SolanaLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "SOL")?.uid
              )}
            </div>
          {:else}
            <Solana
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "TON")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SolanaLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "TON")?.uid
              )}
            </div>
          {:else}
            <Ton
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "MOVE")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SUILogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "MOVE")?.uid
              )}
            </div>
          {:else}
            <Sui
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}

        {#if chain === "SOL"}
          <div class="xl:text-lg text-2xl flex items-center gap-3">
            <img
              src={SolanaLogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
            {shorterAddress($userPublicAddress)}
          </div>

          {#if userLinkWalletData.find((item) => item.chain === "EVM")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SUILogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "EVM")?.uid
              )}
            </div>
          {:else}
            <Evm
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "TON")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SolanaLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "TON")?.uid
              )}
            </div>
          {:else}
            <Ton
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "MOVE")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SUILogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "MOVE")?.uid
              )}
            </div>
          {:else}
            <Sui
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}

        {#if chain === "MOVE"}
          <div class="xl:text-lg text-2xl flex items-center gap-3">
            <img
              src={SUILogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
            {shorterAddress($userPublicAddress)}
          </div>

          {#if userLinkWalletData.find((item) => item.chain === "EVM")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SUILogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "EVM")?.uid
              )}
            </div>
          {:else}
            <Evm
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "SOL")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SolanaLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "SOL")?.uid
              )}
            </div>
          {:else}
            <Solana
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "TON")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SolanaLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "TON")?.uid
              )}
            </div>
          {:else}
            <Ton
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}
        {/if}

        {#if chain === "TON"}
          <div class="xl:text-lg text-2xl flex items-center gap-3">
            <img
              src={TonLogo}
              alt=""
              width="28"
              height="28"
              class="rounded-full"
            />
            {shorterAddress($userPublicAddress)}
          </div>

          {#if userLinkWalletData.find((item) => item.chain === "EVM")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SUILogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "EVM")?.uid
              )}
            </div>
          {:else}
            <Evm
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "SOL")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SolanaLogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "SOL")?.uid
              )}
            </div>
          {:else}
            <Solana
              data={dataUserSocial}
              isPrimaryLogin={dataUserSocial.isPrimaryLogin}
            />
          {/if}

          {#if userLinkWalletData.find((item) => item.chain === "MOVE")}
            <div class="xl:text-lg text-2xl flex items-center gap-3">
              <img
                src={SUILogo}
                alt=""
                width="28"
                height="28"
                class="rounded-full"
              />
              {shorterAddress(
                userLinkWalletData.find((item) => item.chain === "MOVE")?.uid
              )}
            </div>
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
