<svelte:options tag="address-info" />

<script>
  import { onMount } from "svelte";
  import detectEthereumProvider from "@metamask/detect-provider";
  import { formatBalance, formatCurrency } from "../../../utils";

  import "~/components/Loading.custom.svelte";
  import "~/components/Footer.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";

  import SmartContractIcon from "../assets/smart-contract.png";
  import MetaMaskIcon from "../assets/metamask-icon.png";
  import CoinMarketCapIcon from "../assets/CoinMarketCap_logo.png";
  import CoinGekoIcon from "../assets/coingecko-logo.png";
  import CoinDefaultIcon from "../assets/coin-default.svg";
  import { track } from "~/lib/data-tracking";
  import { nimbus } from "../../../lib/network";

  export let address;

  let isLoading = true;
  let balance = 0;
  let tokenList = [];
  let token = null;
  let unknownSmartContract = false;

  const loadUserAddressInfo = async () => {
    isLoading = true;

    // TODO: What if this is a smart contract or ERC20 a address
    const addressPortfolio = await nimbus
      .get(`/portfolio/${address}`)
      .then((response) => response.data.data);

    console.log(addressPortfolio);
    if (addressPortfolio) {
      balance = addressPortfolio.totalBalanceUsd;
      tokenList = addressPortfolio.assets;
    } else {
      unknownSmartContract = true;
    }
    isLoading = false;
  };

  onMount(() => {
    loadUserAddressInfo();
    track("Address Info", {
      url: window.location.href,
      address,
    });
  });

  const handleAddToken = async () => {
    if (!token) {
      // No token info
      return;
    }
    const provider = await detectEthereumProvider();
    if (provider && window.ethereum) {
      const wasAdded = await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.logo_url,
          },
        },
      });
      console.log(wasAdded);
    } else {
      // TODO: Show some toast to user
      console.log("Please install MetaMask!");
    }
  };
</script>

<reset-style>
  <div
    class={`rounded-lg bg-white shadow-xl font-sans text-sm text-gray-400 transition-all overflow-hidden min-w-[350px] max-w-[400px] max-h-[600px] ${
      isLoading && "w-[350px] max-w-[400px] max-h-[120px]"
    }`}
  >
    {#if isLoading}
      <!-- {#if false} -->
      <div class="w-full h-[120px] flex justify-center items-center">
        <loading-icon />
      </div>
    {/if}

    {#if balance}
      <div class="p-3">
        {#if balance}
          <div class="flex items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-[32px] h-[32px] mr-3 text-sky-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>

            <div class="flex flex-col">
              <div>Balance (Including all tokens in all chains)</div>
              <div class="font-bold">
                ${formatCurrency(balance)}
              </div>
            </div>
          </div>
        {/if}

        {#if tokenList.length}
          <div>
            <div class="font-bold my-1">Top assets</div>
            <div class="grid grid-cols-3 mb-1">
              <div class="p-1 border">Asset</div>
              <div class="p-1 text-right border">Balance</div>
              <div class="p-1 text-right border">Value</div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              {#each tokenList
                .sort((a, b) => Number(b.balanceUsd) - Number(a.balanceUsd))
                .slice(0, 5) as item}
                <div class="flex items-center px-1">
                  <img
                    src={item.thumbnail || CoinDefaultIcon}
                    alt=""
                    class="w-[20px] h-[20px] rounded-full mr-1"
                  />
                  {item.tokenSymbol}
                </div>
                <div class="text-right px-1">{formatBalance(item.balance)}</div>
                <div class="text-right px-1">
                  <strong>
                    ${formatCurrency(item.balanceUsd)}
                  </strong>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div class="flex justify-between gap-4 my-2">
          <!-- <div class="flex-1">
          <button
            class="btn-primary w-full"
            on:click={() =>
              window.open(`https://debank.com/profile/${address}`, "_blank")}
          >
            DeBank
          </button>
        </div> -->
          <div class="flex-1">
            <button
              class="btn-primary w-full"
              on:click={() =>
                window.open(
                  `https://etherscan.io/address/${address}`,
                  "_blank"
                )}
            >
              Etherscan
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if token}
      <div class="py-4 px-4">
        <coin-chart symbol={token.symbol} loaded={true} />
        <div class="text-center mt-2">
          <img
            class="w-[72px] h-[72px] rounded-full"
            src={token.logo_url || CoinDefaultIcon}
            alt={token.name}
          />
          <div>
            {token.name} - <span class="text-gray-400">{token.symbol}</span>
          </div>
          <div>
            Price: <strong>${formatCurrency(token.price)}</strong>
          </div>

          <price-convert symbol={token.symbol} price={token.price} />

          <div class="flex gap-4 justify-between items-center my-2">
            <div
              on:click={handleAddToken}
              class="flex items-center justyfy-center gap-1 btn-border px-3 py-1 text-sky-500 cursor-pointer"
            >
              <img src={MetaMaskIcon} width={14} height={14} alt="" /> Add to MetaMask
            </div>
            <div class="flex gap-2">
              <a
                href="https://coinmarketcap.com/currencies/bitcoin"
                target="blank"
              >
                <img src={CoinMarketCapIcon} width={22} height={22} alt="" />
              </a>
              <a
                href="https://www.coingecko.com/en/coins/bitcoin"
                target="blank"
              >
                <img src={CoinGekoIcon} width={22} height={22} alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if unknownSmartContract}
      <div class="p-4 flex flex-col gap-4">
        <div class="text-center">
          <img
            class="w-[64px] h-auto my-[20px] mx-auto"
            src={SmartContractIcon}
            width={50}
            alt=""
          />
          <div>SmartContract info will be supported soon</div>
        </div>
        <button
          class="btn-primary w-full"
          on:click={() =>
            window.open(`https://etherscan.io/address/${address}`, "_blank")}
        >
          Etherscan
        </button>
      </div>
    {/if}

    <!-- <nimbus-footer>
    <div class="text-xs">
      Data from <a href="https://debank.com" target="blank"
        >https://debank.com</a
      >
    </div>
  </nimbus-footer> -->
  </div>
</reset-style>

<!-- NOTICE: You need to add below script to use tailwind -->
<style>
  .btn-border {
    border: 1px solid #0ea5e9;
  }
  .border {
    border: 1px solid #e5e7eb;
  }
</style>
