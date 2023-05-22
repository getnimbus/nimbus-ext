<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

  import EChart from "~/components/EChart.svelte";
  import Button from "~/components/Button.svelte";
  import "~/components/Loading.custom.svelte";

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let listNft = [];
  let isLoading = false;

  let optionLine = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["BTC", "Ethereum", "Solana", "SUI", "Other"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "BTC",
        type: "line",
        stack: "Total",
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: "Ethereum",
        type: "line",
        stack: "Total",
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: "Solana",
        type: "line",
        stack: "Total",
        data: [150, 232, 201, 154, 190, 330, 410],
      },
      {
        name: "SUI",
        type: "line",
        stack: "Total",
        data: [320, 332, 301, 334, 390, 330, 320],
      },
      {
        name: "Other",
        type: "line",
        stack: "Total",
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },
    ],
  };
  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: "Other" },
          { value: 735, name: "SUI" },
          { value: 580, name: "BTC" },
          { value: 484, name: "Ethereum" },
          { value: 300, name: "Solana" },
        ],
      },
    ],
  };

  const handleBuy = async () => {
    const res = await nimbus
      .get("/payments/create-session")
      .then((response) => response);
    if (res) {
      window.location.replace(res.data.payment_url);
    }
  };

  const handleGetNft = async () => {
    try {
      isLoading = true;
      const solanaAddress = localStorage.getItem("solana_address");
      const solanaToken = localStorage.getItem("solana_token");
      if (solanaAddress && solanaToken) {
        const res = await nimbus
          .get(`/nft/${solanaAddress}`, {
            headers: {
              Authorization: `${solanaToken}`,
            },
          })
          .then((response) => response);
        if (res) {
          listNft = res?.data?.result;
        }
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  $: {
    if (Object.keys(userInfo).length !== 0) {
      handleGetNft();
    } else {
      listNft = [];
    }
  }
</script>

{#if Object.keys(userInfo).length === 0}
  <div class="flex justify-center items-center h-screen">
    <div class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center">
      <div class="text-lg">Please login to use this feature</div>
    </div>
  </div>
{:else}
  <div>
    {#if isLoading}
      <div class="flex justify-center items-center h-screen">
        <div class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center">
          <loading-icon />
        </div>
      </div>
    {:else}
      <div>
        {#if listNft && listNft.length !== 0}
          <div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
            <div class="w-full border border-[#0000001a] rounded-[20px] p-6">
              <div class="pl-4 text-2xl font-medium text-black mb-3">
                Revenue grow
              </div>
              <EChart
                id="line-chart-one"
                theme="white"
                option={optionLine}
                height={465}
              />
            </div>
            <div class="w-full border border-[#0000001a] rounded-[20px] p-6">
              <div class="pl-4 text-2xl font-medium text-black mb-3">
                Shrape Ratio
              </div>
              <EChart
                id="line-chart-two"
                theme="white"
                option={optionLine}
                height={465}
              />
            </div>
            <div class="flex xl:flex-row flex-col justify-between gap-6">
              <div
                class="xl:w-1/2 w-full border border-[#0000001a] rounded-[20px] p-6"
              >
                <div class="pl-4 text-2xl font-medium text-black mb-3">
                  Sector breakdown
                </div>
                <EChart
                  id="pie-chart"
                  theme="white"
                  option={optionPie}
                  height={465}
                />
              </div>
              <div
                class="xl:w-1/2 w-full border border-[#0000001a] rounded-[20px] p-6"
              >
                <div class="pl-4 text-2xl font-medium text-black mb-3">
                  Sector performance
                </div>
                <EChart
                  id="line-chart-three"
                  theme="white"
                  option={optionLine}
                  height={465}
                />
              </div>
            </div>
          </div>
        {:else}
          <div class="flex justify-center items-center h-screen">
            <div
              class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center"
            >
              <div class="text-lg">
                You need Nimbus NFT to unlock this feature
              </div>
              <Button variant="secondary" on:click={() => handleBuy()}
                >Buy</Button
              >
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style></style>
