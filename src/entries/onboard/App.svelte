<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation } from "swiper";
  SwiperCore.use([Pagination, Navigation]);

  import SlideOne from "~/components/OnboardUI/SlideOne.svelte";
  import SlideTwo from "~/components/OnboardUI/SlideTwo.svelte";
  import SlideThree from "~/components/OnboardUI/SlideThree.svelte";
  import SlideFour from "~/components/OnboardUI/SlideFour.svelte";
  import SlideFive from "~/components/OnboardUI/SlideFive.svelte";
  import SlideSix from "~/components/OnboardUI/SlideSix.svelte";

  import "swiper/swiper.scss";
  import "swiper/components/pagination/pagination.scss";

  let mySwiper;
  let activeSlide = 0;

  const slideToLast = () => {
    const lastSlideIndex = 6 - 1;
    mySwiper.slideTo(lastSlideIndex);
  };
</script>

<div class="max-w-[2000px] m-auto w-[90%] h-full font-family">
  <Swiper
    cssMode={true}
    slidesPerView={1}
    speed={2000}
    on:swiper={(e) => (mySwiper = e.detail[0])}
    navigation={{
      nextEl: ".next",
    }}
    pagination={{ clickable: false, dynamicBullets: true }}
    on:activeIndexChange={(e) => (activeSlide = e.detail[0][0].activeIndex)}
  >
    <SwiperSlide>
      <SlideOne />
    </SwiperSlide>

    <SwiperSlide>
      <SlideTwo skip={slideToLast} />
    </SwiperSlide>

    <SwiperSlide>
      <SlideThree skip={slideToLast} />
    </SwiperSlide>

    <SwiperSlide>
      <SlideFour skip={slideToLast} />
    </SwiperSlide>

    <SwiperSlide>
      <SlideFive skip={slideToLast} />
    </SwiperSlide>

    <SwiperSlide>
      <SlideSix />
    </SwiperSlide>
  </Swiper>
</div>

<style windi:preflights:global windi:safelist:global>
  .font-family {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,
      Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  }
</style>
