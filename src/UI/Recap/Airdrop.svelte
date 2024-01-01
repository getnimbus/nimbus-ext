<script>
  import html2canvas from "html2canvas";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Loading from "~/components/Loading.svelte";

  import Logo from "~/assets/logo-1.svg";
  import SvgTwo from "~/assets/recap/hero/svgTwo.svg";
  import Share from "~/assets/recap/share-icon.svg";

  export let data;
  export let loading;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const downloadPage = async () => {
    const targetElement = document.getElementById("target-slide-3");
    const shareBtn = document.getElementById("btn-share");
    if (targetElement && shareBtn) {
      try {
        await html2canvas(targetElement, {
          ignoreElements: (el) => {
            return el.id === "btn-share";
          },
          proxy: "https://htmlcanvas-proxy.getnimbus.io",
          logging: true,
          scale: 2,
        }).then((canvas) => {
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          const img = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
          const a = document.createElement("a");
          a.href = img;
          a.download = "Airdrop.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toastMsg = "Successfully downloaded!";
          isSuccessToast = true;
          trigger();
        });
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toastMsg = "Something wrong when download. Please try again!";
        isSuccessToast = false;
        trigger();
      }
    }
  };

  $: networth = (data || []).reduce(
    (total, item) => total + Number(item.value),
    0
  );

  $: dataAirdropFormated = (data || []).filter((item) => item.amount > 0);
</script>

<div
  class="bg-[#EFF4E8] relative pt-10 pb-20 h-full overflow-hidden w-full"
  id="target-slide-3"
>
  <div class="flex flex-col gap-20 h-full max-w-[1400px] m-auto">
    <img
      src={Logo}
      alt="logo"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
    />
    <div
      class="flex-1 h-full px-[35px] flex flex-col justify-center gap-14 items-center text-black"
    >
      <div class="font-bold text-4xl">
        You earned <span class="text-[60px]"
          >{(dataAirdropFormated && dataAirdropFormated.length) || 0}</span
        >
        airdrop worth
        <span class="text-[60px]">
          <TooltipNumber number={networth} type="value" />
        </span>
      </div>
      <div
        id="btn-share"
        class="bg-[#ffa41c] text-black p-4 flex items-center gap-4 text-2xl font-semibold rounded-[32px] w-max cursor-pointer relative z-20"
        on:click={downloadPage}
      >
        <div>Share</div>
        <img src={Share} alt="" />
      </div>

      {#if loading}
        <div
          class="flex justify-center items-center h-full xl:text-lg text-xl text-white h-[435px]"
        >
          <Loading />
        </div>
      {:else}
        <div>
          {#if !dataAirdropFormated.length}
            <div
              class="text-[#4F4F4F] font-normal text-2xl text-center pt-16 mx-8"
            >
              You haven't collected any airdrop 2023. No worries, there will be
              more on 2024 🤘
            </div>
          {/if}
          {#if dataAirdropFormated && dataAirdropFormated.length !== 0}
            <div class="xl:flex hidden flex-col gap-3">
              <div class="flex justify-center gap-2 items-center xl:h-60">
                {#each dataAirdropFormated.slice(0, 5) as item, index}
                  <div class="flex h-full">
                    <div
                      class={`bg-black min-w-[240px] flex flex-col gap-4 card-shadow-airdrop justify-between rounded-3xl px-6 py-5 ${
                        dataAirdropFormated.slice(0, 5).length % 2 == 0
                          ? "self-center"
                          : index % 2 == 0
                            ? "self-start"
                            : "self-end"
                      }`}
                    >
                      {#if item.upcoming}
                        <div>
                          <span
                            class="text-[#010101] text-[18px] font-bold bg-white px-3 py-1 rounded-[10px] inline-flex"
                          >
                            Upcoming
                          </span>
                        </div>
                      {/if}

                      <div class="flex flex-col gap-4">
                        <div
                          class="text-center text-gray-500 flex items-center gap-3"
                        >
                          <img
                            src={item.logo}
                            alt=""
                            class="w-10 h-10 rounded-full"
                          />
                          <div
                            class="flex items-center gap-1 text-[#C0C0C0] text-[20px]"
                          >
                            <TooltipNumber number={item.amount} type="amount" />
                            {item.token}
                          </div>
                        </div>
                        <div class="text-[#F7FBFA] text-[30px]">
                          <TooltipNumber number={item.value} type="value" />
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>

              {#if dataAirdropFormated.length > 5}
                <div
                  class="flex justify-center gap-2 items-center flex-shrink xl:h-60"
                >
                  {#each dataAirdropFormated.slice(5, 10) as item, index}
                    <div class="flex h-full">
                      <div
                        class={`bg-black min-w-[240px] flex flex-col gap-4 card-shadow-airdrop justify-between rounded-3xl px-6 pt-5 ${
                          dataAirdropFormated.slice(5, 10).length % 2 == 0
                            ? "self-center"
                            : dataAirdropFormated.slice(5, 10).length !== 3
                              ? index % 2 == 0
                                ? "self-start"
                                : "self-end"
                              : index % 2 == 0
                                ? "self-end"
                                : "self-start"
                        }`}
                      >
                        {#if item.upcoming}
                          <div
                            class="text-[#010101] text-[18px] font-bold bg-white px-3 py-1 rounded-[10px] w-max"
                          >
                            Upcoming
                          </div>
                        {/if}

                        <div class="flex flex-col gap-4 pb-5">
                          <div
                            class="text-center text-gray-500 flex items-center gap-3"
                          >
                            <img
                              src={item.logo}
                              alt=""
                              class="w-10 h-10 rounded-full"
                            />
                            <div
                              class="flex items-center gap-1 text-[#C0C0C0] text-[20px]"
                            >
                              <TooltipNumber
                                number={item.amount}
                                type="amount"
                              />
                              {item.token}
                            </div>
                          </div>
                          <div class="text-[#F7FBFA] text-[30px]">
                            $<TooltipNumber
                              number={item.value}
                              type="balance"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <div
              class="xl:hidden flex flex-wrap items-center justify-center gap-3"
            >
              {#each dataAirdropFormated as item, index}
                <div
                  class={`bg-black w-[240px] flex flex-col card-shadow-airdrop justify-between rounded-3xl px-6 py-5 gap-5`}
                >
                  <div
                    class="text-center text-gray-500 flex items-center gap-3"
                  >
                    <img
                      src={item.logo}
                      alt=""
                      class="w-10 h-10 rounded-full"
                    />{item.amount}
                    {item.token}
                  </div>
                  <div class="text-white text-[30px]">
                    <TooltipNumber number={item.value} type="value" />
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="absolute bottom-[-95px] left-[-95px] z-10 rotate-93_74">
    <img src={SvgTwo} alt="" />
  </div>

  <div class="absolute top-[-90px] right-[-80px] z-10 rotate-131_26">
    <img src={SvgTwo} alt="" class="" />
  </div>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style>
  .rotate-131_26 {
    transform: rotate(-131.26deg);
  }

  .rotate-93_74 {
    transform: rotate(93.74deg);
  }

  .card-shadow-airdrop {
    box-shadow: 20px 20px 40px 0px #48513c8a;
  }
</style>
