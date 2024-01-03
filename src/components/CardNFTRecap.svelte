<script>
  import TooltipNumber from "./TooltipNumber.svelte";

  import NFTBonlzila from "~/assets/recap/nft/sol-bonkzila.png";
  import NFTExplorer from "~/assets/recap/nft/sol-explorer.png";
  import NFTHolder from "~/assets/recap/nft/sol-holder.jpg";

  export let data;

  let NFT =
    "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384";

  const formatData = (label) => {
    switch (label) {
      case "Fock it":
        NFT =
          data?.madLadsCollection?.tokens?.[0]?.imageUrl ||
          data?.madLadsCollection?.collection?.imageUrl;
        break;
      case "Bonk Friend":
        NFT = NFTBonlzila;
        break;
      case "SOL Explorer":
        NFT = NFTExplorer;
        break;
      case "True Holder":
        NFT = NFTHolder;
        break;
    }
  };

  $: {
    if (data && Object.keys(data).length !== 0) {
      formatData(data?.summaryLabel);
    }
  }
</script>

<div class="card-container">
  <div class="card-img-wrapper">
    <img src={NFT} class="card-img" alt="" />
    <div class="card-info-wrapper">
      <div class="tag">
        <div class="card-state">{data?.summaryLabel || ""}</div>
        <div class="card-state">My 2023</div>
      </div>
    </div>
  </div>
  <div class="card-content">
    <div class="statistics-card-content-wrapper">
      <div class="flex items-center gap-1">
        {#if data?.summaryLabel === "Fock it"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#4069E5]"></div>
        {:else if data?.summaryLabel === "Bonk Friend"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#ED7D2D]"></div>
        {:else if data?.summaryLabel === "SOL Explorer"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#1DD75B]"></div>
        {:else if data?.summaryLabel === "True Holder"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#8353E2]"></div>
        {:else}
          <div class="w-[8px] h-[8px] rounded-full bg-[#ccc]"></div>
        {/if}
        <div class="text-[#9a9a9a]">SOL</div>
      </div>

      <div class="text-[#f7fbfa] font-bold text-2xl">
        <TooltipNumber number={Number(data?.solHolding || 0)} type="amount" />
      </div>
    </div>

    <div class="statistics-card-content-wrapper">
      <div class="flex items-center gap-1">
        {#if data?.summaryLabel === "Fock it"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#4069E5]"></div>
        {:else if data?.summaryLabel === "Bonk Friend"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#ED7D2D]"></div>
        {:else if data?.summaryLabel === "SOL Explorer"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#1DD75B]"></div>
        {:else if data?.summaryLabel === "True Holder"}
          <div class="w-[8px] h-[8px] rounded-full bg-[#8353E2]"></div>
        {:else}
          <div class="w-[8px] h-[8px] rounded-full bg-[#ccc]"></div>
        {/if}
        <div class="text-[#9a9a9a]">You're</div>
      </div>
      <div class="text-[#f7fbfa] font-bold text-2xl">
        {data?.tag || "N/A"}{data?.tag !== "Normal" ? "%" : ""}
      </div>
    </div>
  </div>
</div>

<style>
  .card-container {
    display: flex;
    flex-direction: column;
    border-radius: 24px;
    padding: 20px;
    background: #202025;
    width: max-content;
    position: relative;
    z-index: 10;
  }

  .card-img-wrapper {
    position: relative;
  }

  .card-img-wrapper .card-img {
    border-radius: 20px;
    object-fit: fill;
    height: 360px;
    width: 320px;
  }

  .card-img-wrapper .card-info-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: end;
    gap: 8px;
    padding: 12px 20px;
  }

  .card-img-wrapper .card-info-wrapper .tag {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .card-img-wrapper .card-state {
    padding: 0px 16px;
    border-radius: 10px;
    width: max-content;
    color: #010101;
    font-size: 18px;
    font-weight: 700;
    background: white;
    text-align: center;
    box-shadow: 0px 32px 48px -16px #0000001a;
  }

  .card-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
  }

  .card-content .statistics-card-content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-content .statistics-card-content-wrapper:first-child {
    border-right: 1px solid;
    border-color: #555555;
  }
</style>
