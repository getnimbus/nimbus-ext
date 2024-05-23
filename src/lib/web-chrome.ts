import { tryCatch } from "~/utils/index";

const storageChangeListener = [];

export const storage = {
  onChanged: {
    addListener(fn) {
      storageChangeListener.push(fn);
      // TODO: Notify when storage change
    }
  },
  sync: {
    async get(name: string) {
      const value = localStorage.getItem(`sync_${name}`);
      return {
        [name]: tryCatch(() => JSON.parse(value), value)
      }
    },
    async set(input: Record<string, string>) {
      Object.keys(input).forEach(key => {
        localStorage.setItem(`sync_${key}`, JSON.stringify(input[key]));
      })

      return true
    },
    async remove(name: string) {
      return localStorage.removeItem(name);
    }
  },
  local: {
    async get(name: string) {
      const value = localStorage.getItem(`local_${name}`);
      return {
        [name]: tryCatch(() => JSON.parse(value), value)
      }
    },
    async set(input: Record<string, string>) {
      Object.keys(input).forEach(key => {
        try {
          localStorage.setItem(`local_${key}`, JSON.stringify(input[key]));
        } catch (error) {

        }
      })

      return true
    },
    async remove(name: string) {
      return localStorage.removeItem(name);
    }
  },
}

export const tabs = {
  create(url) {
    console.log("Going to open new tab ", url);
  }
}
