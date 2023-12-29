<script>
  import hero from "~/assets/recap/hero/Hero1.png";
  import heroMobile from "~/assets/recap/hero/bigHero.png";
  import bigHero from "~/assets/recap/hero/bigHero2.png";
  import price from "~/assets/recap/hero/price.png";
  import chart from "~/assets/recap/hero/chart.png";
  import toast from "~/assets/recap/hero/toast.png";

  import heroImage from "~/assets/recap/hero/heroimage.png";

  import Button from "~/components/Button.svelte";
</script>

<div
  class="flex flex-col gap-20 h-full max-w-[2000px] m-auto w-[90%] pt-[35px] px-[35px] h-screen overflow-hidden"
>
  <div class="flex items-start gap-16">
    <div class="flex flex-col gap-6 mt-12 flex-[0.5]">
      <div class="text-4xl">A Personalized portfolio for Crypto investors</div>
      <div class="w-max">
        <button class="rounded-full bg-[#00BDD6] py-3 px-5 text-white">
          Launch app
        </button>
      </div>
    </div>
    <div class="flex-1">
      <img src={heroImage} alt="" class="object-contain w-full" />
    </div>
  </div>
  <div>
    <div>
      <div class="px-4 2xl:px-40 xl:px-20 lg:px-10 sm:px-6 wripperClass">
        <div class="mx-auto text-center animate_top">
          <div class="w-full mb-20">
            <div class="inline-block rounded-full py-1.5 px-4.5 mb-4">
              <h4 class="font-medium text-sectiontitle">TESTIMONIALS</h4>
            </div>
            <h2
              class="font-medium text-3xl w-full xl:text-sectiontitle3 md:w-4/5 xl:w-1/2 mx-auto mb-4"
            >
              Client's Testimonials
            </h2>
            <p class="mx-auto md:w-4/5 lg:w-3/5 xl:w-[46%]">
              Words from who has used Nimbus and enjoy getting more profit
            </p>
          </div>
        </div>
      </div>
      <div
        class="px-4 mx-auto animate_top max-w-c-1235 md:px-8 xl:px-0 mt-15 xl:mt-20"
      >
        <div
          class="shoutout-embed"
          data-widgetTitle="A personalized portfolio for Web3 investor"
          data-widgetId="17e2e05a-623b-4e59-9da0-4df04afd9fd3"
        ></div>

        <script src="https://shoutout.io/static/website/js/embed.js"></script>

        <div
          class="mt-2 trustpilot-widget"
          data-locale="en-US"
          data-template-id="56278e9abfbbba0bdcd568bc"
          data-businessunit-id="652409e8ed1cb54c7241bcd2"
          data-style-height="52px"
          data-style-width="100%"
        >
          <a
            href="https://www.trustpilot.com/review/getnimbus.io"
            target="_blank"
            rel="noopener"
          >
            Trustpilot
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  .text-sectiontitle {
    font-size: 14px;
    line-height: 22px;
  }
  @media (min-width: 1280px) {
    .xl\:text-sectiontitle3 {
      font-size: 48px;
      line-height: 50px;
    }
  }
</style>
