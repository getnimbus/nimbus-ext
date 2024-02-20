// vite.config.ts
import { defineConfig, loadEnv } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/@sveltejs/vite-plugin-svelte/dist/index.js";
import webExtension from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/@samrum/vite-plugin-web-extension/dist/index.js";
import path from "path";

// package.json
var package_default = {
  name: "nimbus-ext",
  displayName: "Nimbus",
  version: "1.0.0",
  author: "Thanh Le - thanhle@getnimbus.io",
  description: "A personalized Web3 portfolio tool for DEFI users",
  scripts: {
    build: "vite build",
    "build:components": "vite build -c vite.config.components.ts",
    "build:web": "vite build -c vite.config.web.ts",
    "build:docs": "retype build && vercel deploy --prod .retype",
    watch: "WATCH=true vite build --watch",
    dev: "yarn dev:web",
    "dev:web": "vite -c vite.config.web.ts",
    "dev:ext": "NODE_OPTIONS=--max_old_space_size=8024 WATCH=true vite build --watch",
    "dev:docs": "retype start",
    "serve:firefox": 'web-ext run --start-url "about:debugging#/runtime/this-firefox"  --source-dir ./dist/',
    "serve:chrome": 'web-ext run -t chromium --start-url "https://google.com" --source-dir ./dist/',
    check: "svelte-check --tsconfig ./tsconfig.json"
  },
  license: "MIT",
  devDependencies: {
    "@iconify/svelte": "^3.1.4",
    "@samrum/vite-plugin-web-extension": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^1.0.0-next.41",
    "@tsconfig/svelte": "^2.0.1",
    "@types/webextension-polyfill": "^0.8.3",
    retype: "^0.2.0",
    svelte: "^3.44.0",
    "svelte-check": "^2.2.7",
    "svelte-preprocess": "^4.9.8",
    tslib: "^2.3.1",
    typescript: "^4.4.4",
    "unplugin-auto-import": "^0.11.1",
    vite: "^3.1.3",
    "vite-plugin-static-copy": "^0.11.1",
    "web-ext": "^6.6.0"
  },
  dependencies: {
    "@crownframework/svelte-error-boundary": "^1.0.3",
    "@popperjs/core": "^2.11.6",
    "@project-serum/anchor": "^0.26.0",
    "@rollup/plugin-inject": "^5.0.5",
    "@sentry/svelte": "^7.64.0",
    "@solana/wallet-adapter-wallets": "^0.19.16",
    "@solana/web3.js": "^1.76.0",
    "@svelte-on-solana/wallet-adapter-anchor": "^1.0.16-alpha.0",
    "@svelte-on-solana/wallet-adapter-core": "^1.0.11-alpha.0",
    "@svelte-on-solana/wallet-adapter-ui": "^1.0.21-alpha.0",
    "@tanstack/svelte-query": "^4.32.1",
    "@twa-dev/sdk": "^6.7.1",
    "@web3-onboard/bitget": "^2.0.1",
    "@web3-onboard/coinbase": "^2.2.6",
    "@web3-onboard/core": "^2.21.2",
    "@web3-onboard/injected-wallets": "^2.10.11",
    "@web3-onboard/ledger": "^2.5.2",
    "@webcomponents/webcomponentsjs": "^2.6.0",
    axios: "^0.27.2",
    "bind-mousetrap-global": "^1.0.1",
    bs58: "^5.0.0",
    buffer: "^6.0.3",
    "canvas-confetti": "^1.9.0",
    classnames: "^2.3.2",
    "countup.js": "^2.5.0",
    "date-picker-svelte": "^2.6.0",
    dayjs: "^1.11.4",
    "driver.js": "^1.3.0",
    echarts: "^5.4.3",
    ethers: "^6.6.4",
    firebase: "^10.7.2",
    flowbite: "^1.5.3",
    "flowbite-svelte": "^0.27.1",
    "flowbite-svelte-icons": "^0.3.6",
    "flowbite-windicss-plugin": "^0.1.2",
    history: "^5.3.0",
    html2canvas: "^1.4.1",
    "jwt-decode": "^3.1.2",
    "lightweight-charts": "^3.8.0",
    lodash: "^4.17.21",
    "lottie-web": "^5.12.2",
    "mark.js": "^8.11.1",
    "mixpanel-browser": "^2.47.0",
    "moralis-v1": "^1.13.0",
    mousetrap: "^1.6.5",
    nanoid: "^4.0.2",
    "nimbus-swap-widget": "^3.0.3",
    numeral: "^2.0.6",
    "qrcode-generator": "^1.4.4",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    sass: "^1.59.2",
    scrollreveal: "^4.0.9",
    "svelte-copy-to-clipboard": "^0.2.5",
    "svelte-dnd-action": "^0.9.22",
    "svelte-inview": "^4.0.2",
    "svelte-loading-spinners": "^0.3.4",
    "svelte-motion": "^0.11.5",
    "svelte-navigator": "^3.2.2",
    "svelte-spark": "^1.0.4",
    "svelte-system-info": "^1.0.0",
    "svelte-typewriter": "^3.1.6",
    "svelte-windicss-preprocess": "^4.2.8",
    swiper: "6",
    "tailwind-merge": "^1.14.0",
    tailwindcss: "^3.1.8",
    "tippy.js": "^6.3.7",
    "url-pattern": "^1.0.3",
    "vezgo-sdk-js": "^1.0.9",
    viem: "^1.18.9",
    "vite-imagetools": "^4.0.4",
    "vite-plugin-pwa": "^0.16.5",
    "webext-bridge": "https://github.com/getnimbus/webext-bridge.git",
    "webextension-polyfill": "^0.9.0",
    windicss: "^3.5.6"
  },
  type: "module"
};

// src/manifest.ts
var ManifestV3 = {
  content_scripts: [
    {
      js: ["src/entries/contentScript/main.ts"],
      matches: ["*://*/*"]
    }
  ],
  icons: {
    96: "icons/96.png",
    128: "icons/128.png",
    512: "icons/logo-icon.png"
  },
  options_ui: {
    page: "src/entries/options/index.html",
    open_in_tab: true
  },
  web_accessible_resources: [
    {
      resources: ["src/entries/contentScript/assets/full-logo.svg", "src/entries/newTab/index.html", "src/entries/onboard/index.html"],
      matches: ["*://*/*"]
    }
  ],
  permissions: ["storage", "unlimitedStorage", "activeTab"],
  commands: {
    "open-quick-search": {
      suggested_key: {
        default: "Ctrl+Shift+K",
        mac: "Command+Shift+K"
      },
      description: "Open Quick Search"
    }
  },
  action: {
    default_icon: {
      38: "icons/96.png"
    },
    default_title: "Nimbus"
  },
  background: {
    service_worker: "src/entries/background/serviceWorker.ts"
  },
  host_permissions: ["*://*/*"],
  default_locale: "en"
};
function getManifest() {
  const manifest = {
    author: package_default.author,
    description: package_default.description,
    name: package_default.displayName ?? package_default.name,
    version: package_default.version
  };
  return {
    ...manifest,
    ...ManifestV3,
    manifest_version: 3
  };
}

// vite.config.ts
import { windi } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/svelte-windicss-preprocess/dist/index.mjs";
import sveltePreprocess from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/svelte-preprocess/dist/index.js";
import AutoImport from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/unplugin-auto-import/dist/vite.js";
import { viteStaticCopy } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname = "/Users/binhnguyen/Desktop/nimbus-ext";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      svelte({
        preprocess: [sveltePreprocess(), windi({})],
        experimental: {
          dynamicCompileOptions({ filename, compileOptions }) {
            return {
              ...compileOptions,
              customElement: filename.endsWith(".custom.svelte")
            };
          }
        }
      }),
      webExtension({
        manifest: getManifest()
      }),
      AutoImport({
        imports: [
          {
            "webextension-polyfill": [["default", "browser"]]
          }
        ]
      }),
      viteStaticCopy({
        targets: [
          {
            src: "src/_locales",
            dest: ""
          }
        ]
      })
    ],
    resolve: {
      alias: {
        "~": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    define: {
      APP_TYPE: {
        TYPE: "EXT"
      }
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[hash].[ext]`
        }
      },
      sourcemap: env.WATCH === "true" ? "inline" : false
    },
    optimizeDeps: {
      include: ["webextension-polyfill"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYmluaG5ndXllbi9EZXNrdG9wL25pbWJ1cy1leHQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gXCJAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlXCI7XG5pbXBvcnQgd2ViRXh0ZW5zaW9uIGZyb20gXCJAc2FtcnVtL3ZpdGUtcGx1Z2luLXdlYi1leHRlbnNpb25cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBnZXRNYW5pZmVzdCB9IGZyb20gXCIuL3NyYy9tYW5pZmVzdFwiO1xuaW1wb3J0IHsgd2luZGkgfSBmcm9tIFwic3ZlbHRlLXdpbmRpY3NzLXByZXByb2Nlc3NcIjtcbmltcG9ydCBzdmVsdGVQcmVwcm9jZXNzIGZyb20gXCJzdmVsdGUtcHJlcHJvY2Vzc1wiO1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSBcInVucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGVcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgXCJcIik7XG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgc3ZlbHRlKHtcbiAgICAgICAgcHJlcHJvY2VzczogW3N2ZWx0ZVByZXByb2Nlc3MoKSwgd2luZGkoe30pXSxcbiAgICAgICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICAgICAgZHluYW1pY0NvbXBpbGVPcHRpb25zKHsgZmlsZW5hbWUsIGNvbXBpbGVPcHRpb25zIH0pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIC4uLmNvbXBpbGVPcHRpb25zLFxuICAgICAgICAgICAgICBjdXN0b21FbGVtZW50OiBmaWxlbmFtZS5lbmRzV2l0aChcIi5jdXN0b20uc3ZlbHRlXCIpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICB3ZWJFeHRlbnNpb24oe1xuICAgICAgICBtYW5pZmVzdDogZ2V0TWFuaWZlc3QoKSxcbiAgICAgIH0pLFxuICAgICAgQXV0b0ltcG9ydCh7XG4gICAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiOiBbW1wiZGVmYXVsdFwiLCBcImJyb3dzZXJcIl1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICAgIHZpdGVTdGF0aWNDb3B5KHtcbiAgICAgICAgdGFyZ2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJzcmMvX2xvY2FsZXNcIixcbiAgICAgICAgICAgIGRlc3Q6IFwiXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJ+XCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBBUFBfVFlQRToge1xuICAgICAgICBUWVBFOiBcIkVYVFwiLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5qc2AsXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLmpzYCxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uW2hhc2hdLltleHRdYCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBzb3VyY2VtYXA6IGVudi5XQVRDSCA9PT0gXCJ0cnVlXCIgPyBcImlubGluZVwiIDogZmFsc2UsXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiXSxcbiAgICB9LFxuICB9O1xufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9iaW5obmd1eWVuL0Rlc2t0b3AvbmltYnVzLWV4dC9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iaW5obmd1eWVuL0Rlc2t0b3AvbmltYnVzLWV4dC9zcmMvbWFuaWZlc3QudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0L3NyYy9tYW5pZmVzdC50c1wiO2ltcG9ydCBwa2cgZnJvbSBcIi4uL3BhY2thZ2UuanNvblwiO1xuXG5jb25zdCBNYW5pZmVzdFYzOiBQYXJ0aWFsPGNocm9tZS5ydW50aW1lLk1hbmlmZXN0VjM+ID0ge1xuICBjb250ZW50X3NjcmlwdHM6IFtcbiAgICB7XG4gICAgICBqczogW1wic3JjL2VudHJpZXMvY29udGVudFNjcmlwdC9tYWluLnRzXCJdLFxuICAgICAgbWF0Y2hlczogW1wiKjovLyovKlwiXSxcbiAgICB9LFxuICBdLFxuICBpY29uczoge1xuICAgIDk2OiBcImljb25zLzk2LnBuZ1wiLFxuICAgIDEyODogXCJpY29ucy8xMjgucG5nXCIsXG4gICAgNTEyOiBcImljb25zL2xvZ28taWNvbi5wbmdcIixcbiAgfSxcbiAgb3B0aW9uc191aToge1xuICAgIHBhZ2U6IFwic3JjL2VudHJpZXMvb3B0aW9ucy9pbmRleC5odG1sXCIsXG4gICAgb3Blbl9pbl90YWI6IHRydWUsXG4gIH0sXG4gIC8vIGNocm9tZV91cmxfb3ZlcnJpZGVzOiB7XG4gIC8vICAgbmV3dGFiOiBcInNyYy9lbnRyaWVzL25ld1RhYi9pbmRleC5odG1sXCIsXG4gIC8vIH0sXG4gIHdlYl9hY2Nlc3NpYmxlX3Jlc291cmNlczogW1xuICAgIHtcbiAgICAgIHJlc291cmNlczogW1wic3JjL2VudHJpZXMvY29udGVudFNjcmlwdC9hc3NldHMvZnVsbC1sb2dvLnN2Z1wiLCBcInNyYy9lbnRyaWVzL25ld1RhYi9pbmRleC5odG1sXCIsIFwic3JjL2VudHJpZXMvb25ib2FyZC9pbmRleC5odG1sXCJdLFxuICAgICAgbWF0Y2hlczogW1wiKjovLyovKlwiXSxcbiAgICB9LFxuICBdLFxuICAvLyBwZXJtaXNzaW9uczogW1wiaWRlbnRpdHlcIiwgXCJzdG9yYWdlXCIsIFwidW5saW1pdGVkU3RvcmFnZVwiLCBcImFjdGl2ZVRhYlwiXSxcbiAgcGVybWlzc2lvbnM6IFtcInN0b3JhZ2VcIiwgXCJ1bmxpbWl0ZWRTdG9yYWdlXCIsIFwiYWN0aXZlVGFiXCJdLFxuICBjb21tYW5kczoge1xuICAgIFwib3Blbi1xdWljay1zZWFyY2hcIjoge1xuICAgICAgc3VnZ2VzdGVkX2tleToge1xuICAgICAgICBkZWZhdWx0OiBcIkN0cmwrU2hpZnQrS1wiLFxuICAgICAgICBtYWM6IFwiQ29tbWFuZCtTaGlmdCtLXCIsXG4gICAgICB9LFxuICAgICAgZGVzY3JpcHRpb246IFwiT3BlbiBRdWljayBTZWFyY2hcIixcbiAgICB9LFxuICB9LFxuICBhY3Rpb246IHtcbiAgICBkZWZhdWx0X2ljb246IHtcbiAgICAgIC8vIDE2OiBcImljb25zLzE2LnBuZ1wiLFxuICAgICAgLy8gMTk6IFwiaWNvbnMvMTkucG5nXCIsXG4gICAgICAvLyAzMjogXCJpY29ucy8zMi5wbmdcIixcbiAgICAgIDM4OiBcImljb25zLzk2LnBuZ1wiLFxuICAgIH0sXG4gICAgZGVmYXVsdF90aXRsZTogXCJOaW1idXNcIixcbiAgfSxcbiAgYmFja2dyb3VuZDoge1xuICAgIHNlcnZpY2Vfd29ya2VyOiBcInNyYy9lbnRyaWVzL2JhY2tncm91bmQvc2VydmljZVdvcmtlci50c1wiLFxuICAgIC8vIHR5cGU6IFwibW9kdWxlXCIsXG4gIH0sXG4gIGhvc3RfcGVybWlzc2lvbnM6IFtcIio6Ly8qLypcIl0sXG4gIGRlZmF1bHRfbG9jYWxlOiBcImVuXCIsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFuaWZlc3QoKTogY2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMyB7XG4gIGNvbnN0IG1hbmlmZXN0ID0ge1xuICAgIGF1dGhvcjogcGtnLmF1dGhvcixcbiAgICBkZXNjcmlwdGlvbjogcGtnLmRlc2NyaXB0aW9uLFxuICAgIG5hbWU6IHBrZy5kaXNwbGF5TmFtZSA/PyBwa2cubmFtZSxcbiAgICB2ZXJzaW9uOiBwa2cudmVyc2lvbixcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIC4uLm1hbmlmZXN0LFxuICAgIC4uLk1hbmlmZXN0VjMsXG4gICAgbWFuaWZlc3RfdmVyc2lvbjogMyxcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFIsU0FBUyxjQUFjLGVBQWU7QUFDcFUsU0FBUyxjQUFjO0FBQ3ZCLE9BQU8sa0JBQWtCO0FBQ3pCLE9BQU8sVUFBVTs7Ozs7Ozs7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
