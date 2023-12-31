<script>
  import heroImage from "~/assets/recap/hero/heroimage.png";
  import Arrow from "~/assets/recap/hero/arrow-right.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
</script>

<div class="relative overflow-hidden bg-white text-black">
  <div
    class="flex flex-col gap-10 h-full max-w-[2000px] m-auto w-[90%] pt-10 pb-20"
  >
    <div class="flex items-start xl:flex-row flex-col gap-8">
      <div class="flex flex-col items-start gap-6 xl:flex-[0.5] flex-1 w-full">
        <div class="font-bold text-5xl">
          A Personalized portfolio for Crypto investors
        </div>
        <div
          class="w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black text-2xl font-semibold"
          on:click={() => {
            window.open("https://app.getnimbus.io/", "_blank");
          }}
        >
          Launch app
          <img src={Arrow} alt="" />
        </div>
      </div>
      <div class="flex-1">
        <img src={heroImage} alt="" class="object-cover w-full h-full" />
      </div>
    </div>

    <div>
      <div class="mx-auto text-center w-full mb-6">
        <div class="font-bold text-5xl mx-auto mb-3">Client's Testimonials</div>
        <div class="text-2xl mx-auto">
          Words from who has used Nimbus and enjoy getting more profit
        </div>
      </div>
      <div class="mx-auto">
        <div
          class="shoutout-embed"
          data-widgetTitle="A personalized portfolio for Web3 investor"
          data-widgetId="17e2e05a-623b-4e59-9da0-4df04afd9fd3"
        ></div>

        <script src="https://shoutout.io/static/website/js/embed.js"></script>
      </div>
    </div>
  </div>

  <div class="absolute top-[-100px] right-[-100px]">
    <img src={SvgOne} alt="" class="w-full h-full object-contain" />
  </div>

  <div class="absolute bottom-[-90px] left-[-120px]">
    <img src={SvgTwo} alt="" class="w-full h-full object-contain" />
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
