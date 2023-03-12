<script>
  import { add3Dots } from "~/utils";

  import newImage from "~/assets/news.png";
  import logo from "~/assets/btc.png";
</script>

<div class="flex gap-6 xl:w-[570px] w-full">
  <div class="w-[250px] h-[160px] overflow-hidden rounded-[10px]">
    <img class="w-full h-full object-cover" src={newImage} alt="new" />
  </div>
  <div class="flex-1 flex flex-col justify-between">
    <div class="flex flex-col gap-4">
      <div class="text-xl font-bold cursor-pointer">
        Today’s Cryptocurrency Prices, Charts and Data
      </div>
      <div class="text-sm font-normal text-[#00000099]">
        {add3Dots(
          "Welcome to CoinMarketCap.com! This site was founded in May 2013 by Brandon Chez to provide up-to-date cryptocurrency prices, charts and data about the emerging cryptocurrency markets. Since then, the world of blockchain and cryptocurrency has grown exponentially and we are very proud to have grown with it. We take our data very seriously and we do not change our data to fit any narrative: we stand for accurately, timely and unbiased information.",
          80
        )}
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div
          class="flex items-center justyfy-center gap-2 px-2 py-1 text-base text-black bg-[#efaac433] rounded-[10px]"
        >
          <img src={logo} alt="logo" width="16" height="16" />
          Bitcoin
        </div>
        <div
          class="flex items-center justyfy-center gap-2 px-2 py-1 text-base text-black bg-[#efaac433] rounded-[10px]"
        >
          <img src={logo} alt="logo" width="16" height="16" />
          Ethereum
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
