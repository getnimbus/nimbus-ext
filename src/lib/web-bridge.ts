type Callback = (...data: any[]) => any;
let events: Record<string, Callback> = {}

export const sendMessage = (name: string, data: any) => {
  // console.log("Going to send msg", name, { data });
  return events[name]?.({ data });
}

export const onMessage = (name, handler) => {
  // console.log('Event register', name);
  events[name] = handler
}