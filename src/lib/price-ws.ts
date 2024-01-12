import { prices } from "~/store";

export let socket: null | WebSocket;
let isReady = false;
type iFN = () => void;
let cbList: iFN[] = [];

export const initWS = (cb?: () => void) => {
  socket = new WebSocket("wss://ws.getnimbus.io/ws");

  socket.onopen = () => {
    console.log("WS connection established");
    cb && cb();
    isReady = true;
    cbList.forEach((cbItem) => {
      cbItem();
    });
    cbList = [];
  };
};

export const disconnectWs = () => {
  if (socket) {
    socket.close();
  }
};

export const decodeEvent = (ev: MessageEvent) => {
  try {
    const data = JSON.parse(ev.data);

    return data;
  } catch (error) {
    console.log(ev.data);
    console.log(error);
    return null;
  }
};

interface IPriceRealtime {
  id: string;
  price: string;
  volume: string;
  timestamp: number;
  type: "mobula" | "cmc" | "ethereum";
  chain: string;
}

const cached: Record<string, IPriceRealtime> = {};

export const priceSubscribe = (
  cmc_id: number[] | string[],
  chain: string,
  callback: (any) => void
) => {
  try {
    if (!socket) {
      console.log("WS is not initiated");
      initWS(() => priceSubscribe(cmc_id, chain, callback));
    } else {
      if (!isReady) {
        console.log("Delay Subscribe");
        cbList.push(() => priceSubscribe(cmc_id, chain, callback));
        return;
      }

      const key = `${cmc_id}-${chain}`;

      if (cached[key]) {
        // Return from cache
        callback(cached[key]);
      } else {
        socket.send(JSON.stringify({ ids: cmc_id.join(",") }));
      }

      socket.addEventListener("message", (ev) => {
        const data = decodeEvent(ev);
        if (
          data?.id &&
          cmc_id[0].toString().toLowerCase() === data?.id.toLowerCase()
        ) {

          if (!cached[key]) {
            // Only callback when we don't have data cached
            cached[key] = data;
          }

          callback(data);

          prices.update((value) => {
            return {
              ...value,
              [key]: data?.price,
            };
          });
        }
      });
    }
  } catch (error) {
    console.error("Socket error", error);
  }
};
