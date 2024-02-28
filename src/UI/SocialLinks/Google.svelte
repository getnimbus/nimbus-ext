<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { isDarkMode, userPublicAddress, user } from "~/store";
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  import { googleAuth } from "~/lib/firebase";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";

  import Google from "~/assets/google.png";
  import goldImg from "~/assets/Gold4.svg";

  export let data: any;
  export let isDisabledRemove: any = false;
  export let reCallAPI: any = () => {};

  const queryClient = useQueryClient();
  const googleProvider = new GoogleAuthProvider();

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  let checked = false;

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

  let dataCheckinHistory = [];
  let openScreenBonusScore: boolean = false;
  let bonusScore: number = 0;

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };

  const handleDailyCheckin = async () => {
    const response = await nimbus.get(`/v2/checkin/${$userPublicAddress}`);
    return response.data;
  };

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    return response?.data;
  };

  $: queryDailyCheckin = createQuery({
    queryKey: [$userPublicAddress, "daily-checkin"],
    queryFn: () => handleDailyCheckin(),
    staleTime: Infinity,
    enabled:
      $user &&
      Object.keys($user).length !== 0 &&
      $userPublicAddress.length !== 0,
    onError(err) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  $: {
    if (!$queryDailyCheckin.isError && $queryDailyCheckin.data !== undefined) {
      dataCheckinHistory = $queryDailyCheckin?.data?.checkinLogs;
    }
  }

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("evm_token");
    },
  });

  $: {
    if (!$queryUserInfo.isError && $queryUserInfo.data !== undefined) {
      if ($queryUserInfo.data.displayName) {
        checked = true;
      } else {
        checked = false;
      }
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const res = await signInWithPopup(googleAuth, googleProvider).then(
        (result) => {
          return result.user;
        }
      );
      if (res) {
        handleAddGoogle(res.uid, res.email, res.displayName);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddGoogle = async (id, info, displayName) => {
    try {
      let params: any = {
        kind: "social",
        id,
        type: "google",
        info,
        displayName,
      };

      if (data && Object.keys(data).length === 0) {
        params = {
          ...params,
          userPublicAddress: $userPublicAddress,
        };
      }

      await nimbus.post("/accounts/link", params);

      const quest = dataCheckinHistory.find(
        (item) => item.type === "QUEST" && item.note === "link-google"
      );
      if (!quest) {
        handleAddBonusQuest();
      }

      localStorage.setItem("socialAuthType", "google");
      reCallAPI();

      toastMsg = "Successfully link Google account!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      console.log(e);
      toastMsg =
        "There are some problem when link Google account. Please try again!";
      isSuccessToast = true;
      trigger();
    }
  };

  const handleAddBonusQuest = async () => {
    try {
      const res = await nimbus.post(
        `/v2/checkin/${$userPublicAddress}/quest/link-google`,
        {}
      );
      if (res && res?.data === null) {
        toastMsg = "You are already finished this quest";
        isSuccessToast = false;
      }
      if (res?.data?.bonus !== undefined) {
        triggerBonusScore();
        bonusScore = res?.data?.bonus;
        queryClient.invalidateQueries([$userPublicAddress, "daily-checkin"]);
        queryClient.invalidateQueries(["users-me"]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveGoogle = async () => {
    try {
      await nimbus.put(`/users/displayName?name=${""}`, {});
      await nimbus.delete(`/accounts/link/${data?.uid}`, {});
      localStorage.removeItem("socialAuthType");
      queryClient?.invalidateQueries(["users-me"]);
      reCallAPI();
      toastMsg = "Successfully remove link Google account!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      console.log(e);
      toastMsg =
        "There are some problem when remove link Google account. Please try again!";
      isSuccessToast = true;
      trigger();
    }
  };

  const handleDisplayName = async () => {
    try {
      checked = !checked;
      await nimbus.put(
        `/users/displayName?name=${checked ? data?.name : ""}`,
        {}
      );
      queryClient.invalidateQueries(["users-me"]);
      toastMsg = `Successfully ${
        checked ? "set" : "unset"
      } display Google account!`;
      isSuccessToast = true;
      trigger();
    } catch (e) {
      console.log(e);
      toastMsg =
        "There are some problem when set display Google account. Please try again!";
      isSuccessToast = true;
      trigger();
    }
  };
</script>

<div class="bg_f4f5f8 rounded-[10px] px-4 py-3 flex flex-col gap-2">
  <div class="flex justify-between items-center gap-4">
    <div class="font-medium xl:text-lg text-3xl">Google</div>
    {#if data && Object.keys(data).length !== 0 && !isDisabledRemove}
      <div
        class="cursor-pointer text-red-600 font-medium text-2xl xl:text-base"
        on:click={handleRemoveGoogle}
      >
        Remove
      </div>
    {/if}
  </div>

  {#if data && Object.keys(data).length !== 0}
    <div class="flex items-center gap-2">
      <img src={Google} alt="" width="22" height="22" />
      <div class="xl:text-base text-2xl">{data?.info}</div>
    </div>
    <div class="mt-2 flex items-center justify-start gap-2">
      <input
        type="checkbox"
        {checked}
        on:click={() => {
          handleDisplayName();
        }}
        class="cursor-pointer relative w-5 h-5 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
      />
      <div class="text-lg xl:text-sm">Display Google on Nimbus</div>
    </div>
  {:else}
    <div
      class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
        $isDarkMode
          ? "border-white text-white"
          : "border-[#27326f] text-[#27326f]"
      }`}
      on:click={handleGoogleAuth}
    >
      <img src={Google} alt="" width="22" height="22" />
      <div class="font-semibold text-[15px]">Connect with Google</div>
    </div>
  {/if}
</div>

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
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
</style>
