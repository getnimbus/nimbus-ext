type EventsStore = Record<string, Callback[]>
type EventNamesType = string;
type Callback = (...data: any[]) => any;

export class EventEmitter {
  events: EventsStore;
  constructor() {
    // event object
    this.events = {};
  }
  // subscribe method
  on(eventName: EventNamesType, callback: Callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [callback];
    } else {
      this.events[eventName].push(callback);
    }
    return () => this.remove(eventName, callback);
  }
  // event trigger
  emit(eventName: EventNamesType, ...rest) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(f => f.apply(this, rest));
    }
    // console.log('this.events', this.events);
  }
  // remove subscribe event
  remove(eventName: EventNamesType, callback?: Callback) {
    if (this.events[eventName]) {
      if (typeof callback === 'undefined') {
        this.events[eventName] = [];
      } else {
        this.events[eventName] = this.events[eventName].filter(f => f !== callback);
      }
    }
  }
  // only run once
  once(eventName: EventNamesType, callback: Callback) {
    const fn = (...args) => {
      callback(...args);
      this.remove(eventName, fn);
    };
    this.on(eventName, fn);
  }
}