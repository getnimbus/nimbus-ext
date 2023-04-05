export let socket: null | WebSocket;

export const initWS = (cb?: () => void) => {
  socket = new WebSocket("ws://ws.getnimbus.io:3031/ws");

  socket.onopen = () => {
    console.log("WebSocket connection established");
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
  const data = JSON.parse(ev.data);

  return data;
}

export const priceSubscribe = (cmc_id: number[] | string[], callback: (any) => void) => {
  if (!socket) {
    console.log('WS is not initiated');
    initWS(() => priceSubscribe(cmc_id, callback));
    return;
  }

  socket.send(JSON.stringify({ "ids": cmc_id.join(',') }));

  socket.addEventListener('message', (ev) => {
    const data = decodeEvent(ev);
    if (data?.d?.id) {
      if (cmc_id.includes(data.d.id)) {
        callback(data.d)
      }
    }
  })
}