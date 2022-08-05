// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";

// package.json
var package_default = {
  name: "vite-web-extension",
  version: "1.0.0",
  displayName: "Vite Web Extension",
  author: "@samrum/vite-plugin-web-extension",
  description: "A @samrum/vite-plugin-web-extension web extension",
  scripts: {
    build: "vite build",
    watch: "vite build --watch",
    dev: "vite",
    "serve:firefox": 'web-ext run --start-url "about:debugging#/runtime/this-firefox"  --source-dir ./dist/',
    "serve:chrome": 'web-ext run -t chromium --start-url "https://google.com" --source-dir ./dist/',
    check: "svelte-check --tsconfig ./tsconfig.json"
  },
  license: "MIT",
  devDependencies: {
    "@samrum/vite-plugin-web-extension": "^1.0.0",
    "@sveltejs/vite-plugin-svelte": "^1.0.0-next.41",
    "@tsconfig/svelte": "^2.0.1",
    "@types/webextension-polyfill": "^0.8.3",
    svelte: "^3.44.0",
    "svelte-check": "^2.2.7",
    "svelte-preprocess": "^4.9.8",
    tslib: "^2.3.1",
    typescript: "^4.4.4",
    vite: "~2.9.0",
    "web-ext": "^6.6.0"
  },
  dependencies: {
    "@metamask/detect-provider": "^1.2.0",
    "@webcomponents/webcomponentsjs": "^2.6.0",
    axios: "^0.27.2",
    dayjs: "^1.11.4",
    "lightweight-charts": "^3.8.0",
    lodash: "^4.17.21",
    "mark.js": "^8.11.1",
    numeral: "^2.0.6",
    "svelte-portal": "^2.2.0",
    "svelte-windicss-preprocess": "^4.2.8",
    "tippy.js": "^6.3.7",
    "webext-bridge": "^5.0.5",
    "webextension-polyfill": "^0.9.0",
    windicss: "^3.5.6"
  },
  type: "module"
};

// src/manifest.ts
var sharedManifest = {
  content_scripts: [
    {
      js: ["src/entries/contentScript/main.ts"],
      matches: ["*://*/*"]
    }
  ],
  icons: {
    16: "icons/16.png",
    19: "icons/19.png",
    32: "icons/32.png",
    38: "icons/38.png",
    48: "icons/48.png",
    64: "icons/64.png",
    96: "icons/96.png",
    128: "icons/128.png",
    256: "icons/256.png",
    512: "icons/512.png"
  },
  options_ui: {
    page: "src/entries/options/index.html",
    open_in_tab: true
  },
  permissions: []
};
var browserAction = {
  default_icon: {
    16: "icons/16.png",
    19: "icons/19.png",
    32: "icons/32.png",
    38: "icons/38.png"
  },
  default_popup: "src/entries/popup/index.html"
};
var ManifestV2 = {
  ...sharedManifest,
  background: {
    scripts: ["src/entries/background/script.ts"],
    persistent: false
  },
  browser_action: browserAction,
  options_ui: {
    ...sharedManifest.options_ui,
    chrome_style: false
  },
  permissions: [...sharedManifest.permissions, "*://*/*"]
};
var ManifestV3 = {
  ...sharedManifest,
  action: browserAction,
  background: {
    service_worker: "src/entries/background/serviceWorker.ts"
  },
  host_permissions: ["*://*/*"]
};
function getManifest(manifestVersion) {
  const manifest = {
    author: package_default.author,
    description: package_default.description,
    name: package_default.displayName ?? package_default.name,
    version: package_default.version
  };
  if (manifestVersion === 2) {
    return {
      ...manifest,
      ...ManifestV2,
      manifest_version: manifestVersion
    };
  }
  if (manifestVersion === 3) {
    return {
      ...manifest,
      ...ManifestV3,
      manifest_version: manifestVersion
    };
  }
  throw new Error(
    `Missing manifest definition for manifestVersion ${manifestVersion}`
  );
}

// vite.config.ts
import { windi } from "svelte-windicss-preprocess";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      svelte({
        preprocess: [windi({})],
        compilerOptions: {
          customElement: true
        }
      }),
      webExtension({
        manifest: getManifest(Number(env.MANIFEST_VERSION))
      })
    ],
    resolve: {
      alias: {
        "~": path.resolve("/Users/binhnguyen/Desktop/personal_projects/nimbus-v2", "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCB3ZWJFeHRlbnNpb24gZnJvbSBcIkBzYW1ydW0vdml0ZS1wbHVnaW4td2ViLWV4dGVuc2lvblwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGdldE1hbmlmZXN0IH0gZnJvbSBcIi4vc3JjL21hbmlmZXN0XCI7XG5pbXBvcnQgeyB3aW5kaSB9IGZyb20gXCJzdmVsdGUtd2luZGljc3MtcHJlcHJvY2Vzc1wiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgc3ZlbHRlKHtcbiAgICAgICAgcHJlcHJvY2VzczogW3dpbmRpKHt9KV0sXG4gICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgIGN1c3RvbUVsZW1lbnQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHdlYkV4dGVuc2lvbih7XG4gICAgICAgIG1hbmlmZXN0OiBnZXRNYW5pZmVzdChOdW1iZXIoZW52Lk1BTklGRVNUX1ZFUlNJT04pKSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJ+XCI6IHBhdGgucmVzb2x2ZShcIi9Vc2Vycy9iaW5obmd1eWVuL0Rlc2t0b3AvcGVyc29uYWxfcHJvamVjdHMvbmltYnVzLXYyXCIsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcbiIsICJpbXBvcnQgcGtnIGZyb20gXCIuLi9wYWNrYWdlLmpzb25cIjtcblxuY29uc3Qgc2hhcmVkTWFuaWZlc3QgPSB7XG4gIGNvbnRlbnRfc2NyaXB0czogW1xuICAgIHtcbiAgICAgIGpzOiBbXCJzcmMvZW50cmllcy9jb250ZW50U2NyaXB0L21haW4udHNcIl0sXG4gICAgICBtYXRjaGVzOiBbXCIqOi8vKi8qXCJdLFxuICAgIH0sXG4gIF0sXG4gIGljb25zOiB7XG4gICAgMTY6IFwiaWNvbnMvMTYucG5nXCIsXG4gICAgMTk6IFwiaWNvbnMvMTkucG5nXCIsXG4gICAgMzI6IFwiaWNvbnMvMzIucG5nXCIsXG4gICAgMzg6IFwiaWNvbnMvMzgucG5nXCIsXG4gICAgNDg6IFwiaWNvbnMvNDgucG5nXCIsXG4gICAgNjQ6IFwiaWNvbnMvNjQucG5nXCIsXG4gICAgOTY6IFwiaWNvbnMvOTYucG5nXCIsXG4gICAgMTI4OiBcImljb25zLzEyOC5wbmdcIixcbiAgICAyNTY6IFwiaWNvbnMvMjU2LnBuZ1wiLFxuICAgIDUxMjogXCJpY29ucy81MTIucG5nXCIsXG4gIH0sXG4gIG9wdGlvbnNfdWk6IHtcbiAgICBwYWdlOiBcInNyYy9lbnRyaWVzL29wdGlvbnMvaW5kZXguaHRtbFwiLFxuICAgIG9wZW5faW5fdGFiOiB0cnVlLFxuICB9LFxuICBwZXJtaXNzaW9uczogW10sXG59O1xuXG5jb25zdCBicm93c2VyQWN0aW9uID0ge1xuICBkZWZhdWx0X2ljb246IHtcbiAgICAxNjogXCJpY29ucy8xNi5wbmdcIixcbiAgICAxOTogXCJpY29ucy8xOS5wbmdcIixcbiAgICAzMjogXCJpY29ucy8zMi5wbmdcIixcbiAgICAzODogXCJpY29ucy8zOC5wbmdcIixcbiAgfSxcbiAgZGVmYXVsdF9wb3B1cDogXCJzcmMvZW50cmllcy9wb3B1cC9pbmRleC5odG1sXCIsXG59O1xuXG5jb25zdCBNYW5pZmVzdFYyID0ge1xuICAuLi5zaGFyZWRNYW5pZmVzdCxcbiAgYmFja2dyb3VuZDoge1xuICAgIHNjcmlwdHM6IFtcInNyYy9lbnRyaWVzL2JhY2tncm91bmQvc2NyaXB0LnRzXCJdLFxuICAgIHBlcnNpc3RlbnQ6IGZhbHNlLFxuICB9LFxuICBicm93c2VyX2FjdGlvbjogYnJvd3NlckFjdGlvbixcbiAgb3B0aW9uc191aToge1xuICAgIC4uLnNoYXJlZE1hbmlmZXN0Lm9wdGlvbnNfdWksXG4gICAgY2hyb21lX3N0eWxlOiBmYWxzZSxcbiAgfSxcbiAgcGVybWlzc2lvbnM6IFsuLi5zaGFyZWRNYW5pZmVzdC5wZXJtaXNzaW9ucywgXCIqOi8vKi8qXCJdLFxufTtcblxuY29uc3QgTWFuaWZlc3RWMyA9IHtcbiAgLi4uc2hhcmVkTWFuaWZlc3QsXG4gIGFjdGlvbjogYnJvd3NlckFjdGlvbixcbiAgYmFja2dyb3VuZDoge1xuICAgIHNlcnZpY2Vfd29ya2VyOiBcInNyYy9lbnRyaWVzL2JhY2tncm91bmQvc2VydmljZVdvcmtlci50c1wiLFxuICB9LFxuICBob3N0X3Blcm1pc3Npb25zOiBbXCIqOi8vKi8qXCJdLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hbmlmZXN0KFxuICBtYW5pZmVzdFZlcnNpb246IG51bWJlclxuKTogY2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMiB8IGNocm9tZS5ydW50aW1lLk1hbmlmZXN0VjMge1xuICBjb25zdCBtYW5pZmVzdCA9IHtcbiAgICBhdXRob3I6IHBrZy5hdXRob3IsXG4gICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbixcbiAgICBuYW1lOiBwa2cuZGlzcGxheU5hbWUgPz8gcGtnLm5hbWUsXG4gICAgdmVyc2lvbjogcGtnLnZlcnNpb24sXG4gIH07XG5cbiAgaWYgKG1hbmlmZXN0VmVyc2lvbiA9PT0gMikge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5tYW5pZmVzdCxcbiAgICAgIC4uLk1hbmlmZXN0VjIsXG4gICAgICBtYW5pZmVzdF92ZXJzaW9uOiBtYW5pZmVzdFZlcnNpb24sXG4gICAgfTtcbiAgfVxuXG4gIGlmIChtYW5pZmVzdFZlcnNpb24gPT09IDMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ubWFuaWZlc3QsXG4gICAgICAuLi5NYW5pZmVzdFYzLFxuICAgICAgbWFuaWZlc3RfdmVyc2lvbjogbWFuaWZlc3RWZXJzaW9uLFxuICAgIH07XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgYE1pc3NpbmcgbWFuaWZlc3QgZGVmaW5pdGlvbiBmb3IgbWFuaWZlc3RWZXJzaW9uICR7bWFuaWZlc3RWZXJzaW9ufWBcbiAgKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLGNBQWMsZUFBZTtBQUN0QyxTQUFTLGNBQWM7QUFDdkIsT0FBTyxrQkFBa0I7QUFDekIsT0FBTyxVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNEakIsSUFBTSxpQkFBaUI7QUFBQSxFQUNyQixpQkFBaUI7QUFBQSxJQUNmO0FBQUEsTUFDRSxJQUFJLENBQUMsbUNBQW1DO0FBQUEsTUFDeEMsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLEtBQUs7QUFBQSxJQUNMLEtBQUs7QUFBQSxJQUNMLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFDQSxZQUFZO0FBQUEsSUFDVixNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsYUFBYSxDQUFDO0FBQ2hCO0FBRUEsSUFBTSxnQkFBZ0I7QUFBQSxFQUNwQixjQUFjO0FBQUEsSUFDWixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsRUFDTjtBQUFBLEVBQ0EsZUFBZTtBQUNqQjtBQUVBLElBQU0sYUFBYTtBQUFBLEVBQ2pCLEdBQUc7QUFBQSxFQUNILFlBQVk7QUFBQSxJQUNWLFNBQVMsQ0FBQyxrQ0FBa0M7QUFBQSxJQUM1QyxZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUFBLElBQ1YsR0FBRyxlQUFlO0FBQUEsSUFDbEIsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxhQUFhLENBQUMsR0FBRyxlQUFlLGFBQWEsU0FBUztBQUN4RDtBQUVBLElBQU0sYUFBYTtBQUFBLEVBQ2pCLEdBQUc7QUFBQSxFQUNILFFBQVE7QUFBQSxFQUNSLFlBQVk7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLEVBQ2xCO0FBQUEsRUFDQSxrQkFBa0IsQ0FBQyxTQUFTO0FBQzlCO0FBRU8sU0FBUyxZQUNkLGlCQUN1RDtBQUN2RCxRQUFNLFdBQVc7QUFBQSxJQUNmLFFBQVEsZ0JBQUk7QUFBQSxJQUNaLGFBQWEsZ0JBQUk7QUFBQSxJQUNqQixNQUFNLGdCQUFJLGVBQWUsZ0JBQUk7QUFBQSxJQUM3QixTQUFTLGdCQUFJO0FBQUEsRUFDZjtBQUVBLE1BQUksb0JBQW9CLEdBQUc7QUFDekIsV0FBTztBQUFBLE1BQ0wsR0FBRztBQUFBLE1BQ0gsR0FBRztBQUFBLE1BQ0gsa0JBQWtCO0FBQUEsSUFDcEI7QUFBQSxFQUNGO0FBRUEsTUFBSSxvQkFBb0IsR0FBRztBQUN6QixXQUFPO0FBQUEsTUFDTCxHQUFHO0FBQUEsTUFDSCxHQUFHO0FBQUEsTUFDSCxrQkFBa0I7QUFBQSxJQUNwQjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLElBQUk7QUFBQSxJQUNSLG1EQUFtRDtBQUFBLEVBQ3JEO0FBQ0Y7OztBRHJGQSxTQUFTLGFBQWE7QUFHdEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDdEIsaUJBQWlCO0FBQUEsVUFDZixlQUFlO0FBQUEsUUFDakI7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELGFBQWE7QUFBQSxRQUNYLFVBQVUsWUFBWSxPQUFPLElBQUksZ0JBQWdCLENBQUM7QUFBQSxNQUNwRCxDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEseURBQXlELE9BQU87QUFBQSxNQUNwRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
