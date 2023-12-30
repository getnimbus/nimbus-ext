<script>
  import Logo from "~/assets/logo-1.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
</script>

<div
  class="bg-[#E8F4EF] pt-10 pb-20 overflow-hidden w-full h-screen"
  id="target-slide-4"
>
  <div
    class="relative flex flex-col gap-20 h-full max-w-[2400px] m-auto w-[96%]"
  >
    <img
      src={Logo}
      alt="logo"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
    />
    <div class="flex-1 h-full px-[35px]">
      <div>This is AirDrop</div>
    </div>

    <div class="absolute bottom-[-125px] left-[-145px] z-10 rotate-93_74">
      <img src={SvgTwo} alt="" />
    </div>

    <div class="absolute top-[-175px] right-[-120px] z-10 rotate-131_26">
      <img src={SvgTwo} alt="" class="" />
    </div>
  </div>
</div>

<style>
  .rotate-131_26 {
    transform: rotate(-131.26deg);
  }

  .rotate-93_74 {
    transform: rotate(93.74deg);
  }
</style>
