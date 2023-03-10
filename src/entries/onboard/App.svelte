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
  const slides = [
    {
      title: "Welcome page",
    },
    {
      title: "Pin the extension",
    },
    {
      title: "Sidebar Search with command",
    },
    {
      title: "Highlight check the address/transaction",
    },
    {
      title: "Add an address to watch the portfolio",
    },
    {
      title: "Feedback is welcome (Email to subscribe)",
    },
  ];

  const slideToLast = () => {
    const lastSlideIndex = slides.length - 1;
    mySwiper.slideTo(lastSlideIndex);
  };
</script>

<div class="max-w-[2000px] m-auto w-[90%] h-full font-family">
  <Swiper
    cssMode={true}
    slidesPerView={1}
    on:swiper={(e) => (mySwiper = e.detail[0])}
    navigation={{
      nextEl: ".next",
    }}
    pagination={{ clickable: true, dynamicBullets: true }}
    on:activeIndexChange={(e) => (activeSlide = e.detail[0][0].activeIndex)}
  >
    {#each slides as item, index}
      <SwiperSlide>
        <div
          class="border-2 border-red-500 h-screen flex justify-center items-center"
        >
          <div class="flex flex-col gap-6">
            <div>{item.title}</div>
            {#if activeSlide === 0}
              <SlideOne />
            {:else if activeSlide === 1}
              <SlideTwo />
            {:else if activeSlide === 2}
              <SlideThree />
            {:else if activeSlide === 3}
              <SlideFour />
            {:else if activeSlide === 4}
              <SlideFive />
            {:else}
              <SlideSix />
            {/if}

            {#if index < 5}
              <div class="next cursor-pointer">
                {#if index === 0}
                  Get Started
                {:else}
                  Continue
                {/if}
              </div>
            {/if}

            {#if index > 0 && index < 5}
              <button on:click={slideToLast}>skip</button>
            {/if}

            {#if index === 5}
              <button>Open Nimbus</button>
            {/if}
          </div>
        </div>
      </SwiperSlide>
    {/each}
  </Swiper>
</div>

<style windi:preflights:global windi:safelist:global>
  .font-family {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,
      Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  }
</style>
