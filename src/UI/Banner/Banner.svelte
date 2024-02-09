<script>
  import { Link } from "svelte-navigator";
  import { isDarkMode } from "~/store";
</script>

<div
  class={`relative sticky top-0 left-0 gap-x-6 py-2.5 w-full ${
    $isDarkMode ? "bg-[#0f0f0f]" : "bg-[#F8F9FF]"
  }`}
  style="z-index: 99;"
>
  <div class="max-w-[2000px] m-auto w-[90%] isolate flex items-center">
    <div
      class="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      aria-hidden="true"
    >
      <div
        class="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
        style="clip-path: polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)"
      ></div>
    </div>
    <div
      class="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      aria-hidden="true"
    >
      <div
        class="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
        style="clip-path: polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)"
      ></div>
    </div>
    <div class="flex flex-wrap items-center gap-x-4 xl:gap-y-2 gap-y-3">
      <p class="xl:text-sm text-2xl xl:leading-6 leading-8">
        <strong class="font-semibold">
          <!-- <img
            src="https://lixi.aura.network/_next/static/media/logo.2ae31c42.svg"
            class="inline-block"
          /> -->
          Aura Network Airdrop</strong
        >
        <svg
          viewBox="0 0 2 2"
          class="mx-2 inline h-0.5 w-0.5 fill-current"
          aria-hidden="true"
        >
          <circle cx="1" cy="1" r="1" />
        </svg>Join Aura Year of Dragon's Lixi
      </p>
      <a
        href="https://twitter.com/get_nimbus/status/1755909540892028990"
        target="_blank"
      >
        <div
          class="flex-none rounded-full bg-[#ba0d10] xl:px-3.5 xl:py-1 px-4 py-2 xl:text-sm text-2xl font-semibold text-white shadow-sm"
        >
          Get my lucky money <span aria-hidden="true">&rarr;</span>
        </div>
      </a>
    </div>
  </div>
</div>

<style></style>
