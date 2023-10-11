export let socket: null | WebSocket;

export const initWS = (cb?: () => void) => {
  socket = new WebSocket("wss://ws.getnimbus.io/ws");

  socket.onopen = () => {
    console.log("WS connection established");
    cb && cb();
  };

  // TODO: Add auto reconnect here
}

export const disconnectWs = () => {
  if (socket) {
    socket.close();
  }
}

export const decodeEvent = (ev: MessageEvent) => {
  try {
    const data = JSON.parse(ev.data);

    return data;
  } catch (error) {
    console.log(ev.data);
    console.log(error);
    return null;
  }
}

export const priceSubscribe = (cmc_id: number[] | string[], isNullCmcId: boolean, chain: string, callback: (any) => void) => {
  try {
    if (!socket) {
      console.log('WS is not initiated');
      initWS(() => priceSubscribe(cmc_id, isNullCmcId, chain, callback));
    } else {
      if (isNullCmcId) {
        socket.send(JSON.stringify({ "ids": cmc_id.join(','), "type": "mobula", "chain": chain }));
      } else {
        socket.send(JSON.stringify({ "ids": cmc_id.join(',') }));
      }

      socket.addEventListener('message', (ev) => {
        const data = decodeEvent(ev);
        if (data?.id) {
          if (cmc_id[0].toString().toLowerCase() === data?.id.toLowerCase()) {
            callback(data)
          }
        }
      })
    }
  } catch (error) {
    console.error("Socket error", error);
  }
}