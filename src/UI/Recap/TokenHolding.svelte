<script>
  import html2canvas from "html2canvas";

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import NFTOne from "~/assets/recap/nft-card-3.png";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import CardNftRecap from "~/components/CardNFTRecap.svelte";

  export let data;

  $: console.log("data: ", data);

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
        shareBtn.style.visibility = "hidden";
        await html2canvas(targetElement).then((canvas) => {
          shareBtn.style.visibility = "visible";
          const img = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
          const a = document.createElement("a");
          a.href = img;
          a.download = "TokenHolding.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toastMsg = "Successfully downloaded!";
          isSuccessToast = true;
          trigger();
        });
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
  <div class="container_wrapper">
    <img src={Logo} alt="logo" class="logo" />
    <div class="container">
      <div class="content_container">
        <div class="content">
          <div class="info_container">
            <div class="title">You ape in tokens</div>
            <div class="content">
              {data?.stats?.total_holding || 0}
            </div>
          </div>

          <div class="info_container">
            <div class="title">Make your investment growth</div>
            <div
              class="content"
              style="display: flex; align-items: center; gap: 8px;"
            >
              <TooltipNumber
                number={Math.abs(Number(data?.stats?.networth_change)) * 100}
                type="percent"
              />
              <span>%</span>
            </div>
          </div>

          <div class="info_container">
            <div class="title">Total transactions</div>
            <div class="content">
              {data?.stats?.total_txs || 0}
            </div>
          </div>

          <div class="info_container">
            <div class="title">Paid fee (if use Ethereum)</div>
            <div
              class="content"
              style="display: flex; align-items: center; gap: 8px;"
            >
              <TooltipNumber
                number={Number(data?.stats.total_gas_fee_in_eth)}
                type="amount"
              />
              <div>ETH</div>
            </div>
          </div>
        </div>

        <div id="btn-share" class="btn-share" on:click={downloadPage}>
          <div>Share</div>
          <img src={Share} alt="" />
        </div>
      </div>

      <div class="chart_container">
        Chart

        <CardNftRecap nft={NFTOne} />
      </div>

      <div class="iconOne">
        <img src={SvgOne} alt="" />
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  .wrapper {
    background: #eff4e8;
    height: 100%;
    overflow: hidden;
  }

  .wrapper .container_wrapper {
    max-width: 2000px;
    margin: auto;
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .wrapper .container_wrapper .iconOne {
    position: absolute;
    bottom: -100px;
    left: -120px;
    z-index: 1;
  }

  .wrapper .container_wrapper .logo {
    width: 177px;
    height: 75px;
  }

  .wrapper .container_wrapper .container {
    padding: 0 35px;
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: space-between;
    gap: 80px;
  }

  @media (max-width: 1024px) {
    .wrapper .container_wrapper .container {
      flex-direction: column;
      justify-content: center;
      gap: 0;
    }

    .wrapper .container_wrapper .container .content_container {
      justify-content: center;
      order: 2;
    }
  }

  .wrapper .container_wrapper .container .chart_container {
    flex: 1;
  }

  .wrapper .container_wrapper .container .content_container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 32px;
  }

  .wrapper .container_wrapper .content_container .content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
  }

  .wrapper .container_wrapper .content_container .content .info_container {
    display: flex;
    flex-direction: column;
  }

  .wrapper
    .container_wrapper
    .content_container
    .content
    .info_container
    .title {
    font-size: 18px;
    color: #4f4f4f;
  }

  .wrapper
    .container_wrapper
    .content_container
    .content
    .info_container
    .content {
    font-size: 36px;
    font-weight: 800;
    color: #202025;
  }

  .wrapper .container_wrapper .content_container .btn-share {
    background: #ffa41c;
    color: black;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 600;
    border-radius: 32px;
    width: max-content;
    cursor: pointer;
    position: relative;
    z-index: 2;
  }
</style>
