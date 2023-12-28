<script>
  import hero from "~/assets/recap/hero/Hero1.png";
  import heroMobile from "~/assets/recap/hero/bigHero.png";
  import bigHero from "~/assets/recap/hero/bigHero2.png";
  import price from "~/assets/recap/hero/price.png";
  import chart from "~/assets/recap/hero/chart.png";
  import toast from "~/assets/recap/hero/toast.png";

  import Button from "~/components/Button.svelte";
  // import arrowLight from "~/assets/recap/hero/Hero1.png"
  // import arrowDark from "~/assets/recap/hero/Hero1.png"
  const img = {
    hero: "/images/hero/Hero1.png",
    heroMobile: "/images/hero/bigHero.png",
    bigHero: "/images/hero/bigHero2.png",
    price: "/images/hero/price.png",
    chart: "/images/hero/chart.png",
    toast: "/images/hero/toast.png",
    arrowLight: "/images/icon/icon-arrow-light.svg",
    arrowDark: "/images/icon/icon-arrow-dark.svg",
  };
</script>

<div
  class="flex flex-col gap-20 h-full max-w-[2000px] m-auto w-[90%] pt-[35px] px-[35px]"
>
  <div class="flex items-center gap-20">
    <div class="flex flex-col gap-6 flex-[0.5]">
      <div class="text-4xl">A Personalized portfolio for Crypto investors</div>
      <div class="w-max">
        <Button>Launch app</Button>
      </div>
    </div>
    <div class="flex-1">image</div>
  </div>
  <div>Client's Testimonials</div>
  <div class="h-full px-4 2xl:px-40 xl:px-20 lg:px-10 sm:px-6">
    <div class="my-auto flex 2xl:justify-center lg:gap-5 xl:gap-30.5">
      <div class="w-full 3xl:w-2/5 lg:w-1/3 md:pt-10">
        <!-- {/* <h1 class="text-black dark:text-white text-lg font-medium mb-4.5">
              🔥 Solid is one of the best option for you.
            </h1> */} -->
        <div class="block mx-auto mb-10 md:hidden">
          <img src={img.heroMobile} alt="Hero" />
        </div>
        <div class="hidden relative md:block lg:hidden w-full h-[480px]">
          <img
            src={img.bigHero}
            alt="Hero"
            class="absolute top-0 right-0 w-5/6"
          />
          <img src={img.price} alt="price" class="absolute top-11 left-15" />
          <img
            src={img.chart}
            alt="chart"
            class=" absolute left-0 top-[9.75rem]"
          />
          <img src={img.toast} alt="toast" class="absolute left-36 bottom-8" />
        </div>
        <h1
          class="mb-5 text-2xl font-medium text-black lg:text-3xl sm:text-3xl dark:text-white xl:text-5xl"
        >
          A{" "}
          <span
            class="inline-block relative before:absolute before:bottom-2.5 before:left-0 before:w-full before:h-3 before:bg-titlebg dark:before:bg-titlebgdark before:-z-1"
          >
            Personalized
          </span>{" "}
          portfolio for Crypto investors
        </h1>
        <h2>
          Discover the power of tracking crypto with Nimbus. We provide
          real-time data and customized analysis to help you make informed
          decisions tailored to your unique portfolio.
        </h2>

        <div class="mt-10 h-[60px]">
          <a
            href="https://app.getnimbus.io/"
            class="inline-flex items-center gap-2.5 font-medium text-white dark:text-black bg-[#27326F] dark:bg-white rounded-full py-3 px-6"
          >
            Launch app
            <img src={img.arrowLight} alt="Arrow" class="hidden dark:block" />
            <img src={img.arrowDark} alt="Arrow" class="dark:hidden" />
          </a>
        </div>
      </div>
      <div class="hidden lg:w-2/3 3xl:w-2/5 lg:block">
        <div class="relative 2xl:-mr-7.5">
          <div
            class="block xl:hidden relative h-[600px] w-[600px] lg:translate-x-10"
          >
            <img src={img.hero} alt="Hero" class=" hero_img" />

            <img src={img.price} alt="price" class=" hero_price" />
            <img src={img.chart} alt="chart" class=" hero_chart" />
            <img
              src={img.toast}
              alt="toast"
              class=" hero_toast hero_toast_lg"
            />
          </div>
          <div class="hidden xl:block relative h-[700px] w-[1100px]">
            <img src={img.bigHero} alt="Hero" class="absolute top-0 right-0" />
            <img src={img.price} alt="price" class="absolute top-19 left-24" />
            <img
              src={img.chart}
              alt="chart"
              class=" absolute left-0 top-[20rem]"
            />
            <img
              src={img.toast}
              alt="toast"
              class="absolute left-[230px] bottom-15"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .hero_image {
    height: 480px;
    width: 720px;
    position: absolute;
    top: 0;
    right: 0;
  }

  .hero_price {
    position: absolute;
    top: 4rem;
    left: 2.5rem;
  }

  .hero_chart {
    position: absolute;
    left: 0;
    top: 16rem;
  }

  .hero_toast {
    position: absolute;
    left: 7rem;
    bottom: 3rem;
  }
</style>
