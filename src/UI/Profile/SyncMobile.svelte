<script>
  import Logo from "~/assets/logo-1.svg";
  import QRCode from "qrcode-generator";
  import { nimbus } from "~/lib/network";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import dayjs from "dayjs";
  import { isDarkMode } from "~/store";
  import { wait } from "~/entries/background/utils";
  import AppOverlay from "~/components/Overlay.svelte";

  let qrImageDataUrl = "";
  let syncMobileCode = "";
  let timer = null;
  let isOpenModalSync = true;

  let timeCountdown = 59;
  let timerCountdown;
  let isCopied = false;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  const handleGetCodeSyncMobile = async () => {
    try {
      const res = await nimbus.get("/users/cross-login");
      if (res?.data) {
        syncMobileCode = res?.data?.code;
        const expiredAt = dayjs.unix(res?.data?.expiredAt);
        const currentTime = dayjs();

        // Check if the time difference is more than 1 minute
        if (currentTime.diff(expiredAt, "second") > 60) {
          // Make another API call to get a new sync code
          const newResponse = await nimbus.get("/users/cross-login");
          if (newResponse) {
            syncMobileCode = res?.data?.code;
          }
        } else {
          // Schedule the next check after 1 minute
          timer = setTimeout(handleGetCodeSyncMobile, 60000);

          timerCountdown = setInterval(() => {
            timeCountdown -= 1;
            if (timeCountdown < 0) {
              timeCountdown = 59;
              clearInterval(timerCountdown);
            }
          }, 1000);
        }
      }
    } catch (e) {
      syncMobileCode = undefined;
      timeCountdown = 59;
      clearTimeout(timer);
      clearInterval(timerCountdown);
      console.error("error: ", e);
    }
  };
  handleGetCodeSyncMobile();

  $: {
    if (syncMobileCode) {
      const qrcode = QRCode(0, "L");
      qrcode.addData(`https://app.getnimbus.io/?code=${syncMobileCode}`);
      qrcode.make();
      qrImageDataUrl = qrcode.createDataURL(7);
    }
  }
</script>

<!-- Modal sync user to mobile -->

<div class="flex flex-col gap-4">
  <div class="flex justify-start self-start items-center -mt-2">
    <div class="border rounded-xl overflow-hidden bg-white w-[200px]">
      {#if qrImageDataUrl !== undefined}
        <img src={qrImageDataUrl} alt="QR Code" />
      {:else}
        <div class="flex flex-col items-center gap-1 text-sm py-30">
          <div>Something wrong when generate QR code.</div>
          <div
            class="text-blue-500 cursor-pointer"
            on:click={() => {
              handleGetCodeSyncMobile();
            }}
          >
            Try again
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style></style>
