<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode, triggerConnectWallet } from "~/store";
  import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth } from "~/lib/firebase";
  import { useQueryClient } from "@tanstack/svelte-query";
  import mixpanel from "mixpanel-browser";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import User from "~/assets/user.png";

  const queryClient = useQueryClient();
  const twitterProvider = new TwitterAuthProvider();

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

  const handleTwitterAuth = async () => {
    mixpanel.track("user_login_twitter");
    try {
      const res: any = await signInWithPopup(auth, twitterProvider).then(
        (result) => {
          return result.user;
        }
      );
      if (res) {
        handleGetTwitterToken(
          res?.uid,
          res?.reloadUserInfo?.providerUserInfo[0]?.rawId,
          "twitter",
          res?.reloadUserInfo?.screenName,
          res?.reloadUserInfo?.screenName
        );
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleGetTwitterToken = async (
    uid,
    externalId,
    type,
    info,
    displayName
  ) => {
    try {
      const res: any = await nimbus.post("/auth", {
        uid,
        externalId,
        type,
        info,
        displayName: displayName ? displayName : info,
      });
      if (res?.data?.result) {
        triggerConnectWallet.update((n) => (n = false));
        localStorage.setItem("auth_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        toastMsg = "Login with Twitter successfully!";
        isSuccessToast = true;
        trigger();
        queryClient?.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
        queryClient?.invalidateQueries(["link-socials"]);
      } else {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white cursor-pointer rounded-[12px] bg-black w-[219px] h-[43px] ${$isDarkMode ? "border border-white" : ""}`}
  style="padding: 9px 21px 11px;"
  on:click={handleTwitterAuth}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="24"
    fill="none"
    viewBox="0 0 512 512"
    id="twitter"
    ><script xmlns=""></script>
    <g clip-path="url(#clip0_84_15697)">
      <rect width="512" height="512" fill="#000" rx="60" />
      <path
        fill="#fff"
        d="M355.904 100H408.832L293.2 232.16L429.232 412H322.72L239.296 302.928L143.84 412H90.8805L214.56 270.64L84.0645 100H193.28L268.688 199.696L355.904 100ZM337.328 380.32H366.656L177.344 130.016H145.872L337.328 380.32Z"
      >
      </path>
    </g>
    <defs>
      <clipPath id="clip0_84_15697">
        <rect width="512" height="512" fill="#fff" />
      </clipPath>
    </defs>
    <script xmlns=""></script></svg
  >
  <div class="font-normal text-[15px]">Log in with X</div>
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

<style windi:preflights:global windi:safelist:global></style>
