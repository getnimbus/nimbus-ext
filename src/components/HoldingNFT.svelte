<script>
  import { useNavigate } from "svelte-navigator";
  import { formatCurrency, shorterName } from "~/utils";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import NFT from "~/assets/nimbus-nft.jpg";
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  const navigate = useNavigate();

  let showName = false;
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4">
    <div class="relative">
      <div
        class="text-black text-sm font-medium flex justify-start"
        on:mouseenter={() => (showName = true)}
        on:mouseleave={() => (showName = false)}
      >
        {shorterName("Gutter Punks Flyer - Meebits")}
      </div>
      {#if showName && "Gutter Punks Flyer - Meebits".length > 10}
        <div
          class="absolute -top-7 left-1/2 transform -translate-x-1/2"
          style="z-index: 2147483648;"
        >
          <tooltip-detail text={"Gutter Punks Flyer - Meebits"} />
        </div>
      {/if}
    </div>
  </td>

  <td class="py-4">
    <div class="flex justify-start">
      <img
        src={NFT}
        alt=""
        class="w-6 h-6 rounded-sm border border-gray-300 overflow-hidden"
      />
      <img
        src={NFT}
        alt=""
        class="w-6 h-6 rounded-sm border border-gray-300 overflow-hidden -ml-2"
      />
      <img
        src={NFT}
        alt=""
        class="w-6 h-6 rounded-sm border border-gray-300 overflow-hidden -ml-2"
      />
      <div class="relative w-6 h-6">
        <img
          src={NFT}
          alt=""
          class="w-6 h-6 rounded-sm border border-gray-300 overflow-hidden -ml-2"
        />
        <div
          class="absolute top-0 -left-2 w-full h-full bg-[#00000066] text-white text-center flex justify-center items-center pb-2 rounded-sm"
        >
          ...
        </div>
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">
      0 ETH | $0
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">0</div>
  </td>

  <td class="py-3 pr-3">
    <div class="flex items-center justify-end gap-1 text-sm">0</div>
  </td>
</tr>

<style>
</style>
