<script lang="ts">
  import { Swiper, SwiperSlide } from "swiper/svelte";
  import SwiperCore, { Pagination, Navigation, Mousewheel } from "swiper";
  SwiperCore.use([Pagination, Navigation, Mousewheel]);

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
  <div class="px-10">
    <Swiper
      direction="vertical"
      mousewheel={true}
      cssMode={true}
      slidesPerView={1}
      speed={2000}
      pagination={{ clickable: true, dynamicBullets: true }}
      class="h-screen"
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
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
