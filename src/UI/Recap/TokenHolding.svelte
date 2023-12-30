<script>
  import html2canvas from "html2canvas";

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import SvgFour from "~/assets/recap/hero/svgFour.svg";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Portfolio from "./TokenHoldingCharts/Portfolio.svelte";
  import Price from "./TokenHoldingCharts/Price.svelte";
  import TopChanges from "./TokenHoldingCharts/TopChanges.svelte";

  export let data;
  export let loading;

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
        await html2canvas(targetElement, {
          ignoreElements: (el) => {
            return el.id === "btn-share";
          },
          allowTaint: true,
          logging: true,
          scale: 2,
        }).then((canvas) => {
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
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

<div
  class="bg-[#eff4e8] py-10 overflow-hidden w-full h-full"
  id="target-slide-1"
>
  <div class="flex flex-col h-full max-w-[2400px] m-auto w-[96%]">
    <img
      src={Logo}
      alt="logo"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
    />
    <div
      class="relative flex-1 h-full flex xl:flex-row flex-col xl:items-center justify-between gap-10 px-[35px]"
    >
      <div class="flex-1 flex flex-col gap-7">
        <div class="grid grid-cols-2 gap-10">
          <div class="flex flex-col gap-1">
            <div class="text-xl text-[#4f4f4f]">You ape in tokens</div>
            <div class="text-[64px] font-extrabold text-[#202025]">
              {data?.stats?.total_holding || 0}
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="text-xl text-[#4f4f4f]">
              Make your investment growth
            </div>
            <div
              class="flex items-center gap-1 text-[64px] font-extrabold text-[#202025]"
            >
              <TooltipNumber
                number={Math.abs(Number(data?.stats?.networth_change)) * 100}
                type="percent"
              />
              <span>%</span>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="text-xl text-[#4f4f4f]">Total transactions</div>
            <div class="text-[64px] font-extrabold text-[#202025]">
              {data?.stats?.total_txs || 0}
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="text-xl text-[#4f4f4f]">Paid fee</div>
            <div class="flex flex-col gap-3">
              <div class="text-[64px] font-extrabold text-[#202025]">
                <TooltipNumber
                  number={Number(data?.stats?.price) *
                    Number(data?.stats.total_gas_fee)}
                  type="value"
                />
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-[#202025] font-semibold text-4xl">
                  <TooltipNumber
                    number={1.5 * Number(data?.stats.total_txs)}
                    type="value"
                  />
                </div>
                <div class="text-[#4F4F4F] text-xl">(If you use Ethereum)</div>
              </div>
            </div>
          </div>
        </div>

        <div
          id="btn-share"
          class="bg-[#ffa41c] text-black p-4 flex items-center gap-2 text-2xl font-semibold rounded-[32px] w-max relative z-20"
          on:click={downloadPage}
        >
          <div>Share</div>
          <img src={Share} alt="" />
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-6">
        <div class="flex items-end gap-6">
          <Portfolio data={data?.holding} {loading} />
          <Price data={data?.stats} {loading} />
        </div>
        <div class="mx-auto">
          <TopChanges data={data?.top_gainer} {loading} />
        </div>
      </div>

      <div class="absolute bottom-[-100px] left-[-120px] z-10">
        <img src={SvgOne} alt="" />
      </div>

      <div class="absolute top-[-115px] right-[-10px] z-10">
        <img src={SvgFour} alt="" />
      </div>
    </div>
  </div>
</div>

<style>
</style>
