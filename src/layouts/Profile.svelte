<script lang="ts">
  import { onMount } from "svelte";
  import { shorterAddress, clickOutside } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { wallet, user, isDarkMode, typeWallet, userId } from "~/store";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { flatMap } from "lodash";

  import InviterQr from "~/UI/Profile/InviterQR.svelte";
  import Summary from "~/UI/Profile/Summary.svelte";
  import SocialMedia from "~/UI/Profile/SocialMedia.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import TradingStats from "~/UI/Profile/TradingStats.svelte";
  import Button from "~/components/Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import User from "~/assets/user.png";
  import UpArrow from "~/assets/up-arrow.svg";

  let userID = "";
  userId.subscribe((value) => {
    userID = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  let userProfile = {};
  let dataNftHighlight = {};
  let dataNftHolding = [];
  let listAddress = [];
  let showPopover = false;
  let isEdit = false;
  let isLoadingSaveProfile = false;
  let isOpenModalSelectNFT = false;

  let userIdParams = "";
  let selectedAddress = "";
  let description = "What's on your mind?";
  let selectProfileNFT = {};
  let socialDataTwitter = {
    label: "Twitter",
    username: "",
  };
  let socialDataTelegram = {
    label: "Telegram",
    username: "",
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let idParams = urlParams.get("id");
    if (idParams) {
      userIdParams = idParams;
      getUserProfile(idParams);
    }
  });

  const submitSocialData = (data) => {
    if (data.type === "Twitter") {
      socialDataTwitter = {
        label: data.label,
        username: data.username,
      };
    }
    if (data.type === "Telegram") {
      socialDataTelegram = {
        label: data.label,
        username: data.username,
      };
    }
  };

  const handleSubmitProfile = async () => {
    isLoadingSaveProfile = true;
    try {
      const payload = {
        intro: description,
        profileAddress: selectedAddress,
        social: {
          twitter: {
            id: socialDataTwitter.username,
            status: socialDataTwitter.label,
          },
          telegram: {
            id: socialDataTelegram.username,
            status: socialDataTelegram.label,
          },
        },
        highlightNft: {
          chain: selectProfileNFT?.chain,
          tokenId: selectProfileNFT?.tokenId?.toString(),
          contractAddress: selectProfileNFT?.contractAddress,
        },
      };

      await nimbus.put(`/users/${userIdParams}/profile`, payload);
      toastMsg = "Your profile updated successfully!";
      isSuccessToast = true;
    } catch (e) {
      console.error(e);
      toastMsg =
        "Something wrong when updating your profile. Please try again!";
      isSuccessToast = false;
    } finally {
      isLoadingSaveProfile = false;
      isEdit = false;
      trigger();
    }
  };

  const handleCancelEditProfile = () => {
    isEdit = false;

    selectedAddress =
      userProfile?.profileAddress || localStorage.getItem("evm_address");
    selectProfileNFT = dataNftHighlight;
    description = userProfile?.intro || "What's on your mind?";
    socialDataTelegram = {
      label: userProfile.social?.telegram?.status || "Telegram",
      username: userProfile.social?.telegram?.id || "",
    };
    socialDataTwitter = {
      label: userProfile.social?.twitter?.status || "Twitter",
      username: userProfile.social?.twitter?.id || "",
    };
  };

  const getUserProfile = async (id) => {
    try {
      const response: any = await nimbus.get(`/users/${id}/profile`);
      if (response?.status === 401) {
        throw new Error(response?.response?.error);
      }
      userProfile = response?.data;

      selectedAddress =
        userProfile?.profileAddress || localStorage.getItem("evm_address");
      description = userProfile?.intro || "What's on your mind?";
      socialDataTelegram = {
        label: userProfile.social?.telegram?.status || "Telegram",
        username: userProfile.social?.telegram?.id || "",
      };
      socialDataTwitter = {
        label: userProfile.social?.twitter?.status || "Twitter",
        username: userProfile.social?.twitter?.id || "",
      };
    } catch (e) {
      console.error(e);
    }
  };

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  const getHoldingNFT = async (address) => {
    const response = await nimbus
      .get(`/v2/address/${address}/nft-holding?chain=ALL`)
      .then((response) => response?.data);
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response;
  };

  const formatDataListAddress = (data) => {
    listAddress = data.map((item) => {
      return {
        id: item.id,
        type: item.type,
        label: item.label,
        value: item.type === "CEX" ? item.id : item.accountId,
      };
    });
  };

  const formatDataHoldingNFT = (data) => {
    const flattenData = flatMap(data, (item) => {
      return item.tokens.map((token) => ({
        ...item,
        ...token,
      }));
    });

    dataNftHolding = flattenData.map((item) => {
      return {
        chain: item?.collection?.chain || "",
        tokenId: item?.tokenId || "",
        contractAddress: item?.contractAddress || "",

        imageUrl:
          item?.imageUrl ||
          "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384",
        rarityScore: item?.rarityScore || 0,
        name: item?.name || "",
        collection: item?.collection || {},
        nativeToken: item?.nativeToken || {},
        marketPrice: item?.marketPrice || 0,
        floorPrice: item?.floorPrice || 0,
        price: item?.price || 0,
        cost: item?.cost || 0,
      };
    });
  };

  // query nft holding
  $: queryNftHolding = createQuery({
    queryKey: ["nft-holding", selectedAddress],
    queryFn: () => getHoldingNFT(selectedAddress),
    staleTime: Infinity,
    enabled:
      selectedAddress?.length !== 0 && Object.keys(userInfo).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (!$queryNftHolding.isError && $queryNftHolding.data !== undefined) {
      formatDataHoldingNFT($queryNftHolding.data);
    }
  }

  // query list address
  $: query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    enabled: Object.keys(userInfo).length !== 0,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      $query.data.length !== 0
    ) {
      formatDataListAddress($query.data);
    }
  }

  $: {
    if (
      Object.keys(userProfile)?.length !== 0 &&
      userProfile?.highlightNft !== null &&
      Object.keys(userProfile?.highlightNft)?.length !== 0 &&
      dataNftHolding.length !== 0
    ) {
      dataNftHighlight =
        dataNftHolding.find(
          (item) =>
            item.contractAddress.toLowerCase() ===
            userProfile?.highlightNft.contractAddress.toLowerCase()
        ) || {};

      selectProfileNFT = dataNftHighlight;
    }
  }
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col justify-center gap-2">
      <div class="xl:text-5xl text-7xl font-semibold">My Profile</div>
      <div class="xl:text-xl text-3xl">
        One place that aggregates all your personal information
      </div>
    </div>

    <form
      on:submit|preventDefault={handleSubmitProfile}
      class="flex flex-col gap-4"
    >
      {#if Object.keys(userInfo).length !== 0 && userID === userIdParams}
        <div class="flex items-center justify-end lg:gap-2 gap-6">
          {#if isEdit}
            <div class="w-[120px]">
              <Button variant="secondary" on:click={handleCancelEditProfile}
                >Cancel</Button
              >
            </div>
            <div class="w-[120px]">
              <Button
                type="submit"
                isLoading={isLoadingSaveProfile}
                disabled={isLoadingSaveProfile}>Save</Button
              >
            </div>
          {:else}
            <div class="xl:w-[160px] w-[220px]">
              <Button on:click={() => (isEdit = true)}>Edit your profile</Button
              >
            </div>
          {/if}
        </div>
      {/if}

      <div
        class="w-full flex xl:flex-row flex-col rounded-xl py-10 px-10 gap-9 border-2 border_0000001a"
      >
        <div class="xl:w-[20%] w-full flex flex-col gap-5 items-center">
          <div class="flex flex-col gap-3 items-center justify-start">
            <div class="xl:w-[80px] xl:h-[80px] w-32 h-32">
              <img src={User} alt="" class="object-cover w-full h-full" />
            </div>

            <div
              class={`relative py-1 ${isEdit ? "button" : ""}`}
              on:click={() => {
                if (isEdit) {
                  showPopover = !showPopover;
                }
              }}
            >
              <div
                class={`text-2xl xl:text-base font-medium flex items-center gap-2 ${
                  darkMode || isEdit ? "text-white" : "text-black"
                }`}
              >
                {shorterAddress(selectedAddress)}
                {#if isEdit}
                  <img
                    src={UpArrow}
                    alt=""
                    class="transform rotate-180 xl:w-3 xl:h-3 w-5 h-5"
                    class:rotate-0={showPopover}
                  />
                {/if}
              </div>

              {#if showPopover}
                <div
                  class="select_content mt-2 absolute left-1/2 transform -translate-x-1/2 z-50 flex flex-col xl:gap-3 gap-6 px-3 xl:py-2 py-3 text-sm transform rounded-lg top-8 w-max xl:max-h-[300px] xl:max-h-[310px] max-h-[380px]"
                  style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15); overflow-y: overlay;"
                  use:clickOutside
                  on:click_outside={() => (showPopover = false)}
                >
                  {#each listAddress as item}
                    <div
                      class="flex flex-col cursor-pointer"
                      on:click={() => {
                        selectedAddress = item.value;

                        description = "What's on your mind?";
                        selectProfileNFT = {};
                        socialDataTwitter = {
                          label: "Twitter",
                          username: "",
                        };
                        socialDataTelegram = {
                          label: "Telegram",
                          username: "",
                        };

                        showPopover = false;
                      }}
                    >
                      <div
                        class="text-2xl xl:text-xs font-medium text_00000099"
                      >
                        {item.label}
                      </div>
                      <div
                        class={`text-3xl xl:text-sm ${
                          darkMode ? "text-white" : "text-black"
                        }`}
                      >
                        {shorterAddress(item?.value)}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <InviterQr />
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="xl:text-3xl text-4xl font-medium">My Story</div>
          <div class="grid xl:grid-cols-4 grid-cols-2 gap-6">
            <Summary {selectedAddress} />

            <div class="col-span-2 p-5 rounded-xl border border_0000001a">
              {#if selectProfileNFT && Object.keys(selectProfileNFT).length !== 0}
                <div class="h-full flex gap-3">
                  <div
                    class="w-2/5 flex flex-col gap-2 justify-center items-center"
                  >
                    <img
                      src={selectProfileNFT?.imageUrl}
                      alt=""
                      class="rounded-xl w-full h-[200px] object-contain"
                    />
                    {#if isEdit}
                      <div class="w-max">
                        <Button
                          variant="secondary"
                          on:click={() => (isOpenModalSelectNFT = true)}
                          >Change</Button
                        >
                      </div>
                    {/if}
                  </div>
                  <div
                    class="flex-1 w-full h-full flex flex-col justify-center gap-5"
                  >
                    <div class="flex flex-col">
                      <div class="font-medium xl:text-lg text-2xl">
                        {selectProfileNFT?.name}
                      </div>
                      <div
                        class="flex items-center gap-2 xl:text-lg text-2xl font-medium"
                      >
                        <div>
                          {typeWalletAddress === "EVM"
                            ? "Token ID"
                            : "Inscription"}
                        </div>
                        <div>
                          #{selectProfileNFT?.tokenId}
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col gap-2 xl:text-base text-xl">
                      <div class="flex justify-between">
                        <div class="text-gray-400">Rarity</div>
                        <div>{selectProfileNFT?.rarityScore}</div>
                      </div>

                      <div class="flex justify-between">
                        <div class="text-gray-400">Floor Price</div>
                        <div class="flex items-center">
                          <TooltipNumber
                            number={Number(selectProfileNFT?.floorPrice)}
                            type="balance"
                          /><span class="ml-1">
                            {selectProfileNFT?.nativeToken?.symbol || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {:else}
                <div
                  class="flex flex-col justify-center items-center gap-2 w-full h-full"
                >
                  <div class="xl:text-base text-lg">
                    There is no NFT highlight yet in your profile
                  </div>
                  {#if Object.keys(userInfo).length !== 0 && isEdit}
                    <div class="w-max">
                      <Button
                        variant="tertiary"
                        on:click={() => (isOpenModalSelectNFT = true)}
                      >
                        Add NFT
                      </Button>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>

            <div
              class="col-span-2 p-6 bg-dark-50 text-white xl:text-base text-xl rounded-xl"
            >
              {#if isEdit}
                <textarea
                  maxlength="300"
                  rows="5"
                  value={description}
                  class="bg-dark-50 text-white xl:text-base text-xl rounded-lg border-0 outline-none w-full"
                  on:keyup={({ target: { value } }) => (description = value)}
                />
              {:else}
                <div>{description}</div>
              {/if}
            </div>

            <div class="col-span-2 grid grid-cols-2 gap-6">
              <SocialMedia
                {isEdit}
                typeSocialMedia="Twitter"
                socialData={socialDataTwitter}
                {submitSocialData}
              />
              <SocialMedia
                {isEdit}
                typeSocialMedia="Telegram"
                socialData={socialDataTelegram}
                {submitSocialData}
              />
            </div>

            <TradingStats {selectedAddress} />

            <ClosedPositionChart {selectedAddress} />
          </div>
        </div>
      </div>
    </form>
  </div>
</ErrorBoundary>

<!-- Modal select NFT profile -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModalSelectNFT}
  on:close={() => {
    isOpenModalSelectNFT = false;
  }}
>
  <div class="flex flex-col gap-4">
    <div class="xl:title-3 title-1 font-semibold">
      Select your NFT to set your profile
    </div>
    {#if $queryNftHolding.isFetching}
      <div class="flex items-center justify-center h-[465px]">
        <Loading />
      </div>
    {:else}
      <div>
        {#if $queryNftHolding.isError || dataNftHolding.length === 0}
          <div
            class="flex justify-center items-center p-[6px] text-lg text-gray-400 h-[465px]"
          >
            Empty
          </div>
        {:else}
          <div class="overflow-y-auto h-[563px] grid grid-cols-3 gap-6">
            {#each dataNftHolding as item}
              <div
                class="rounded-xl border border_0000001a overflow-hidden h-[260px] cursor-pointer"
                on:click={() => {
                  selectProfileNFT = item;
                  isOpenModalSelectNFT = false;
                }}
              >
                <img
                  src={item?.imageUrl}
                  alt=""
                  class="w-full h-full object-contain"
                />
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</AppOverlay>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
  .button {
    width: max-content;
    border-radius: 1000px;
    padding: 4px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  :global(body) .button {
    background: #20295b;
  }
  :global(body.dark) .button {
    background: #212121;
  }

  :global(body) .select_content {
    background: #ffffff;
    border: 0.5px solid transparent;
  }
  :global(body.dark) .select_content {
    background: #131313;
    border: 0.5px solid #cdcdcd59;
  }
</style>
