<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation, Autoplay } from "swiper";
  SwiperCore.use([Pagination, Navigation, Autoplay]);

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import "swiper/swiper.scss";
  import "swiper/components/pagination/pagination.scss";
  import TokenHolding from "~/UI/Recap/TokenHolding.svelte";
  import Airdrop from "~/UI/Recap/Airdrop.svelte";
  import MintNft from "~/UI/Recap/MintNFT.svelte";
  import NftHolding from "~/UI/Recap/NFTHolding.svelte";
  import Promote from "~/UI/Recap/Promote.svelte";
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
          <TokenHolding />
        </SwiperSlide>

        <SwiperSlide>
          <NftHolding />
        </SwiperSlide>

        <SwiperSlide>
          <Airdrop />
        </SwiperSlide>

        <SwiperSlide>
          <MintNft />
        </SwiperSlide>

        <SwiperSlide>
          <Promote />
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</ErrorBoundary>

<style></style>
