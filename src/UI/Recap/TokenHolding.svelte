<script>
  import html2canvas from "html2canvas";

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Portfolio from "./TokenHoldingCharts/Portfolio.svelte";

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

<div class="bg-[#eff4e8] overflow-hidden w-full h-full" id="target-slide-1">
  <div class="flex flex-col h-full max-w-[2000px] m-auto w-[90%]">
    <img
      src={Logo}
      alt="logo"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
    />
    <div
      class="relative flex-1 h-full flex xl:flex-row flex-col xl:items-center justify-between gap-20 px-[35px]"
    >
      <div class="flex flex-col gap-7">
        <div class="grid grid-cols-2 gap-10">
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

      <div class="flex-1">
        <div class="flex items-end gap-6">
          <Portfolio />
          <div class="flex-1">Price charts</div>
        </div>
        <div class="flex-1">Top changes charts</div>
      </div>

      <div class="absolute bottom-[-100px] left-[-120px] z-[1]">
        <img src={SvgOne} alt="" />
      </div>
    </div>
  </div>
</div>

<style>
  .info_container .title {
    font-size: 18px;
    color: #4f4f4f;
  }

  .info_container .content {
    font-size: 36px;
    font-weight: 800;
    color: #202025;
  }

  .btn-share {
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
