<script>
  import { isDarkMode } from "~/store";

  import goldImg from "~/assets/Gold4.svg";
</script>

<div
  class={`relative absolute top-0 left-0 gap-x-6 py-2.5 w-full z-9 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#F8F9FF]"
  }`}
>
  <!-- <div class="max-w-[2000px] m-auto w-full isolate">
    <div class="marquee flex flex-wrap items-center gap-x-4 xl:gap-y-2 gap-y-1">
      <div
        class="marquee-1 xl:text-sm xl:leading-6 text-base flex xl:gap-0 gap-2"
      >
        <div class="flex items-center tracking-widest whitespace-nowrap">
          <strong class="font-semibold flex items-center gap-1">
            Join Nimbus Airdrops and collect GM points
          </strong>
          <svg
            viewBox="0 0 2 2"
            class="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx="1" cy="1" r="1" />
          </svg>
        </div>

        <div class="flex items-center gap-1 tracking-widest whitespace-nowrap">
          Win $TON, limited-edition GM Zodiac Element Box NFTs - and more!
        </div>
      </div>
    </div>
  </div> -->

  <div class="max-w-[2000px] m-auto w-full isolate w-[90%]">
    <div class="flex flex-wrap items-center gap-x-4 xl:gap-y-2 gap-y-1">
      <div
        class="xl:text-sm xl:leading-6 text-base flex xl:items-center xl:flex-row flex-col gap-2"
      >
        <div>
          <strong> Join Nimbus Airdrops and collect GM points </strong>
          <svg
            viewBox="0 0 2 2"
            class="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx="1" cy="1" r="1" />
          </svg>
          Win $TON, limited edition GM Zodiac Element Box NFTs and more
        </div>

        <a href="https://airdrop.getnimbus.io/" target="_blank">
          <div
            class="w-max flex-none rounded-full bg-[#ba0d10] xl:px-3.5 xl:py-1 px-4 py-2 xl:text-sm text-base font-semibold text-white shadow-sm"
          >
            Join our campaign <span aria-hidden="true">&rarr;</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .marquee {
    height: 20px;
    overflow: hidden;
    position: relative;
  }

  .marquee-1 {
    position: absolute;
    height: 100%;
    -moz-transform: translateX(100%);
    -webkit-transform: translateX(100%);
    transform: translateX(100%);
    -moz-animation: scroll-left 2s linear infinite;
    -webkit-animation: scroll-left 2s linear infinite;
    animation: scroll-left 20s linear infinite;
  }

  @-moz-keyframes scroll-left {
    0% {
      -moz-transform: translateX(200%);
    }
    100% {
      -moz-transform: translateX(-100%);
    }
  }

  @-webkit-keyframes scroll-left {
    0% {
      -webkit-transform: translateX(200%);
    }
    100% {
      -webkit-transform: translateX(-100%);
    }
  }

  @keyframes scroll-left {
    0% {
      -moz-transform: translateX(200%);
      -webkit-transform: translateX(200%);
      transform: translateX(200%);
    }
    100% {
      -moz-transform: translateX(-100%);
      -webkit-transform: translateX(-100%);
      transform: translateX(-100%);
    }
  }
</style>
