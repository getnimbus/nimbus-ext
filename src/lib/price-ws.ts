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

const chainSupport = ["ETH", "FTM", "ARB", "AVAX", "OP", "MATIC", "XDAI", "BNB", "BASE", "CRONOS", "KLAY", "VIC"]

export const priceSubscribe = (
  cmc_id: number[] | string[],
  isNullCmcId: boolean,
  chain: string,
  callback: (any) => void
) => {
  try {
    if (!socket) {
      console.log("WS is not initiated");
      initWS(() => priceSubscribe(cmc_id, isNullCmcId, chain, callback));
    } else {
      if (!isReady) {
        console.log("Delay Subscribe");
        cbList.push(() => priceSubscribe(cmc_id, isNullCmcId, chain, callback));
        return;
      }

      const key = `${cmc_id}-${chain}`;

      if (chain === "CEX") {
        socket.send(JSON.stringify({
          ids: cmc_id.join(","),
          type: "mobula",
          chain: "CEX",
        }));
      }

      if (chain !== "CEX") {
        if (isNullCmcId) {
          if (cached[key]) {
            // Return from cache
            callback(cached[key]);
          } else {
            if (chainSupport.includes(chain)) {
              socket.send(
                JSON.stringify({
                  ids: cmc_id.join(","),
                  type: "mobula",
                  chain: chain,
                })
              );
            }
          }
        } else {
          socket.send(JSON.stringify({ ids: cmc_id.join(",") }));
        }
      }

      socket.addEventListener("message", (ev) => {
        const data = decodeEvent(ev);
        if (
          data?.id &&
          cmc_id[0].toString().toLowerCase() === data?.id.toLowerCase()
        ) {
          if (isNullCmcId) {
            if (!cached[key]) {
              // Only callback when we don't have data cached
              cached[key] = data;
              callback(data);
            }
          } else {
            callback(data);
          }
        }
      });
    }
  } catch (error) {
    console.error("Socket error", error);
  }
};
