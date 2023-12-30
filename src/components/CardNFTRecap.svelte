<script>
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let nft;
</script>

<div class="card-container">
  <div class="card-img-wrapper">
    <img src={nft} class="card-img" alt="" />
    <div class="card-info-wrapper">
      <div class="tag">
        <div class="card-state">True Holder</div>
        <div class="card-state">My 2023</div>
      </div>
      <div class="card-info">BONK is 20% of my portfolio</div>
    </div>
  </div>
  <div class="card-content">
    <div class="statistics-card-content-wrapper">
      <div class="text-1">SOL</div>
      <div class="info">
        <div class="text-2">230</div>
        <div class="text-3-wrapper">
          <div class="text-3">201.231%</div>
          <img src={TrendUp} alt="" class="icon" />
        </div>
      </div>
    </div>

    <div class="statistics-card-content-wrapper">
      <div class="text-1">NFT</div>
      <div class="info">
        <div class="text-2">230</div>
        <div class="text-3-wrapper">
          <div class="text-3">201.231%</div>
          <img src={TrendUp} alt="" class="icon" />
        </div>
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
    background: black;
    width: max-content;
  }

  .card-img-wrapper {
    position: relative;
  }

  .card-img-wrapper .card-img {
    border-radius: 20px;
    object-fit: fill;
    height: 300px;
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

  .card-img-wrapper .card-info {
    font-size: 14px;
    font-weight: 700;
    color: #f7fbfa;
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

  .card-content .statistics-card-content-wrapper .info {
    display: flex;
    flex-direction: column;
  }

  .card-content .statistics-card-content-wrapper .text-1 {
    font-size: 16px;
    font-weight: 400;
    color: #9a9a9a;
  }
  .card-content .statistics-card-content-wrapper .text-2 {
    font-size: 24px;
    font-weight: 700;
    color: #f7fbfa;
  }
  .card-content .statistics-card-content-wrapper .text-3-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #5affd0;
    margin-top: -4px;
  }
  .card-content .statistics-card-content-wrapper .text-3-wrapper .text-3 {
    font-size: 18px;
    font-weight: 500;
  }

  .card-content
    .statistics-card-content
    .statistics-card-content-wrapper
    .text-3-wrapper
    .icon {
    margin-bottom: 2px;
  }
</style>
