<script lang="ts">
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { typeWallet, wallet, isDarkMode } from "~/store";
  import { detectedChain, getAddressContext, shorterName } from "~/utils";
  import tooltip from "~/entries/contentScript/views/tooltip";

  export let data;
  export let totalNetWorth;

  let typeWalletAddress = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let selectedWallet = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;

  $: amountChange =
    Number(data?.price?.price) === 0
      ? 0
      : (totalNetWorth * (Number(data?.ratio) / 100)) /
        Number(data?.price?.price);

  $: valueChange = totalNetWorth * (Number(data?.ratio) / 100);
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 xl:w-[230px] w-[280px] ${
      darkMode
        ? "bg-[#131313] group-hover:bg-[#00000033]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left flex items-center gap-3">
      <div class="relative">
        <img
          src={data.logo}
          alt=""
          width="30"
          height="30"
          class="rounded-full"
        />
        {#if getAddressContext(selectedWallet)?.type !== "BTC" && typeWalletAddress === "DEX"}
          <div class="absolute -top-2 -right-1">
            <img
              src={detectedChain(data.chain)}
              alt=""
              width="15"
              height="15"
              class="rounded-full"
            />
          </div>
        {/if}
      </div>
      <div class="flex flex-col gap-1">
        <div
          class=" xl:text-sm text-xl font-medium relative"
          on:mouseover={() => {
            isShowTooltipName = true;
          }}
          on:mouseleave={() => (isShowTooltipName = false)}
        >
          {#if data.name === undefined}
            N/A
          {:else}
            {data?.name?.length > 20 ? shorterName(data.name, 20) : data.name}
          {/if}
          {#if isShowTooltipName && data?.name?.length > 20}
            <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
              <tooltip-detail text={data.name} />
            </div>
          {/if}
        </div>
        <div
          class="text_00000080 text-xs font-medium relative"
          on:mouseover={() => {
            isShowTooltipSymbol = true;
          }}
          on:mouseleave={() => (isShowTooltipSymbol = false)}
        >
          {#if data.symbol === undefined}
            N/A
          {:else}
            {shorterName(data.symbol, 20)}
          {/if}
          {#if isShowTooltipSymbol && data.symbol.length > 20}
            <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
              <tooltip-detail text={data.symbol} />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-xl ttext_00000099 font-medium flex justify-end">
      $<TooltipNumber number={data?.price?.price} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end">
      <div
        class={`xl:text-sm text-xl font-medium w-max ${
          amountChange === 0
            ? "text_00000099"
            : amountChange > 0
            ? "text-[#00A878]"
            : "text-red-500"
        } font-medium`}
        use:tooltip={{
          content: `<tooltip-detail text="${
            data?.ratio > 0 ? "+" : ""
          }${amountChange}" />`,
          allowHTML: true,
          placement: "top",
          interactive: true,
        }}
      >
        {amountChange > 0 ? "+" : ""}<TooltipNumber
          number={amountChange}
          type="balance"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end">
      <div
        class={`xl:text-sm text-xl font-medium  ${
          valueChange === 0
            ? "text_00000099"
            : valueChange > 0
            ? "text-[#00A878]"
            : "text-red-500"
        }`}
        use:tooltip={{
          content: `<tooltip-detail text="$${
            valueChange > 0 ? "+" : ""
          }${valueChange}" />`,
          allowHTML: true,
          placement: "top",
          interactive: true,
        }}
      >
        {valueChange === 0 ? "" : valueChange >= 0 ? "+" : "-"}<TooltipNumber
          number={Math.abs(valueChange)}
          type="value"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end">
      <div
        class={`xl:text-sm text-xl w-max ${
          data?.ratio === 0
            ? "text_00000099"
            : data?.ratio > 0
            ? "text-[#00A878]"
            : "text-red-500"
        } font-medium`}
        use:tooltip={{
          content: `<tooltip-detail text="${data?.ratio > 0 ? "+" : ""}${
            data?.ratio
          }%" />`,
          allowHTML: true,
          placement: "top",
          interactive: true,
        }}
      >
        {data?.ratio > 0 ? "+" : ""}<TooltipNumber
          number={data?.ratio}
          type="percent"
        />%
      </div>
    </div>
  </td>
</tr>

<style></style>
