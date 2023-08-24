<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation } from "swiper";
  SwiperCore.use([Pagination, Navigation]);

  import SlideOne from "~/UI/Onboard/SlideOne.svelte";
  import SlideTwo from "~/UI/Onboard/SlideTwo.svelte";
  import SlideThree from "~/UI/Onboard/SlideThree.svelte";
  import SlideFour from "~/UI/Onboard/SlideFour.svelte";
  import SlideFive from "~/UI/Onboard/SlideFive.svelte";

  import "swiper/swiper.scss";
  import "swiper/components/pagination/pagination.scss";

  let mySwiper;
  let activeSlide = 0;

  const slideToLast = () => {
    const lastSlideIndex = 6 - 1;
    mySwiper.slideTo(lastSlideIndex);
  };
</script>

<div class="max-w-[2000px] m-auto w-[90%] h-full">
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
      <SlideFive />
    </SwiperSlide>
  </Swiper>
</div>

<style global windi:preflights:global windi:safelist:global>
  :global(body) {
    background-color: white;
    color: black;
    transition: background-color 0.3s;
  }
  :global(body.dark) {
    background-color: #1f1c3e;
    color: #fff;
  }

  :global(body) .footer {
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 40px;
  }
  :global(body.dark) .footer {
    background: #110c2a;
    box-shadow: rgba(0, 0, 0, 1) 0px 0px 5px;
  }

  :global(body) .bg_f4f5f8 {
    background: #f4f5f8;
  }
  :global(body.dark) .bg_f4f5f8 {
    background: #000;
  }

  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #00000033;
  }

  :global(body) .text_00000080 {
    color: #00000080;
  }
  :global(body.dark) .text_00000080 {
    color: #d1d5db;
  }

  :global(body) .text_27326F {
    color: #27326f;
  }
  :global(body.dark) .text_27326F {
    color: #3b82f6;
  }

  :global(body) .text_00000099 {
    color: #00000099;
  }
  :global(body.dark) .text_00000099 {
    color: #ccc;
  }

  :global(body) .text_00000066 {
    color: #00000099;
  }
  :global(body.dark) .text_00000066 {
    color: #cdcdcd;
  }

  :global(body) .border_0000001a {
    border-color: #0000001a;
  }
  :global(body.dark) .border_0000001a {
    border-color: #cdcdcd59;
  }

  :global(body) .border_0000000d {
    border-color: #0000000d;
  }
  :global(body.dark) .border_0000000d {
    border-color: #cdcdcd26;
  }
</style>
