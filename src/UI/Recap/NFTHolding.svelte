<script>
  import html2canvas from "html2canvas";

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgThree from "~/assets/recap/hero/svgThree.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

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
    const targetElement = document.getElementById("target-slide-2");
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
          a.download = "NFTHolding.png";
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

<div class="bg-[#E8F4EF] overflow-hidden w-full h-full" id="target-slide-2">
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
        <div class="flex flex-col gap-4">
          <div class="font-medium text-3xl xl:text-4xl">
            Your top collection
          </div>
          <div class="flex">
            {#each data?.top_holding || [] as item, index}
              <div
                class={`w-[74px] h-[74px] rounded-full border-3 border-white overflow-hidden ${
                  index > 0 && "-ml-3"
                }`}
              >
                <img
                  src={item?.collection?.imageUrl ||
                    "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
                  alt=""
                />
              </div>
            {/each}
            <div
              class="flex items-center justify-center text-2xl bg-black text-white w-[74px] h-[74px] rounded-full border-3 border-white -ml-3"
            >
              +{data?.stats?.total_collection - 3}
            </div>
          </div>
        </div>
        <div id="btn-share" class="btn-share" on:click={downloadPage}>
          <div>Share</div>
          <img src={Share} alt="" />
        </div>
      </div>

      <div
        class="text-white p-[24px] rounded-[20px] bg-black flex flex-col gap-10"
      >
        <div class="flex items-center gap-10">
          <div class="flex flex-col">
            <div class="text-[#B7B7B7] font-normal text-2xl">NFT you own</div>
            <div class="text-white font-extrabold text-4xl">
              {data?.stats?.total_holding}
            </div>
          </div>

          <div class="flex flex-col">
            <div class="text-[#B7B7B7] font-normal text-2xl">Making trades</div>
            <div class="text-white font-extrabold text-4xl">
              {data?.stats?.total_trades}
            </div>
          </div>

          <div class="flex flex-col">
            <div class="text-[#B7B7B7] font-normal text-2xl">Net worth</div>
            <div
              class="flex items-center gap-1 text-white font-extrabold text-4xl"
            >
              <div class="flex items-center gap-1">
                <TooltipNumber
                  number={Number(data?.stats?.amount)}
                  type="amount"
                />
                SOL
              </div>
              <div>-</div>
              <TooltipNumber
                number={Number(data?.stats?.networth)}
                type="value"
              />
            </div>
          </div>
        </div>
        <div>hello2</div>
      </div>

      <div class="absolute bottom-[0px] left-[-120px] z-[1]">
        <img src={SvgThree} alt="" />
      </div>

      <div class="absolute top-[-140px] right-[-160px] z-[1]">
        <img src={SvgOne} alt="" />
      </div>
    </div>
  </div>
</div>

<style>
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
