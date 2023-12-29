<script>
  import heroImage from "~/assets/recap/hero/heroimage.png";
</script>

<div
  class="flex flex-col gap-10 h-full max-w-[2000px] m-auto w-[90%] pt-[35px] px-[35px]"
>
  <div class="flex items-start xl:gap-16 gap-8">
    <div class="flex flex-col gap-6 mt-[5vh] flex-[0.5]">
      <div class="font-medium text-3xl xl:text-4xl">
        A Personalized portfolio for Crypto investors
      </div>
      <div class="w-max">
        <button class="rounded-full bg-[#00BDD6] py-3 px-5 text-white">
          Launch app
        </button>
      </div>
    </div>
    <div class="flex-1">
      <img src={heroImage} alt="" class="object-contain w-full" />
    </div>
  </div>

  <div>
    <div class="mx-auto text-center w-full mb-6">
      <div class="mx-auto bg-[#edf5ff] w-max rounded-full py-1.5 px-4.5 mb-2">
        <div class="font-medium">TESTIMONIALS</div>
      </div>
      <div class="font-medium text-3xl xl:text-4xl mx-auto mb-3">
        Client's Testimonials
      </div>
      <div class="mx-auto md:w-4/5 lg:w-3/5 xl:w-[46%]">
        Words from who has used Nimbus and enjoy getting more profit
      </div>
    </div>
    <div class="mx-auto">
      <div
        class="shoutout-embed"
        data-widgetTitle="A personalized portfolio for Web3 investor"
        data-widgetId="17e2e05a-623b-4e59-9da0-4df04afd9fd3"
      ></div>

      <script src="https://shoutout.io/static/website/js/embed.js"></script>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
