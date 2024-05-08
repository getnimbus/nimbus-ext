<script lang="ts">
  import { useQueryClient } from "@tanstack/svelte-query";
  import { isDarkMode, user, triggerConnectWallet } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { nimbus } from "~/lib/network";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import User from "~/assets/user.png";

  const queryClient = useQueryClient();

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  let data = {};

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

  $: {
    if (data && Object.keys(data).length !== 0) {
      console.log("HELLO WORLD: ", data);
      // handleTelegramAuth(data);
    }
  }

  const handleTelegramAuth = async (data: any) => {
    mixpanel.track("user_login_telegram");
    try {
      const res: any = await nimbus.post("/auth/telegram", {
        auth_date: data.auth_date,
        first_name: data.first_name,
        hash: data.hash,
        id: data.id,
        last_name: data.last_name,
        photo_url: data.photo_url,
        username: data.username,
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
        toastMsg = "Login with Telegram successfully!";
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
  class={`rounded-[12px] cursor-pointer ${
    $isDarkMode ? "border border-white" : ""
  }`}
>
  <script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="test_nimbus_bot"
    data-size="large"
    data-radius="12"
    data-onauth="onTelegramAuth(user)"
    data-request-access="write"
  ></script>

  <script type="text/javascript">
    function onTelegramAuth(user) {
      if (
        !localStorage.getItem("auth_token") ||
        !localStorage.getItem("solana_token") ||
        !localStorage.getItem("sui_token") ||
        !localStorage.getItem("ton_token") ||
        !localStorage.getItem("evm_token")
      ) {
        data = user;
      }
    }
  </script>
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
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style>
</style>
