<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { isDarkMode, typeWallet, wallet, chain } from "~/store";

  import AnalyticSection from "~/components/AnalyticSection.svelte";
  import LoadingPremium from "~/components/LoadingPremium.svelte";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  const typeChart = [
    {
      label: "Value",
      value: "value",
    },
    {
      label: "Percent",
      value: "percent",
    },
  ];
</script>

<AnalyticSection>
  <span slot="title">
    <div class="flex justify-start text-4xl font-medium xl:text-2xl">
      Closed Positions
    </div>
  </span>

  <span slot="overview">hello</span>

  <span slot="chart">hello</span>
</AnalyticSection>

<style windi:preflights:global windi:safelist:global>
</style>
