<script lang="ts">
  import dayjs from "dayjs";
  import { createQuery } from "@tanstack/svelte-query";
  import { mobula, defillama } from "~/lib/network";
  import { isDarkMode, typeWallet } from "~/store";
  import { autoFontSize, formatBalance, formatCurrency } from "~/utils";
  import numeral from "numeral";
  import { groupBy } from "lodash";

  import EChart from "~/components/EChart.svelte";
  import Loading from "~/components/Loading.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  export let contractAddress;
  export let sellHistoryTradeList;
  export let buyHistoryTradeList;
  export let id;
  export let avgCost;
  export let chain;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let dataPriceChart = [];
  let dataAvgCost = [];

  let optionLine = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        const typeList = params[0].data?.data?.map((item) => {
          if (item.type === "sell") {
            return "sell";
          } else if (item.type === "buy") {
            return "buy";
          }
        });

        const allTypeSell = typeList?.every((item) => item === "sell");
        const allTypeBuy = typeList?.every((item) => item === "buy");

        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 320px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: ${
                  darkMode ? "white" : "black"
                }">
                  ${dayjs(params[0].axisValue).format("YYYY-MM-DD HH:mm")}
                </div>
                
                ${
                  params[0]?.seriesName === "Buy" ||
                  params[0]?.seriesName === "Sell" ||
                  params[0]?.seriesName === "Trade"
                    ? `
                  <div style="display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
                  }">
                    <span>${params[0]?.marker}</span>
                    <span>${
                      allTypeSell
                        ? `Sell +${params[0].data?.data.length}`
                        : allTypeBuy
                        ? `Buy +${params[0].data?.data.length}`
                        : params[0]?.seriesName
                    }</span>
                  </div>
                `
                    : ``
                }
              </div>

              ${params
                .map((item) => {
                  return `
                    ${
                      item?.seriesName === "Trade"
                        ? handleTooltipTrade(item?.data)
                        : item?.seriesName === "Buy" ||
                          item?.seriesName === "Sell"
                        ? handleTooltipBuyAndSell(item?.data)
                        : `
                        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                          <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                            darkMode ? "white" : "black"
                          }">
                            <span>${item?.marker}</span>
                            <span>${item?.seriesName}</span>
                          </div>

                          <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
                            <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                              darkMode ? "white" : "black"
                            }">
                              $${formatCurrency(Math.abs(item.value[1]))}
                            </div>
                          </div>
                        </div>
                      `
                    }
                  `;
                })
                .join("")}
            </div>`;
      },
    },
    toolbox: {
      right: "3%",
      top: "-1%",
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      axisLabel: {
        fontSize: autoFontSize(),
      },
    },
    yAxis: {
      type: "value",
      position: "right",
      axisLabel: {
        formatter: function (value, index) {
          if (value.toString().includes("e-")) {
            const numStr = value.toString();
            const eIndex = numStr.indexOf("e");
            if (eIndex !== -1) {
              const significand = parseFloat(
                numStr
                  .slice(0, 4)
                  .split("")
                  .filter((e) => e != ".")
                  .join("")
              );

              return `${value < 0 ? "-" : ""} $` + `0.0...0${significand}`;
            }
          } else {
            return (
              `${value < 0 ? "-" : ""} $` +
              numeral(Math.abs(value)).format("0.000000a")
            );
          }
        },
        fontSize: autoFontSize(),
      },
    },
    series: [],
  };

  let chainType = "Ethereum";

  $: {
    if (chain) {
      switch (chain) {
        case "ETH":
          chainType = "Ethereum";
          break;
        case "BNB":
          chainType = "BNB Smart Chain (BEP20)";
          break;
        case "XDAI":
          chainType = "XDAI";
          break;
        case "MATIC":
          chainType = "Polygon";
          break;
        case "OP":
          chainType = "Optimistic";
          break;
        case "AVAX":
          chainType = "Avalanche C-Chain";
          break;
        case "ARB":
          chainType = "Arbitrum";
          break;
        default:
          chainType = "Ethereum";
      }
    }
  }

  const handleGetTokenPriceSol = async () => {
    const response = await defillama.get(
      `/chart/solana:${contractAddress}?start=1664364537&span=30&period=30d&searchWidth=600`
    );
    const formatRes = response?.coins[`solana:${contractAddress}`]?.prices.map(
      (item) => {
        return [item.timestamp * 1000, item.price];
      }
    );
    return formatRes;
  };

  const handleGetTokenPrice = async () => {
    const response = await mobula.get(
      `/1/market/history?blockchain=${chainType}&asset=${contractAddress}&from=${dayjs()
        .subtract(30, "day")
        .unix()}&to'`
    );
    return response?.data?.price_history;
  };

  $: queryTokenPrice = createQuery({
    queryKey: ["token-price", contractAddress, chainType],
    queryFn: () => handleGetTokenPrice(),
    staleTime: Infinity,
    retry: false,
    enabled:
      contractAddress !== undefined &&
      contractAddress.length !== 0 &&
      chainType !== undefined &&
      chainType.length !== 0 &&
      typeWalletAddress === "EVM",
  });

  $: queryTokenPriceSol = createQuery({
    queryKey: ["token-price-sol", contractAddress, chainType],
    queryFn: () => handleGetTokenPriceSol(),
    staleTime: Infinity,
    retry: false,
    enabled:
      contractAddress !== undefined &&
      contractAddress.length !== 0 &&
      typeWalletAddress === "SOL",
  });

  $: {
    if (
      !$queryTokenPriceSol.isError &&
      $queryTokenPriceSol.data !== undefined &&
      $queryTokenPriceSol.data.length !== 0
    ) {
      dataPriceChart = $queryTokenPriceSol.data?.map((item) => {
        return {
          value: [item[0], item[1]],
          itemStyle: {
            color: "#1e96fc",
          },
        };
      });

      dataAvgCost = $queryTokenPriceSol.data?.map((item) => {
        return {
          value: [item[0], avgCost],
          itemStyle: {
            color: "#eab308",
          },
        };
      });
    }
  }

  $: {
    if (
      !$queryTokenPrice.isError &&
      $queryTokenPrice.data !== undefined &&
      $queryTokenPrice.data.length !== 0
    ) {
      dataPriceChart = $queryTokenPrice.data?.map((item) => {
        return {
          value: [item[0], item[1]],
          itemStyle: {
            color: "#1e96fc",
          },
        };
      });

      dataAvgCost = $queryTokenPrice.data?.map((item) => {
        return {
          value: [item[0], avgCost],
          itemStyle: {
            color: "#eab308",
          },
        };
      });
    }
  }

  const findClosestObject = (date, array) => {
    let closestObject = null;
    let closestDateDifference = Infinity;

    for (const obj of array) {
      const dateDifference = Math.abs(dayjs(date).diff(dayjs(obj.date)));
      if (dateDifference < closestDateDifference) {
        closestDateDifference = dateDifference;
        closestObject = obj;
      }
    }

    return closestObject;
  };

  const filterAndCollectDuplicates = (arr) => {
    let dateMap = new Map();
    let duplicates = [];

    arr.forEach((item) => {
      const date = dayjs(item.date);
      const dateStr = date.format("YYYY-MM-DD");

      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr).push(item);
      } else {
        dateMap.set(dateStr, [item]);
      }
    });

    dateMap.forEach((duplicateGroup) => {
      if (duplicateGroup.length > 1) {
        duplicates.push(...duplicateGroup);
      }
    });

    return duplicates;
  };

  const handleTooltipBuyAndSell = (data) => {
    return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Value
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                $${
                  data?.type === "buy"
                    ? formatCurrency(
                        Number(data?.quantity_in) * Number(data.past_price)
                      )
                    : formatCurrency(
                        Number(data?.quantity_out) * Number(data.past_price)
                      )
                }
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Amount
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                ${
                  data?.type === "buy"
                    ? formatBalance(Number(data?.quantity_in))
                    : formatBalance(Number(data?.quantity_out))
                }
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Price
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                $${formatCurrency(data.past_price)}
              </div>
            </div>
          </div>

        </div>
    `;
  };

  const handleTooltipTrade = (data) => {
    const formatDataTrade = data.data.map((item) => {
      return {
        ...item,
        past_value:
          item.type === "sell"
            ? Number(item.past_price) * Number(item.quantity_out)
            : Number(item.past_price) * Number(item.quantity_in),
      };
    });
    const groupBuySellHistoryData = groupBy(formatDataTrade, "type");
    const buySellHistoryData = Object.getOwnPropertyNames(
      groupBuySellHistoryData
    );

    const formatData = buySellHistoryData.map((item) => {
      return {
        type: item,
        amount:
          item === "sell"
            ? groupBuySellHistoryData[item]?.reduce(
                (prev, item) => prev + Number(item.quantity_out),
                0
              )
            : groupBuySellHistoryData[item]?.reduce(
                (prev, item) => prev + Number(item.quantity_in),
                0
              ),
        value: 0,
        price: data?.value[1],
        past_value: groupBuySellHistoryData[item].reduce(
          (prev, item) => prev + Number(item.past_value),
          0
        ),
      };
    });

    const typeList = formatDataTrade.map((item) => {
      if (item.type === "sell") {
        return "sell";
      } else if (item.type === "buy") {
        return "buy";
      }
    });

    const allTypeSell = typeList.every((item) => item === "sell");
    const allTypeBuy = typeList.every((item) => item === "buy");

    const sumPastValue = formatDataTrade.reduce(
      (prev, item) => prev + Number(item.past_value),
      0
    );

    const selectedPastPrice = formatDataTrade.find((item) => {
      return item.value[0] === data?.value[0];
    });

    if (allTypeSell) {
      const sumAmountSell = formatDataTrade.reduce(
        (prev, item) => prev + Number(item.quantity_out),
        0
      );
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Value
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                $${formatCurrency(Number(sumPastValue))}
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Amount
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                ${formatBalance(Number(sumAmountSell))}
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Price
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                $${formatCurrency(selectedPastPrice?.past_price)}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (allTypeBuy) {
      const sumAmountBuy = formatDataTrade.reduce(
        (prev, item) => prev + Number(item.quantity_in),
        0
      );
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Value
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                $${formatCurrency(Number(sumPastValue))}
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Amount
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                ${formatBalance(Number(sumAmountBuy))}
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
              darkMode ? "white" : "black"
            }">
              Price
            </div>
            <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
              <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                darkMode ? "white" : "black"
              }">
                $${formatCurrency(selectedPastPrice?.past_price)}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
          <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
            darkMode ? "white" : "black"
          }">
            Price
          </div>
          <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
            <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
              darkMode ? "white" : "black"
            }">
              $${formatCurrency(formatData[0]?.price)}
            </div>
          </div>
        </div>
       ${formatData
         .map((item) => {
           return `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                  darkMode ? "white" : "black"
                }">
                  <span style="margin-top: 5px; display:inline-block; margin-right:4px; border-radius:10px; width:10px; height:10px; background-color: ${
                    item?.type === "buy" ? "#00b580" : "#ef4444"
                  };"></span>
                  <span style="text-transform: capitalize;">${item?.type}</span>
                </div>

           
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
                  }">
                    Value
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      darkMode ? "white" : "black"
                    }">
                      $${formatCurrency(item.past_value)}
                    </div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: ${
                    darkMode ? "white" : "black"
                  }">
                    Amount
                  </div>
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right; margin-top: 2px;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      darkMode ? "white" : "black"
                    }">
                      ${formatBalance(Number(item?.amount))}
                    </div>
                  </div>
                </div>
              </div>
            `;
         })
         .join("")}
    `;
  };

  $: {
    if (
      dataPriceChart &&
      dataPriceChart.length !== 0 &&
      ((sellHistoryTradeList && sellHistoryTradeList.length !== 0) ||
        (buyHistoryTradeList && buyHistoryTradeList.length !== 0))
    ) {
      const formatDataBuyHistory = buyHistoryTradeList.map((item) => {
        const selected = findClosestObject(
          item.created_at * 1000,
          dataPriceChart.map((item) => {
            return {
              ...item,
              date: item.value[0],
            };
          })
        );
        return {
          quantity_in: item.quantity_in,
          quantity_out: item.quantity_out,
          itemStyle: { color: "#00b580" },
          value: [item.created_at * 1000, selected.value[1]],
          type: "buy",
          past_price: item.to_price,
        };
      });
      const formatDataSellHistory = sellHistoryTradeList.map((item) => {
        const selected = findClosestObject(
          item.created_at * 1000,
          dataPriceChart.map((item) => {
            return {
              ...item,
              date: item.value[0],
            };
          })
        );
        return {
          quantity_in: item.quantity_in,
          quantity_out: item.quantity_out,
          itemStyle: { color: "#ef4444" },
          value: [item.created_at * 1000, selected.value[1]],
          type: "sell",
          past_price: item.from_price,
        };
      });
      const dataHistory = formatDataBuyHistory.concat(formatDataSellHistory);

      const tradeHistoryData = filterAndCollectDuplicates(
        dataHistory.map((item) => {
          return {
            ...item,
            date: dayjs(item.value[0]).format("YYYY-MM-DD"),
          };
        })
      );
      const groupBuyTradeHistoryData = groupBy(tradeHistoryData, "date");
      const dateTradeHistoryData = Object.getOwnPropertyNames(
        groupBuyTradeHistoryData
      );
      const dataTrade = dateTradeHistoryData.map((item) => {
        let color = "#6b7280";
        const selected = findClosestObject(
          groupBuyTradeHistoryData[item][0].value[0],
          dataPriceChart.map((item) => {
            return {
              ...item,
              date: item.value[0],
            };
          })
        );

        const typeList = groupBuyTradeHistoryData[item].map((item) => {
          if (item.type === "sell") {
            return "sell";
          } else if (item.type === "buy") {
            return "buy";
          }
        });

        const allTypeSell = typeList.every((item) => item === "sell");
        const allTypeBuy = typeList.every((item) => item === "buy");

        if (allTypeSell) {
          color = "#ef4444";
        }

        if (allTypeBuy) {
          color = "#00b580";
        }

        return {
          dateFormat: item,
          date: groupBuyTradeHistoryData[item][0].value[0],
          data: groupBuyTradeHistoryData[item],
          itemStyle: { color },
          value: [
            groupBuyTradeHistoryData[item][0].value[0],
            selected.value[1],
          ],
          type: "trade",
        };
      });

      const filteredDuplicateHistoryData = dataHistory
        .map((item) => {
          return {
            ...item,
            date: item.value[0],
          };
        })
        .filter(
          (elem) =>
            !tradeHistoryData
              .map((item) => {
                return {
                  ...item,
                  date: item.value[0],
                };
              })
              .find(({ date }) => elem.date === date)
        );
      const groupBuyHistoryData = groupBy(filteredDuplicateHistoryData, "type");
      const dataBuy = groupBuyHistoryData["buy"];
      const dataSell = groupBuyHistoryData["sell"];

      optionLine = {
        ...optionLine,
        series: [
          {
            name: "Trade",
            type: "scatter",
            zlevel: 2,
            z: 2,
            symbolSize: 16,
            data: dataTrade || [],
          },
          {
            name: "Buy",
            type: "scatter",
            zlevel: 2,
            z: 3,
            symbolSize: 16,
            data: dataBuy || [],
          },
          {
            name: "Sell",
            type: "scatter",
            zlevel: 2,
            z: 3,
            symbolSize: 16,
            data: dataSell || [],
          },
          {
            name: "Price",
            type: "line",
            symbol: "circle",
            zlevel: 1,
            z: 2,
            datasetIndex: 1,
            symbolSize: 0.1,
            lineStyle: {
              type: "solid",
              color: "#1e96fc",
            },
            showSymbol: false,
            data: dataPriceChart,
          },
          {
            name: "Avg Cost",
            type: "line",
            symbol: "circle",
            zlevel: 1,
            z: 2,
            datasetIndex: 1,
            symbolSize: 0.1,
            lineStyle: {
              type: "dashed",
              color: "#eab308",
            },
            endLabel: {
              show: true,
              offset: [-75, -14],
              formatter: () => {
                return "Avg Cost";
              },
              color: "#eab308",
            },
            showSymbol: false,
            data: dataAvgCost,
          },
        ],
      };
    } else {
      optionLine = {
        ...optionLine,
        series: [
          {
            name: "Trade",
            type: "scatter",
            zlevel: 2,
            z: 2,
            symbolSize: 16,
            data: [],
          },
          {
            name: "Buy",
            type: "scatter",
            zlevel: 2,
            z: 3,
            symbolSize: 16,
            data: [],
          },
          {
            name: "Sell",
            type: "scatter",
            zlevel: 2,
            z: 3,
            symbolSize: 16,
            data: [],
          },
          {
            name: "Price",
            type: "line",
            symbol: "circle",
            zlevel: 1,
            z: 2,
            datasetIndex: 1,
            symbolSize: 0.1,
            lineStyle: {
              type: "solid",
              color: "#1e96fc",
            },
            showSymbol: false,
            data: [],
          },
          {
            name: "Avg Cost",
            type: "line",
            symbol: "circle",
            zlevel: 1,
            z: 2,
            datasetIndex: 1,
            symbolSize: 0.1,
            lineStyle: {
              type: "dashed",
              color: "#eab308",
            },
            showSymbol: false,
            data: [],
          },
        ],
      };
    }
  }

  $: theme = darkMode ? "dark" : "white";
</script>

{#if $queryTokenPrice.isFetching || $queryTokenPriceSol.isFetching}
  <div class="flex items-center justify-center h-[475px]">
    <Loading />
  </div>
{:else}
  <div class="h-full">
    {#if $queryTokenPrice.isError || $queryTokenPriceSol.isError || (dataPriceChart && dataPriceChart.length === 0) || (dataAvgCost && dataAvgCost.length === 0)}
      <div
        class="flex justify-center items-center h-full text-lg text-gray-400 h-[475px]"
      >
        Empty
      </div>
    {:else}
      <div class="relative">
        <EChart
          id={id + "line-chart"}
          {theme}
          notMerge={true}
          option={optionLine}
          height={485}
        />
        <div
          class="opacity-40 absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2"
        >
          <img
            src={darkMode ? LogoWhite : Logo}
            alt=""
            width="140"
            height="140"
          />
        </div>
      </div>
    {/if}
  </div>
{/if}

<style></style>
