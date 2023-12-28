<script>
  import html2canvas from "html2canvas";

  import Logo from "~/assets/logo-1.svg";
  import Upload from "~/assets/upload.svg";

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

  const downloadPage = async () => {
    const targetElement = document.getElementById("target-slide-1");
    const shareBtn = document.getElementById("btn-share");
    if (targetElement && shareBtn) {
      try {
        const canvas = await html2canvas(targetElement);
        console.log("canvas: ", canvas);
        const img = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        // handle download image
        const a = document.createElement("a");
        a.href = img;
        a.download = "TokenHolding.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toastMsg = "Successfully downloaded!";
        isSuccessToast = true;
        trigger();
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toastMsg = "Something wrong when download. Please try again!";
        isSuccessToast = false;
        trigger();
      }
    }
  };
</script>

<div class="wrapper" id="target-slide-1">
  <img src={Logo} alt="logo" class="logo" />
  <div class="container">
    <div class="content_container">
      <div class="content">Token holding summary</div>
      <button id="btn-share" class="btn-share" on:click={downloadPage}>
        <img src={Upload} alt="" />
        <div>Share</div>
      </button>
    </div>
    <div class="chart_container">Chart</div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  .wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 2000px;
    margin: auto;
    width: 90%;
  }

  .wrapper .logo {
    width: 177px;
    height: 75px;
  }

  .wrapper .container {
    padding: 0 35px;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 80px;
  }

  .wrapper .container .chart_container {
    flex: 1;
  }

  .wrapper .container .content_container {
    flex: 0.6;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .wrapper .content_container .content {
    font-weight: 500;
    font-size: 32px;
  }

  .wrapper .content_container .btn-share {
    background: #27326f;
    color: white;
    padding: 6px 9px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 12px;
    width: max-content;
    cursor: pointer;
  }
</style>
