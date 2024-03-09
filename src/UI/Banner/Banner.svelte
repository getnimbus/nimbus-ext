<script>
  import { isDarkMode } from "~/store";

  import goldImg from "~/assets/Gold4.svg";
</script>

<div
  class={`relative sticky top-0 left-0 gap-x-6 py-2.5 w-full ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#F8F9FF]"
  }`}
  style="z-index: 10;"
>
  <div class="max-w-[2000px] m-auto w-[90%] isolate">
    <div class="marquee flex flex-wrap items-center gap-x-4 xl:gap-y-2 gap-y-3">
      <div
        class="marquee-1 xl:text-sm text-2xl xl:leading-6 leading-8 flex xl:flex-row flex-col xl:gap-0 gap-2 xl:items-center items-start"
      >
        <div class="flex items-center">
          <strong class="font-semibold flex items-center gap-1"
            >Swap And Get <img src={goldImg} alt="" class="w-[18px] h-[18px]" />
            GM Points</strong
          >
          <svg
            viewBox="0 0 2 2"
            class="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx="1" cy="1" r="1" />
          </svg>
        </div>

        <div class="flex flex-wrap items-center gap-1">
          Click <div
            class="rounded-md w-[24px] h-[24px] p-2 flex justify-center items-center bg-[#a6b0c3]"
          >
            <div class="transform rotate-90">
              <svg
                width="22"
                height="22"
                viewBox="0 0 21 22"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M6.51043 7.47998V14.99H7.77043V7.47998L9.66043 9.36998L10.5505 8.47994L7.5859 5.51453C7.3398 5.26925 6.94114 5.26925 6.69504 5.51453L3.73047 8.47994L4.62051 9.36998L6.51043 7.47998Z"
                  fill="white"
                ></path><path
                  d="M14.4902 14.52V7.01001H13.2302V14.52L11.3402 12.63L10.4502 13.5201L13.4148 16.4855C13.6609 16.7308 14.0595 16.7308 14.3056 16.4855L17.2702 13.5201L16.3802 12.63L14.4902 14.52Z"
                  fill="white"
                ></path></svg
              >
            </div>
          </div>
          on you token holding bellow and start swap to Get<img
            src={goldImg}
            alt=""
            class="w-[18px] h-[18px]"
          /> 5 GM Points for every $1 swap
        </div>
      </div>

      <!-- <a
        href="https://twitter.com/get_nimbus/status/1755909540892028990"
        target="_blank"
      >
        <div
          class="flex-none rounded-full bg-[#ba0d10] xl:px-3.5 xl:py-1 px-4 py-2 xl:text-sm text-2xl font-semibold text-white shadow-sm"
        >
          Get my lucky money <span aria-hidden="true">&rarr;</span>
        </div>
      </a> -->
    </div>
  </div>
</div>

<style>
  .marquee {
    height: 50px;
    overflow: hidden;
    position: relative;
  }

  .marquee-1 {
    position: absolute;
    height: 50px;

    -moz-transform: translateX(100%);
    -webkit-transform: translateX(100%);
    transform: translateX(100%);
    -moz-animation: scroll-left 2s linear infinite;
    -webkit-animation: scroll-left 2s linear infinite;
    animation: scroll-left 20s linear infinite;
  }

  @-moz-keyframes scroll-left {
    0% {
      -moz-transform: translateX(100%);
    }
    100% {
      -moz-transform: translateX(-100%);
    }
  }

  @-webkit-keyframes scroll-left {
    0% {
      -webkit-transform: translateX(100%);
    }
    100% {
      -webkit-transform: translateX(-100%);
    }
  }

  @keyframes scroll-left {
    0% {
      -moz-transform: translateX(100%);
      -webkit-transform: translateX(100%);
      transform: translateX(100%);
    }
    100% {
      -moz-transform: translateX(-100%);
      -webkit-transform: translateX(-100%);
      transform: translateX(-100%);
    }
  }
</style>
