<script lang="ts">
  import { Link } from "svelte-navigator";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import CountUpNumber from "../CountUpNumber.svelte";
  import NftCard from "../NFTCard.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto w-[82%]">
      <div class="flex flex-col gap-14 mb-5">
        <div class="flex justify-between items-center">
          <Link
            to={`${
              APP_TYPE.TYPE === "EXT" ? "src/entries/newTab/index.html" : "/"
            }`}
            class="cusor-pointer"
          >
            <div class="text-white flex items-center gap-1">
              <img src={LeftArrow} alt="" />
              <div>Back to Portfolio</div>
            </div>
          </Link>
        </div>
        <div class="text-3xl font-semibold text-white">Art Blocks</div>
      </div>
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-1 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              Items & Holders
            </div>
            <div class="text-3xl text-black">
              <CountUpNumber id="Items" number={14932} format={0} />
              <span class="text-xl text-gray-500">Items</span>
            </div>
            <div class="text-3xl text-black">
              <CountUpNumber id="Holders" number={4869} format={0} />
              <span class="text-xl text-gray-500">Holders</span>
            </div>
          </div>
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-1 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              24-hour Volume
            </div>
            <div class="text-3xl text-black">
              <CountUpNumber
                id="24h_volume"
                number={6.9308}
                format={8}
                type="amount"
              />
              <span class="text-xl text-gray-500">ETH</span>
            </div>
          </div>
        </div>
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-1 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              24-hour Avg Price
            </div>
            <div class="text-3xl text-black">
              <CountUpNumber
                id="24h_avg_price"
                number={0.3465}
                format={8}
                type="amount"
              />
              <span class="text-xl text-gray-500">ETH</span>
            </div>
          </div>
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-1 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              Active Takers
            </div>
            <div class="text-3xl text-black">
              <CountUpNumber id="Active" number={2034} format={0} />
            </div>
            <div class="text-3xl text-black">
              $<CountUpNumber id="Price" number={367326120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-[2000px] m-auto w-[90%] -mt-26">
    <div
      class="flex flex-col gap-7 bg-white rounded-[20px] p-8 mt-6"
      style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
    >
      <div class="border border-[#0000001a] rounded-[20px] p-6">
        <div class="flex flex-col gap-6">
          <div class="text-2xl font-medium text-black">List NFT</div>
          <div class="grid xl:grid-cols-5 lg:grid-cols-4 gap-6">
            {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as item}
              <NftCard />
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }
</style>
