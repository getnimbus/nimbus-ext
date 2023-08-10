<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import QRCode from "qrcode-generator";
  import CopyToClipboard from "svelte-copy-to-clipboard";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  const qrcode = QRCode(0, "L");

  let link = "";
  let qrImageDataUrl = "";
  let referrals = 0;

  const getReferrals = async () => {
    try {
      const response = await nimbus.get("/referrals");
      if (response && response.data) {
        referrals = response?.data?.count;
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await nimbus.get("/users/me");
      if (response && response.data) {
        link = `https://app.getnimbus.io/?invitation=${response?.data?.id}`;
        qrcode.addData(link);
        qrcode.make();
        qrImageDataUrl = qrcode.createDataURL(14, 0);
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  onMount(() => {
    getReferrals();
    getUserInfo();
  });

  const downloadQRCode = () => {
    const a = document.createElement("a");
    a.href = qrImageDataUrl;
    a.download = "qrcode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyQRCode = () => {
    const imgElement = document.createElement("img");
    imgElement.src = qrImageDataUrl;

    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0);

    canvas.toBlob((blob) => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard
        .write([item])
        .then(() => {
          console.log("Image copied to clipboard.");
        })
        .catch((error) => {
          console.error("Error copying image:", error);
        });
    });
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl text-black font-semibold">
        Invite Friends
      </div>
      <div class="xl:text-xl text-3xl text-black font-medium">
        Tell your friends it’s fun and effective for wallet tracker when
        investment.
      </div>
    </div>
    <div class="xl:min-w-2xl min-w-4xl flex justify-center items-center">
      <div
        style="box-shadow: 0 5px 20px rgba(0, 0, 0, 8%);"
        class="flex flex-col gap-3 border border-[#0000001a] rounded-[20px] py-5 px-6"
      >
        <div class="xl:text-lg text-2xl text-center text-gray-500 mb-2">
          Your code has been used by <span class="text-black font-medium"
            >{referrals}</span
          > people
        </div>

        <img src={qrImageDataUrl} alt="QR Code" />

        <div class="flex justify-center gap-6">
          <CopyToClipboard text={link} let:copy>
            <div
              class="flex flex-col items-center hover:bg-gray-100 transition-all ease-in py-1 px-3 rounded-[10px] cursor-pointer"
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
                stroke="rgb(92,92,92)"
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
              <div class="text-gray-500 xl:text-sm text-lg">Link</div>
            </div>
          </CopyToClipboard>

          <div
            class="flex flex-col items-center hover:bg-gray-100 transition-all ease-in py-1 px-3 rounded-[10px] cursor-pointer"
            on:click={downloadQRCode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(92,92,92)"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="tabler-icon tabler-icon-download"
              ><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path
                d="M7 11l5 5l5 -5"
              /><path d="M12 4l0 12" /></svg
            >
            <div class="text-gray-500 xl:text-sm text-lg">Save</div>
          </div>

          <div
            class="flex flex-col items-center hover:bg-gray-100 transition-all ease-in py-1 px-3 rounded-[10px] cursor-pointer"
            on:click={copyQRCode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(92,92,92)"
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
            <div class="text-gray-500 xl:text-sm text-lg">Copy</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style>
</style>
