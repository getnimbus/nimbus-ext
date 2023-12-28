<script>
  import logoNimbus from "~/assets/logo-2.png";
  import demoimg from "~/assets/recap/nft-card-1.png";

  const item2 = [{}, {}];
</script>

<!-- "https://azk.imgix.net/images/2b5d534e-6f7e-4625-9061-d2c3e991ae77.png" -->
<!-- card  -->

<div class="card-container">
  <div class="card-img-wrapper">
    <img src={demoimg} class="card-img" alt="" />
    <div class="card-state">True Holder</div>
  </div>
  <div class="card-content">
    <div class="card-intro">
      <img src={logoNimbus} alt="" class="logo-img" />
      <div class="time-card">01/01/2023 - 01/01/2024</div>
    </div>
    <div class="statistics-card-content">
      {#each item2 as item}
        <div class="statistics-card-content-wrapper">
          <div class="text-1">My SOL</div>
          <div class="text-2">230</div>
          <div class="text-3-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 15 15"
            >
              <path fill="currentColor" d="m7.5 3l7.5 8H0z" />
            </svg>
            <div class="text-3">201.231k</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .card-container {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    border-width: 1px;
    border-radius: 8px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;
  }

  .card-img-wrapper {
    position: relative;
    width: 300px;
  }

  .card-img {
    border-top-left-radius: 0.5rem; /* 8px */
    border-top-right-radius: 0.5rem; /* 8px */
    border-radius:;
    -o-object-fit: fill;
    object-fit: fill;
    height: 100%;
    width: 100%;
  }

  .card-content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;
    padding: 12px 0px 12px 0px;
  }

  .card-state {
    padding: 4px 8px 4px 8px;
    border-radius: 9999px;
    position: absolute;
    top: 0.75rem; /* 12px */
    left: 0.75rem; /* 12px */
    --tw-text-opacity: 1;
    color: rgba(255, 255, 255, var(--tw-text-opacity));
    font-size: 0.75rem; /* 12px */
    line-height: 1rem; /* 16px */
    z-index: 10;
    --tw-bg-opacity: 1;
    background-color: rgba(131, 83, 226, var(--tw-bg-opacity));
    text-align: center;
  }

  .card-intro {
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    padding-left: 0.25rem; /* 4px */
    padding-right: 0.25rem; /* 4px */
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
  }

  .logo-img {
    -o-object-fit: contain;
    object-fit: contain;
    height: 35px;
  }

  .time-card {
    margin-right: 0.5rem; /* 8px */
    --tw-text-opacity: 1;
    color: rgba(156, 163, 175, var(--tw-text-opacity));
    font-size: 0.75rem; /* 12px */
    line-height: 1rem; /* 16px */
  }
  .text-1 {
    font-weight: 500;
    --tw-text-opacity: 1;
    color: rgba(156, 163, 175, var(--tw-text-opacity));
  }
  .text-2 {
    font-size: 1.875rem; /* 30px */
    line-height: 2.25rem; /* 36px */
  }
  .text-3-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    grid-gap: 0.25rem; /* 4px */
    gap: 0.25rem; /* 4px */

    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;

    --tw-text-opacity: 1;
    color: rgba(16, 185, 129, var(--tw-text-opacity));
  }
  .text-3 {
    font-size: 0.875rem; /* 14px */
    line-height: 1.25rem; /* 20px */
  }

  .statistics-card-content {
    padding: 0px 12px 0px 12px;
    grid-gap: 1rem; /* 16px */
    gap: 1rem; /* 16px */
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
  }
  .statistics-card-content-wrapper {
    padding: 8px 12px 8px 12px;
    border-radius: 4px;
    border-width: 1px;
    grid-gap: 0.25rem; /* 4px */
    gap: 0.25rem; /* 4px */
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-box-flex: 1;
    -ms-flex: 1 1 0%;
    -webkit-flex: 1 1 0%;
    flex: 1 1 0%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
  }
</style>
