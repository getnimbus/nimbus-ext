<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";
  import { auth } from "~/lib/firebase";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { useQueryClient } from "@tanstack/svelte-query";

  import Button from "~/components/Button.svelte";

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
    try {
      const res = await signInWithPopup(auth, twitterProvider).then(
        (result) => result.user
      );
      if (res) {
        handleAddTwitter(
          res.uid,
          res?.reloadUserInfo?.providerUserInfo[0]?.email,
          res?.reloadUserInfo?.screenName
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddTwitter = async (id, info, displayName) => {
    try {
      let params: any = {
        kind: "social",
        id,
        type: "twitter",
        info,
        displayName,
      };

      const response = await nimbus.post("/accounts/link", params);
      if (response && response?.error) {
        toastMsg = response?.error;
        isSuccessToast = false;
        trigger();
      } else {
        queryClient?.invalidateQueries(["link-socials"]);

        toastMsg = "Successfully connect X account!";
        isSuccessToast = true;
        trigger();
      }
    } catch (e) {
      console.log(e);
      toastMsg =
        "There are some problem when link X account. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };
</script>

<div class="w-max">
  <Button variant="tertiary" on:click={handleTwitterAuth} className="py-3 px-6">
    <div class="font-semibold text-base flex items-center gap-2">
      Connect with <img
        alt="link X"
        loading="lazy"
        decoding="async"
        data-nimg="1"
        style="color:transparent"
        src="https://getnimbus.io/logoSocialMedia/twitterX1.svg"
        class="w-[26px] h-[26px]"
      />
    </div>
  </Button>
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

<style windi:preflights:global windi:safelist:global>
</style>
