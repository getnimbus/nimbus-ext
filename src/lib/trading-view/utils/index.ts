import { getNextBarTime } from "./stream";
import axios from "axios";

export const supportedResolutions = [
  "1",
  "5",
  "15",
  "60",
  "120",
  "240",
  "24H",
  "7D",
  "30D",
];

const lastBarsCache = new Map();
const sockets = new Map();

export const Datafeed = (
  baseAsset: any,
) => ({
  onReady: (callback: Function) => {
    callback({ supported_resolutions: supportedResolutions });
  },
  resolveSymbol: (symbolName: string, onResolve: Function) => {
    const price = baseAsset?.price;

    const params = {
      name: symbolName,
      description: "",
      type: "crypto",
      session: "24x7",
      ticker: symbolName,
      minmov: 1,
      pricescale: Math.min(
        10 ** String(Math.round(10000 / price)).length,
        10000000000000000
      ),
      has_intraday: true,
      intraday_multipliers: ["1", "15", "30", "60"],
      supported_resolution: supportedResolutions,
      volume_precision: 8,
      data_status: "streaming",
    };
    onResolve(params);
  },
  getBars: async (
    symbolInfo,
    resolution: string,
    periodParams,
    onResult: Function
  ) => {
    const params = {
      from: periodParams.from * 1000,
      to: periodParams.to * 1000,
      amount: periodParams.countBack,
      period: resolution,
      address: baseAsset?.address
    };

    const data: any = await axios.get("https://api.mobula.io/api/1/market/history/pair", {
      params: {
        ...params
      },
      headers: { Authorization: "eb66b1f3-c24b-4f43-9892-dbc5f37d5a6d" },
    }).then((res) => res.data);

    onResult(data.data, {
      noData: data.data.length !== periodParams.countBack,
    });

    if (periodParams.firstDataRequest) {
      lastBarsCache.set(baseAsset?.name, data.data[data.data.length - 1]);
    }
  },
  searchSymbols: () => { },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) => {
    console.log("Subscribinnnng");
    const socket = new WebSocket(
      "wss://general-api-wss-fgpupeioaa-uc.a.run.app" as string
    );
    const authKey =
      import.meta.env.VITE_MOBULA_KEY || "fe18f8be-644a-45a8-ad05-b088a5e61764";
    const params = {
      interval: 5,
      address: baseAsset?.address
    };

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          type: "pair",
          authorization: authKey,
          payload: params,
        })
      );
    });

    socket.addEventListener("message", (event) => {
      const eventData = JSON.parse(event.data);
      const { data } = eventData;
      if (data) {
        const { priceUSD: price, date: timestamp } = data;

        const lastDailyBar = lastBarsCache.get(baseAsset?.name);
        const nextDailyBarTime = getNextBarTime(resolution, lastDailyBar.time);
        let bar: any;

        if (timestamp >= nextDailyBarTime) {
          bar = {
            time: nextDailyBarTime,
            open: lastDailyBar.close,
            high: price,
            low: price,
            close: price,
          };
        } else {
          bar = {
            ...lastDailyBar,
            high: Math.max(lastDailyBar.high, price),
            low: Math.min(lastDailyBar.low, price),
            close: price,
          };
        }

        onRealtimeCallback(bar);
      }
    });

    console.log("Subscribe", baseAsset?.name + "-" + subscriberUID);
    sockets.set(baseAsset?.name + "-" + subscriberUID, socket);
  },
  unsubscribeBars: (subscriberUID) => {
    console.log("Unsubscribe", baseAsset?.name + "-" + subscriberUID);
    sockets.get(baseAsset?.name + "-" + subscriberUID).close();
  },
  getMarks: () => ({}),
  getTimeScaleMarks: () => ({}),
  getServerTime: () => ({}),
});