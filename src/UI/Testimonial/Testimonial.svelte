<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation, Autoplay } from "swiper";
  SwiperCore.use([Pagination, Navigation, Autoplay]);

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import SlideOne from "./SlideOne.svelte";
  import SlideTwo from "./SlideTwo.svelte";
  import SlideThree from "./SlideThree.svelte";
  import SlideFour from "./SlideFour.svelte";

  import "swiper/swiper.scss";
  import "swiper/components/pagination/pagination.scss";
</script>

<ErrorBoundary>
  <div class="flex flex-col items-center gap-5">
    <Loading />
    <div class="mx-auto max-w-2xl mt-5">
      <Swiper
        cssMode={true}
        slidesPerView={1}
        speed={2000}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{
          delay: 7000,
        }}
        loop={true}
      >
        <SwiperSlide>
          <SlideOne />
        </SwiperSlide>

        <SwiperSlide>
          <SlideTwo />
        </SwiperSlide>

        <SwiperSlide>
          <SlideThree />
        </SwiperSlide>

        <SwiperSlide>
          <SlideFour />
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</ErrorBoundary>

<style></style>
