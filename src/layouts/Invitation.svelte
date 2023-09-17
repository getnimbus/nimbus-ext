<script lang="ts">
  import { nimbus } from "~/lib/network";
  import QRCode from "qrcode-generator";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import html2canvas from "html2canvas";
  import { shorterAddress } from "~/utils";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { isDarkMode, user, wallet, chain, typeWallet } from "~/store";
  import { useNavigate } from "svelte-navigator";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import Logo from "~/assets/logo-1.svg";

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  const qrcode = QRCode(0, "L");

  let link = "";
  let qrImageDataUrl = "";
  let referrals = 0;
  let userAddress = "";

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

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  const getReferrals = async () => {
    const response = await nimbus.get("/referrals");
    return response.data;
  };

  const queryReferrals = createQuery({
    queryKey: ["referrals"],
    queryFn: () => getReferrals(),
    staleTime: Infinity,
  });

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
      queryClient.invalidateQueries(["list-address"]);
    },
  });

  $: {
    if (!$queryReferrals.isError && $queryReferrals.data !== undefined) {
      referrals = $queryReferrals.data?.count;
    }
  }

  $: {
    if (!$queryUserInfo.isError && $queryUserInfo.data !== undefined) {
      userAddress = $queryUserInfo.data?.publicAddress;
      link = `https://app.getnimbus.io/?invitation=${$queryUserInfo.data?.id}`;
      qrcode.addData(link);
      qrcode.make();
      qrImageDataUrl = qrcode.createDataURL(6, 0);
    }
  }

  const downloadQRCode = async () => {
    const targetElement = document.getElementById("target-element");
    if (targetElement) {
      try {
        const canvas = await html2canvas(targetElement);
        const img = canvas.toDataURL("image/png");
        // handle download image
        const a = document.createElement("a");
        a.href = img;
        a.download = "qrcode.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toastMsg = "Successfully downloaded QR!";
        isSuccessToast = true;
        trigger();
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toastMsg = "Something wrong when download QR. Please try again!";
        isSuccessToast = false;
        trigger();
      }
    }
  };

  const copyQRCode = async () => {
    const targetElement = document.getElementById("target-element");
    if (targetElement) {
      try {
        const createCanvas = await html2canvas(targetElement);
        const img = createCanvas.toDataURL("image/png");
        // handle copy image
        const response = await fetch(img);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toastMsg = "Successfully copied QR!";
        isSuccessToast = true;
        trigger();
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toastMsg = "Something wrong when copy QR. Please try again!";
        isSuccessToast = false;
        trigger();
      }
    }
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl font-medium">Invite Friends</div>
      <div class="">
        Tell your friends it’s fun and effective for portfolio management. <br
        /> Easy way to minimize risk while maximazing return.
      </div>
    </div>
    <div class="xl:min-w-2xl min-w-4xl flex justify-center items-center">
      <div
        style="box-shadow: 0 5px 20px rgba(0, 0, 0, 8%);"
        class={`flex flex-col gap-3 border border_0000001a rounded-[20px] py-4 px-6 ${
          darkMode ? "bg-[#0f0f0f]" : "bg-white"
        }`}
      >
        <div class="xl:text-base text-2xl text-center text_00000066 mb-2">
          Your code has been used by <span class=" font-medium"
            >{referrals}</span
          >
          {#if referrals > 1}
            peoples
          {:else}
            people
          {/if}
        </div>

        <div id="target-element" class="card">
          <div class="title_container">
            <img src={Logo} alt="" />
          </div>
          <div class="body_container">
            <div class="title_wrapper">
              <div class="address">
                {shorterAddress(userAddress)}
              </div>
              <div class="type">Inviter</div>
            </div>
            <div class="qr_wrapper">
              <img src={qrImageDataUrl} alt="QR Code" />
            </div>
            <div class="footer_wrapper">
              Investment in crypto in easy-mode with Nimbus
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-6">
          <CopyToClipboard
            text={link}
            let:copy
            on:copy={() => {
              toastMsg = "Successfully copied link invitation!";
              isSuccessToast = true;
              trigger();
            }}
          >
            <div
              class={`flex items-center gap-1 transition-all ease-in py-1 px-3 rounded-[10px] cursor-pointer flex-1 ${
                darkMode ? "hover:bg-[#00000066]" : "hover:bg-[#eff0f4]"
              }`}
              on:click={() => {
                copy();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={`${darkMode ? "#cdcdcd" : "#00000099"}`}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="tabler-icon tabler-icon-link"
                ><path d="M9 15l6 -6" /><path
                  d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"
                /><path
                  d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"
                /></svg
              >
              <div class="text_00000066 xl:text-base text-lg">Link</div>
            </div>
          </CopyToClipboard>

          <div class="border-l-[1px] my-1" />

          <div
            class={`flex items-center gap-1 transition-all ease-in py-1 px-2 rounded-[10px] cursor-pointer flex-1 ${
              darkMode ? "hover:bg-[#00000066]" : "hover:bg-[#eff0f4]"
            }`}
            on:click={downloadQRCode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={`${darkMode ? "#cdcdcd" : "#00000099"}`}
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="tabler-icon tabler-icon-download"
              ><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path
                d="M7 11l5 5l5 -5"
              /><path d="M12 4l0 12" /></svg
            >
            <div class="text_00000066 xl:text-base text-lg">Save</div>
          </div>

          <div class="border-l-[1px] my-1" />

          <div
            class={`flex items-center gap-1 transition-all ease-in py-1 px-2 rounded-[10px] cursor-pointer flex-1 ${
              darkMode ? "hover:bg-[#00000066]" : "hover:bg-[#eff0f4]"
            }`}
            on:click={copyQRCode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={`${darkMode ? "#cdcdcd" : "#00000099"}`}
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="tabler-icon tabler-icon-photo"
              ><path d="M15 8h.01" /><path
                d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"
              /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /><path
                d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"
              /></svg
            >
            <div class="text_00000066 xl:text-base text-lg">Copy</div>
          </div>
        </div>
      </div>
    </div>
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

<style>
  .card {
    border: 2px solid black;
    border-radius: 12px;
    overflow: hidden;
    background: white;
  }

  .card .title_container {
    padding: 12px 16px;
    background-color: rgba(243, 244, 246, 1);
    font-size: 14px;
    line-height: 20px;
  }

  .card .title_container img {
    height: 48px;
    width: auto;
    margin-left: -12px;
  }

  .card .body_container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card .body_container .title_wrapper {
    display: flex;
    flex-direction: column;
  }

  .card .body_container .title_wrapper .address {
    color: black;
    font-size: 24px;
    line-height: 32px;
  }

  .card .body_container .title_wrapper .type {
    color: rgba(156, 163, 175, 1);
  }

  .card .body_container .qr_wrapper {
    display: flex;
    justify-content: center;
  }

  .card .body_container .qr_wrapper img {
    width: 198px;
    height: 198px;
  }

  .card .body_container .footer_wrapper {
    font-size: 14px;
    line-height: 20px;
    color: rgba(156, 163, 175, 1);
    margin-top: 16px;
    font-weight: 500;
  }
</style>
