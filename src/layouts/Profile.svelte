<script lang="ts">
  import { shorterAddress, clickOutside } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { wallet, user, isDarkMode } from "~/store";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import Summary from "~/UI/Profile/Summary.svelte";
  import Description from "~/UI/Profile/Description.svelte";
  import NFTInfo from "~/UI/Profile/NFTInfo.svelte";
  import SocialMedia from "~/UI/Profile/SocialMedia.svelte";
  import ClosedPositionChart from "~/UI/Profile/ClosedPositionChart.svelte";
  import Button from "~/components/Button.svelte";
  import SyncMobile from "~/UI/Profile/SyncMobile.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
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

  let listAddress = [];
  let showPopover = false;
  let isEdit = false;
  let isLoadingSaveProfile = false;

  let selectedAddress = localStorage.getItem("evm_address") || "";
  let description = "Your description";
  let selectProfileNFT = {};
  let socialDataTwitter = {
    label: "Twitter",
    username: "",
  };
  let socialDataTelegram = {
    label: "Telegram",
    username: "",
  };

  const handleSubmitProfile = async () => {
    console.log("selectedAddress: ", selectedAddress);
    console.log("description: ", description);
    console.log("selectProfileNFT: ", selectProfileNFT);
    console.log("socialDataTwitter: ", socialDataTwitter);
    console.log("socialDataTelegram: ", socialDataTelegram);

    isLoadingSaveProfile = true;
    try {
      isLoadingSaveProfile = false;
      toastMsg = "Your profile updated successfully!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      console.error(e);
      isLoadingSaveProfile = false;
      toastMsg =
        "Something wrong when updating your profile. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  const handleCancelEdit = () => {
    isEdit = false;
    selectedAddress = localStorage.getItem("evm_address");
    socialDataTelegram = {
      label: "Telegram",
      username: "",
    };
    socialDataTwitter = {
      label: "Twitter",
      username: "",
    };
  };

  const getListAddress = async () => {
    const response: any = await nimbus.get("/accounts/list");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: query = createQuery({
    queryKey: ["list-address"],
    queryFn: () => getListAddress(),
    staleTime: Infinity,
    retry: false,
    enabled:
      Object.keys(userInfo).length !== 0 &&
      selectedWallet !== "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0",
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

  const formatDataListAddress = async (data) => {
    listAddress = data.map((item) => {
      return {
        id: item.id,
        type: item.type,
        label: item.label,
        value: item.type === "CEX" ? item.id : item.accountId,
      };
    });
  };
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
      {#if Object.keys(userInfo).length !== 0}
        <div class="flex items-center justify-end lg:gap-2 gap-6">
          {#if isEdit}
            <div class="w-[120px]">
              <Button variant="secondary" on:click={handleCancelEdit}
                >Cancel</Button
              >
            </div>
            <div class="w-[120px]">
              <Button type="submit">Save</Button>
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
        <div class="xl:w-1/4 w-full flex flex-col gap-7 justify-between">
          <div class="flex flex-col gap-3 items-center justify-start">
            <div class="xl:w-[80px] xl:h-[80px] w-32 h-32">
              <img
                src={`/assets/user.png`}
                alt=""
                class="object-cover w-full h-full"
              />
            </div>

            <div class="relative">
              <div
                class={`text-2xl xl:text-base font-medium ${
                  isEdit ? "cursor-pointer" : ""
                }`}
                on:click={() => {
                  if (isEdit) {
                    showPopover = !showPopover;
                  }
                }}
              >
                {shorterAddress(selectedAddress)}
              </div>
              {#if showPopover}
                <div
                  class="select_content absolute left-1/2 transform -translate-x-1/2 z-50 flex flex-col xl:gap-3 gap-6 px-3 xl:py-2 py-3 text-sm transform rounded-lg top-8 w-max xl:max-h-[300px] xl:max-h-[310px] max-h-[380px]"
                  style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15); overflow-y: overlay;"
                  use:clickOutside
                  on:click_outside={() => (showPopover = false)}
                >
                  {#each listAddress as item}
                    <div
                      class="flex flex-col cursor-pointer"
                      on:click={() => {
                        selectedAddress = item.value;
                        showPopover = false;
                      }}
                    >
                      <div
                        class="text-2xl xl:text-xs font-medium text_00000099"
                      >
                        {item.label}
                      </div>
                      <div class="text-3xl xl:text-sm">
                        {shorterAddress(item?.value)}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
          <div class="flex justify-center">
            <SyncMobile />
          </div>
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="xl:text-3xl text-4xl font-medium">My Story</div>
          <div class="grid xl:grid-cols-4 grid-cols-2 gap-6">
            <Summary {selectedAddress} />
            <Description {isEdit} bind:description />
            <NFTInfo {isEdit} bind:selectProfileNFT />
            <div class="col-span-2 grid grid-cols-2 gap-6">
              <SocialMedia
                {isEdit}
                bind:socialData={socialDataTwitter}
                typeSocialMedia="Twitter"
              />
              <SocialMedia
                {isEdit}
                bind:socialData={socialDataTelegram}
                typeSocialMedia="Telegram"
              />
            </div>
            <ClosedPositionChart {selectedAddress} />
          </div>
        </div>
      </div>
    </form>
  </div>
</ErrorBoundary>

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

<style windi:preflights:global windi:safelist:global></style>
