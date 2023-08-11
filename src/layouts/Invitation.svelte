<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import QRCode from "qrcode-generator";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import html2canvas from "html2canvas";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Logo from "~/assets/logo-1.svg";
  import { shorterAddress } from "~/utils";

  const qrcode = QRCode(0, "L");

  let link = "";
  let qrImageDataUrl = "";
  let referrals = 0;
  let userAddress = "";

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
        userAddress = response?.data?.publicAddress;
        link = `https://app.getnimbus.io/?invitation=${response?.data?.id}`;
        qrcode.addData(link);
        qrcode.make();
        qrImageDataUrl = qrcode.createDataURL(6, 0);
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  onMount(() => {
    getReferrals();
    getUserInfo();
  });

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
      } catch (error) {
        console.error("Error capturing screenshot:", error);
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
        const imgElement = document.createElement("img");
        imgElement.src = img;
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
      } catch (error) {
        console.error("Error capturing screenshot:", error);
      }
    }
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
        class="flex flex-col gap-3 border border-[#0000001a] rounded-[20px] py-4 px-6"
      >
        <div class="xl:text-base text-xl text-center text-gray-500 mb-2">
          Your code has been used by <span class="text-black font-medium"
            >{referrals}</span
          > people
        </div>

        <div id="target-element" class="card">
          <div class="title_container">
            <img src={Logo} />
            <!-- <div class="title">Nimbus Users</div> -->
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
            <div class="footer_wrapper">Manage your portfolio with Nimbus</div>
          </div>
        </div>

        <div class="flex justify-center gap-6">
          <CopyToClipboard text={link} let:copy>
            <div
              class="flex items-center gap-1 hover:bg-gray-100 transition-all ease-in py-1 px-3 rounded-[10px] cursor-pointer flex-1"
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
              <div class="text-gray-500 xl:text-base text-lg">Link</div>
            </div>
          </CopyToClipboard>

          <div class="border-l-[1px] my-1" />

          <div
            class="flex items-center gap-1 hover:bg-gray-100 transition-all ease-in py-1 px-2 rounded-[10px] cursor-pointer flex-1"
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
            <div class="text-gray-500 xl:text-base text-lg">Save</div>
          </div>

          <div class="border-l-[1px] my-1" />

          <div
            class="flex items-center gap-1 hover:bg-gray-100 transition-all ease-in py-1 px-2 rounded-[10px] cursor-pointer flex-1"
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
            <div class="text-gray-500 xl:text-base text-lg">Copy</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style>
  .card {
    border: 2px solid black;
    border-radius: 12px;
    overflow: hidden;
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

  .card .title_container .title {
    border-radius: 12px;
    background-color: rgba(229, 231, 235, 1);
    width: max-content;
    padding: 2px 8px;
    font-weight: 500;
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

  .card .body_container .footer_wrapper {
    font-size: 14px;
    line-height: 20px;
    color: rgba(156, 163, 175, 1);
    margin-top: 16px;
    font-weight: 500;
  }
</style>
