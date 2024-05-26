<script lang="ts">
  import html2canvas from "html2canvas";
  import { triggerToast } from "~/utils/functions";
  import mixpanel from "mixpanel-browser";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import NftCard from "./NFTHolding/NFTCard.svelte";
  import Loading from "~/components/Loading.svelte";

  import Logo from "~/assets/logo-1.svg";
  import Share from "~/assets/recap/hero/share.svg";
  import SvgThree from "~/assets/recap/hero/svgThree.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";

  export let data;
  export let loading;

  const downloadPage = async () => {
    mixpanel.track("recap_share_nftholding");
    const targetElement = document.getElementById("target-slide-2");
    const shareBtn = document.getElementById("btn-share");
    if (targetElement && shareBtn) {
      try {
        await html2canvas(targetElement, {
          ignoreElements: (el) => {
            return el.id === "btn-share";
          },
          proxy: "https://htmlcanvas-proxy.getnimbus.io",
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
          a.download = "NFTHolding.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          triggerToast("Successfully downloaded!", "success");
        });
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        triggerToast(
          "Something wrong when download. Please try again!",
          "fail"
        );
      }
    }
  };
</script>

<div
  class="bg-[#E8F4EF] text-black relative pt-10 pb-20 overflow-hidden w-full min-h-screen flex"
  id="target-slide-2"
>
  <div class="flex-1 flex flex-col gap-20 h-full max-w-[1400px] m-auto">
    <img
      src={Logo}
      alt="logo"
      loading="lazy"
      decoding="async"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px] transform translate-x-2"
    />
    <div
      class="flex-1 h-full flex xl:flex-row flex-col xl:items-center justify-between gap-20 px-[35px]"
    >
      <div class="xl:flex-[0.3] flex-1 flex flex-col gap-7">
        <div class="flex flex-col gap-4">
          <div class="font-bold text-4xl">Your top collection</div>
          <div class="flex">
            {#each data?.top_collection || [] as item, index}
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
            {#if data?.stats?.total_collection === 0}
              <div
                class="flex items-center justify-center text-2xl bg-black text-white w-[74px] h-[74px] rounded-full border-3 border-white -ml-3"
              >
                0
              </div>
            {/if}
            {#if data?.stats?.total_collection !== 0 && data?.stats?.total_collection > 3}
              <div
                class="flex items-center justify-center text-2xl bg-black text-white w-[74px] h-[74px] rounded-full border-3 border-white -ml-3"
              >
                +{data?.stats?.total_collection - 3}
              </div>
            {/if}
          </div>
        </div>
        <div
          id="btn-share"
          class="bg-[#ffa41c] text-black p-4 flex items-center gap-4 text-2xl font-semibold rounded-[32px] w-max cursor-pointer relative z-20"
          on:click={downloadPage}
        >
          <div>Share</div>
          <img src={Share} alt="" />
        </div>
      </div>

      <div
        class="flex-1 py-[40px] px-[60px] min-h-[400px] rounded-[20px] bg-black flex flex-col gap-10"
      >
        {#if loading}
          <div class="flex justify-center items-center h-full h-[525px]">
            <Loading />
          </div>
        {:else if data?.stats?.total_holding === 0}
          <div class="text-[#B7B7B7] font-normal text-2xl text-center pt-20">
            You haven't collected any NFT, do you have any interesting thing?
          </div>
        {:else}
          <div
            class="flex lg:flex-row flex-col lg:items-center items-start gap-10"
          >
            <div class="flex flex-col">
              <div class="text-[#B7B7B7] font-normal text-2xl">NFT you own</div>
              <div class="text-white font-extrabold text-4xl">
                {data?.stats?.total_holding}
              </div>
            </div>

            <div class="flex flex-col">
              <div class="text-[#B7B7B7] font-normal text-2xl">Trades made</div>
              <div class="text-white font-extrabold text-4xl">
                {data?.stats?.total_trades}
              </div>
            </div>

            <div class="flex flex-col">
              <div class="text-[#B7B7B7] font-normal text-2xl">Net worth</div>
              <div
                class="flex items-center gap-1 text-white font-extrabold text-4xl"
              >
                <TooltipNumber
                  number={Number(data?.stats?.amount)}
                  type="amount"
                />
                SOL
              </div>
            </div>
          </div>
          <div class="flex justify-between gap-12">
            {#each data?.top_holding || [] as item}
              <NftCard data={item} />
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="absolute bottom-[0px] left-[-10px] z-10">
    <img src={SvgThree} alt="" />
  </div>

  <div class="absolute top-[-80px] right-[-80px] z-10">
    <img src={SvgOne} alt="" />
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
