<script lang="ts">
  import FlipCoin from "~/components/SUI Campaign/FlipCoinGame/FlipCoin.svelte";
  import History from "~/components/SUI Campaign/FlipCoinGame/History.svelte";
  import QnA from "~/components/SUI Campaign/FlipCoinGame/QnA.svelte";
</script>

<div class="flex flex-col gap-8">
  <FlipCoin />
  <div class="grid xl:grid-cols-2 gap-8">
    <QnA />
    <History />
  </div>
</div>

<style></style>
