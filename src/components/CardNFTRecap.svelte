<script>
  import Logo from "~/assets/logo-2.png";
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let nft;
</script>

<div class="card-container">
  <div class="card-img-wrapper">
    <img src={nft} class="card-img" alt="" />
    <div class="card-state">True Holder</div>
    <div class="card-info">BONK is 20% of my portfolio</div>
  </div>
  <div class="card-content">
    <div class="card-intro">
      <img src={Logo} alt="" class="logo-img" />
      <div class="time-card">01/01/2023 - 01/01/2024</div>
    </div>
    <div class="statistics-card-content">
      <div class="statistics-card-content-wrapper">
        <div class="text-1">My SOL</div>
        <div class="text-2">230</div>
        <div class="text-3-wrapper">
          <div class="text-3">201.231%</div>
          <img src={TrendUp} alt="" class="icon" />
        </div>
      </div>

      <div class="statistics-card-content-wrapper">
        <div class="text-1">My NFT</div>
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
    width: 400px;
    border-radius: 8px;
    box-shadow: 0px 4px 9px 0px #171a1f1c;
    box-shadow: 0px 0px 2px 0px #171a1f1f;
    background: white;
  }

  .card-img-wrapper {
    position: relative;
  }

  .card-img-wrapper .card-img {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    object-fit: fill;
    height: 100%;
    width: 100%;
  }

  .card-img-wrapper .card-state {
    padding: 4px 8px 4px 8px;
    border-radius: 9999px;
    position: absolute;
    top: 12px;
    left: 12px;
    color: white;
    font-size: 12px;
    background: #8353e2;
    text-align: center;
  }

  .card-img-wrapper .card-info {
    font-size: 14px;
    font-weight: 700;
    color: white;
    position: absolute;
    bottom: 4px;
    right: 8px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 0px 12px 0px;
  }

  .card-content .card-intro {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
  }

  .card-content .card-intro .logo-img {
    object-fit: contain;
    height: 35px;
  }

  .card-content .card-intro .time-card {
    margin-right: 8px;
    color: #9095a0;
    font-size: 12px;
    font-weight: 400;
  }

  .card-content .statistics-card-content {
    padding: 0px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .card-content .statistics-card-content .statistics-card-content-wrapper {
    padding: 8px 12px;
    border-radius: 8px;
    border-width: 1px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-content
    .statistics-card-content
    .statistics-card-content-wrapper
    .text-1 {
    font-size: 14px;
    font-weight: 400;
    color: #9095a0;
  }
  .card-content
    .statistics-card-content
    .statistics-card-content-wrapper
    .text-2 {
    font-size: 40px;
    font-weight: 400;
    color: #171a1f;
  }
  .card-content
    .statistics-card-content
    .statistics-card-content-wrapper
    .text-3-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #14923e;
  }
  .card-content
    .statistics-card-content
    .statistics-card-content-wrapper
    .text-3-wrapper
    .text-3 {
    font-size: 14px;
    font-weight: 400;
  }

  .card-content
    .statistics-card-content
    .statistics-card-content-wrapper
    .text-3-wrapper
    .icon {
    margin-bottom: 2px;
  }
</style>
