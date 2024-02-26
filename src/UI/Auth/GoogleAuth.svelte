<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode } from "~/store";
  import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
  import { googleAuth } from "~/lib/firebase";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import User from "~/assets/user.png";
  import Google from "~/assets/google.png";

  export let handleCloseAuthModal = () => {};

  const queryClient = useQueryClient();
  const googleProvider = new GoogleAuthProvider();

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

  const handleGoogleAuth = async () => {
    mixpanel.track("user_login_google");
    try {
      const res = await signInWithPopup(googleAuth, googleProvider).then(
        (result) => {
          return result.user;
        }
      );
      if (res) {
        handleGetGoogleToken(res.uid, "google", res.email, res.displayName);
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleGetGoogleToken = async (uid, type, info, displayName) => {
    try {
      const res = await nimbus.post("/auth", {
        uid,
        type,
        info,
        displayName,
      });
      if (res?.data?.result) {
        handleCloseAuthModal();
        localStorage.setItem("auth_token", res?.data?.result);
        localStorage.setItem("socialAuthType", "google");
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        toastMsg = "Login with Google successfully!";
        isSuccessToast = false;
        trigger();
        queryClient?.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
      }

      toastMsg = res?.error;
      isSuccessToast = false;
      trigger();
    } catch (e) {
      console.error("error: ", e);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] min-w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleGoogleAuth}
>
  <img src={Google} class="h-[24px]" />
  <div class="font-semibold text-[15px]">Login with Google</div>
</div>

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

<style>
</style>
