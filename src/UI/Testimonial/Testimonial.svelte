<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation } from "swiper";
  SwiperCore.use([Pagination, Navigation]);

  import SlideOne from "./SlideOne.svelte";
  import SlideTwo from "./SlideTwo.svelte";

  import "swiper/swiper.scss";
  import "swiper/components/pagination/pagination.scss";
</script>

<div class="flex flex-col items-center gap-5">
  <loading-icon />
  <!-- <div class="flex justify-center text-2xl font-medium">
    It May Take a Few Seconds to Sync your wallet address
  </div> -->
  <div class="mx-auto max-w-2xl mt-5">
    <Swiper
      cssMode={true}
      slidesPerView={1}
      speed={2000}
      pagination={{ clickable: true, dynamicBullets: true }}
    >
      <SwiperSlide>
        <SlideOne />
      </SwiperSlide>
      <!-- 
      <SwiperSlide>
        <SlideTwo />
      </SwiperSlide> -->
    </Swiper>
  </div>
</div>

<style></style>
