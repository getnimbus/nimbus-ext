<script>
  import mixpanel from "mixpanel-browser";
  import heroImage from "~/assets/recap/hero/heroimage.png";
  import Arrow from "~/assets/recap/hero/arrow-right.svg";
  import SvgOne from "~/assets/recap/hero/svgOne.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
</script>

<div class="relative overflow-hidden bg-white text-black">
  <div
    class="flex flex-col gap-10 h-full max-w-[1400px] m-auto pt-10 pb-20 px-[35px]"
  >
    <div class="flex items-start xl:flex-row flex-col gap-8">
      <div class="flex flex-col items-start gap-6 xl:flex-[0.5] flex-1 w-full">
        <div class="font-bold text-5xl">
          A Personalized portfolio for Crypto investors
        </div>
        <div
          class="w-max flex items-center justify-center gap-2 cursor-pointer p-[20px] rounded-[32px] min-w-[250px] bg-[#A7EB50] text-black text-2xl font-semibold"
          on:click={() => {
            mixpanel.track("recap_launch_app");
            window.open("https://app.getnimbus.io/", "_blank");
          }}
        >
          Launch app
          <img src={Arrow} alt="" />
        </div>
        <div class="flex flex-row gap-3">
          Community
          <a target="_blank" href="https://discord.gg/u5b9dTrSTr">
            <img
              alt="link Discord"
              loading="lazy"
              width="30"
              height="30"
              decoding="async"
              data-nimg="1"
              style="color:transparent"
              src="https://getnimbus.io/logoSocialMedia/discord.svg"
            />
          </a>
          <a target="_blank" href="https://t.me/getnimbus">
            <img
              alt="link Telegram"
              loading="lazy"
              width="30"
              height="30"
              decoding="async"
              data-nimg="1"
              style="color:transparent"
              src="https://getnimbus.io/logoSocialMedia/telegram.svg"
            />
          </a>
          <a target="_blank" href="https://twitter.com/get_nimbus">
            <img
              alt="link Twitter"
              loading="lazy"
              width="30"
              height="30"
              decoding="async"
              data-nimg="1"
              class="w-[26px] h-[26px]"
              style="color:transparent"
              src="https://getnimbus.io/logoSocialMedia/twitterX1.svg"
            />
          </a>
        </div>
      </div>
      <div class="flex-1 relative z-20">
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
        >
          <iframe
            src="https://shoutout.io/embed/17e2e05a-623b-4e59-9da0-4df04afd9fd3/"
            frameborder="0"
            title="Shoutout.io testimonial embed"
            scrolling="no"
            id="shoutout-iframe-17e2e05a-623b-4e59-9da0-4df04afd9fd3-0"
            width="100%"
            style="outline: none; opacity: 1; overflow: hidden; height: 1667px;"
          ></iframe>
        </div>

        <!-- <script src="https://shoutout.io/static/website/js/embed.js"></script> -->
      </div>
    </div>
  </div>

  <div class="absolute top-[-100px] right-[-100px] z-10">
    <img src={SvgOne} alt="" class="w-full h-full object-contain" />
  </div>

  <div class="absolute bottom-[-90px] left-[-120px] z-10">
    <img src={SvgTwo} alt="" class="w-full h-full object-contain" />
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
