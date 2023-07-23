<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";

  let selectedWallet: string = "";
  let selectedChain: string = "";
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-14">
        <div class="flex items-center justify-between">
          <Link
            to={`${
              APP_TYPE.TYPE === "EXT" ? "src/entries/newTab/index.html" : "/"
            }`}
            class="cusor-pointer"
          >
            <div class="flex items-center gap-1 text-white">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-xl font-semibold">
                Back to Analytics
              </div>
            </div>
          </Link>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-white">
              <div class="xl:text-5xl text-7xl font-semibold">
                Personal Token Breakdown
              </div>
            </div>
            {#if selectedWallet && selectedWallet.length !== 0}
              <div class="text-base">
                <Copy address={selectedWallet} iconColor="#fff" color="#fff" />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style></style>
