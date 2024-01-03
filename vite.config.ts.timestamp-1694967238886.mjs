// vite.config.ts
import {
  defineConfig,
  loadEnv,
} from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/vite/dist/node/index.js";
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
    "dev:ext":
      "NODE_OPTIONS=--max_old_space_size=8024 WATCH=true vite build --watch",
    "dev:docs": "retype start",
    "serve:firefox":
      'web-ext run --start-url "about:debugging#/runtime/this-firefox"  --source-dir ./dist/',
    "serve:chrome":
      'web-ext run -t chromium --start-url "https://google.com" --source-dir ./dist/',
    check: "svelte-check --tsconfig ./tsconfig.json",
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
    "web-ext": "^6.6.0",
  },
  dependencies: {
    "@crownframework/svelte-error-boundary": "^1.0.3",
    "@popperjs/core": "^2.11.6",
    "@project-serum/anchor": "^0.26.0",
    "@sentry/svelte": "^7.64.0",
    "@solana/wallet-adapter-wallets": "^0.19.16",
    "@solana/web3.js": "^1.76.0",
    "@svelte-on-solana/wallet-adapter-anchor": "^1.0.16-alpha.0",
    "@svelte-on-solana/wallet-adapter-core": "^1.0.11-alpha.0",
    "@svelte-on-solana/wallet-adapter-ui": "^1.0.21-alpha.0",
    "@tanstack/svelte-query": "^4.32.1",
    "@twa-dev/sdk": "^6.7.1",
    "@web3-onboard/coinbase": "^2.2.5",
    "@web3-onboard/core": "^2.20.4",
    "@web3-onboard/injected-wallets": "^2.10.2",
    "@web3-onboard/ledger": "^2.5.1",
    "@webcomponents/webcomponentsjs": "^2.6.0",
    axios: "^0.27.2",
    "bind-mousetrap-global": "^1.0.1",
    bs58: "^5.0.0",
    classnames: "^2.3.2",
    "countup.js": "^2.5.0",
    "date-picker-svelte": "^2.6.0",
    dayjs: "^1.11.4",
    echarts: "^5.4.3",
    ethers: "^6.6.4",
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
    mousetrap: "^1.6.5",
    nanoid: "^4.0.2",
    numeral: "^2.0.6",
    "qrcode-generator": "^1.4.4",
    sass: "^1.59.2",
    "svelte-copy-to-clipboard": "^0.2.5",
    "svelte-dnd-action": "^0.9.22",
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
    "vite-imagetools": "^4.0.4",
    "webext-bridge": "https://github.com/getnimbus/webext-bridge.git",
    "webextension-polyfill": "^0.9.0",
    windicss: "^3.5.6",
  },
  type: "module",
};

// src/manifest.ts
var ManifestV3 = {
  content_scripts: [
    {
      js: ["src/entries/contentScript/main.ts"],
      matches: ["*://*/*"],
    },
  ],
  icons: {
    96: "icons/96.png",
    128: "icons/128.png",
    512: "icons/logo-icon.png",
  },
  options_ui: {
    page: "src/entries/options/index.html",
    open_in_tab: true,
  },
  web_accessible_resources: [
    {
      resources: [
        "src/entries/contentScript/assets/full-logo.svg",
        "src/entries/newTab/index.html",
        "src/entries/onboard/index.html",
      ],
      matches: ["*://*/*"],
    },
  ],
  permissions: ["storage", "unlimitedStorage", "activeTab"],
  commands: {
    "open-quick-search": {
      suggested_key: {
        default: "Ctrl+Shift+K",
        mac: "Command+Shift+K",
      },
      description: "Open Quick Search",
    },
  },
  action: {
    default_icon: {
      38: "icons/96.png",
    },
    default_title: "Nimbus",
  },
  background: {
    service_worker: "src/entries/background/serviceWorker.ts",
  },
  host_permissions: ["*://*/*"],
  default_locale: "en",
};
function getManifest() {
  const manifest = {
    author: package_default.author,
    description: package_default.description,
    name: package_default.displayName ?? package_default.name,
    version: package_default.version,
  };
  return {
    ...manifest,
    ...ManifestV3,
    manifest_version: 3,
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
              customElement: filename.endsWith(".custom.svelte"),
            };
          },
        },
      }),
      webExtension({
        manifest: getManifest(),
      }),
      AutoImport({
        imports: [
          {
            "webextension-polyfill": [["default", "browser"]],
          },
        ],
      }),
      viteStaticCopy({
        targets: [
          {
            src: "src/_locales",
            dest: "",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__vite_injected_original_dirname, "./src"),
      },
    },
    define: {
      APP_TYPE: {
        TYPE: "EXT",
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
        },
      },
      sourcemap: env.WATCH === "true" ? "inline" : false,
    },
    optimizeDeps: {
      include: ["webextension-polyfill"],
    },
  };
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYmluaG5ndXllbi9EZXNrdG9wL25pbWJ1cy1leHQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gXCJAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlXCI7XG5pbXBvcnQgd2ViRXh0ZW5zaW9uIGZyb20gXCJAc2FtcnVtL3ZpdGUtcGx1Z2luLXdlYi1leHRlbnNpb25cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBnZXRNYW5pZmVzdCB9IGZyb20gXCIuL3NyYy9tYW5pZmVzdFwiO1xuaW1wb3J0IHsgd2luZGkgfSBmcm9tIFwic3ZlbHRlLXdpbmRpY3NzLXByZXByb2Nlc3NcIjtcbmltcG9ydCBzdmVsdGVQcmVwcm9jZXNzIGZyb20gXCJzdmVsdGUtcHJlcHJvY2Vzc1wiO1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSBcInVucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGVcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgXCJcIik7XG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgc3ZlbHRlKHtcbiAgICAgICAgcHJlcHJvY2VzczogW3N2ZWx0ZVByZXByb2Nlc3MoKSwgd2luZGkoe30pXSxcbiAgICAgICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICAgICAgZHluYW1pY0NvbXBpbGVPcHRpb25zKHsgZmlsZW5hbWUsIGNvbXBpbGVPcHRpb25zIH0pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIC4uLmNvbXBpbGVPcHRpb25zLFxuICAgICAgICAgICAgICBjdXN0b21FbGVtZW50OiBmaWxlbmFtZS5lbmRzV2l0aChcIi5jdXN0b20uc3ZlbHRlXCIpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICB3ZWJFeHRlbnNpb24oe1xuICAgICAgICBtYW5pZmVzdDogZ2V0TWFuaWZlc3QoKSxcbiAgICAgIH0pLFxuICAgICAgQXV0b0ltcG9ydCh7XG4gICAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiOiBbW1wiZGVmYXVsdFwiLCBcImJyb3dzZXJcIl1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICAgIHZpdGVTdGF0aWNDb3B5KHtcbiAgICAgICAgdGFyZ2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJzcmMvX2xvY2FsZXNcIixcbiAgICAgICAgICAgIGRlc3Q6IFwiXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJ+XCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBBUFBfVFlQRToge1xuICAgICAgICBUWVBFOiAnRVhUJ1xuICAgICAgfVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLmpzYCxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uanNgLFxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5baGFzaF0uW2V4dF1gLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHNvdXJjZW1hcDogZW52LldBVENIID09PSBcInRydWVcIiA/IFwiaW5saW5lXCIgOiBmYWxzZSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1wid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCJdLFxuICAgIH0sXG4gIH07XG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0L3NyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0L3NyYy9tYW5pZmVzdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmluaG5ndXllbi9EZXNrdG9wL25pbWJ1cy1leHQvc3JjL21hbmlmZXN0LnRzXCI7aW1wb3J0IHBrZyBmcm9tIFwiLi4vcGFja2FnZS5qc29uXCI7XG5cbmNvbnN0IE1hbmlmZXN0VjM6IFBhcnRpYWw8Y2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMz4gPSB7XG4gIGNvbnRlbnRfc2NyaXB0czogW1xuICAgIHtcbiAgICAgIGpzOiBbXCJzcmMvZW50cmllcy9jb250ZW50U2NyaXB0L21haW4udHNcIl0sXG4gICAgICBtYXRjaGVzOiBbXCIqOi8vKi8qXCJdLFxuICAgIH0sXG4gIF0sXG4gIGljb25zOiB7XG4gICAgOTY6IFwiaWNvbnMvOTYucG5nXCIsXG4gICAgMTI4OiBcImljb25zLzEyOC5wbmdcIixcbiAgICA1MTI6IFwiaWNvbnMvbG9nby1pY29uLnBuZ1wiLFxuICB9LFxuICBvcHRpb25zX3VpOiB7XG4gICAgcGFnZTogXCJzcmMvZW50cmllcy9vcHRpb25zL2luZGV4Lmh0bWxcIixcbiAgICBvcGVuX2luX3RhYjogdHJ1ZSxcbiAgfSxcbiAgLy8gY2hyb21lX3VybF9vdmVycmlkZXM6IHtcbiAgLy8gICBuZXd0YWI6IFwic3JjL2VudHJpZXMvbmV3VGFiL2luZGV4Lmh0bWxcIixcbiAgLy8gfSxcbiAgd2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzOiBbXG4gICAge1xuICAgICAgcmVzb3VyY2VzOiBbXCJzcmMvZW50cmllcy9jb250ZW50U2NyaXB0L2Fzc2V0cy9mdWxsLWxvZ28uc3ZnXCIsIFwic3JjL2VudHJpZXMvbmV3VGFiL2luZGV4Lmh0bWxcIiwgXCJzcmMvZW50cmllcy9vbmJvYXJkL2luZGV4Lmh0bWxcIl0sXG4gICAgICBtYXRjaGVzOiBbXCIqOi8vKi8qXCJdLFxuICAgIH0sXG4gIF0sXG4gIC8vIHBlcm1pc3Npb25zOiBbXCJpZGVudGl0eVwiLCBcInN0b3JhZ2VcIiwgXCJ1bmxpbWl0ZWRTdG9yYWdlXCIsIFwiYWN0aXZlVGFiXCJdLFxuICBwZXJtaXNzaW9uczogW1wic3RvcmFnZVwiLCBcInVubGltaXRlZFN0b3JhZ2VcIiwgXCJhY3RpdmVUYWJcIl0sXG4gIGNvbW1hbmRzOiB7XG4gICAgXCJvcGVuLXF1aWNrLXNlYXJjaFwiOiB7XG4gICAgICBzdWdnZXN0ZWRfa2V5OiB7XG4gICAgICAgIGRlZmF1bHQ6IFwiQ3RybCtTaGlmdCtLXCIsXG4gICAgICAgIG1hYzogXCJDb21tYW5kK1NoaWZ0K0tcIixcbiAgICAgIH0sXG4gICAgICBkZXNjcmlwdGlvbjogXCJPcGVuIFF1aWNrIFNlYXJjaFwiLFxuICAgIH0sXG4gIH0sXG4gIGFjdGlvbjoge1xuICAgIGRlZmF1bHRfaWNvbjoge1xuICAgICAgLy8gMTY6IFwiaWNvbnMvMTYucG5nXCIsXG4gICAgICAvLyAxOTogXCJpY29ucy8xOS5wbmdcIixcbiAgICAgIC8vIDMyOiBcImljb25zLzMyLnBuZ1wiLFxuICAgICAgMzg6IFwiaWNvbnMvOTYucG5nXCIsXG4gICAgfSxcbiAgICBkZWZhdWx0X3RpdGxlOiBcIk9wZW4gTmltYnVzIHNpZGViYXJcIixcbiAgfSxcbiAgYmFja2dyb3VuZDoge1xuICAgIHNlcnZpY2Vfd29ya2VyOiBcInNyYy9lbnRyaWVzL2JhY2tncm91bmQvc2VydmljZVdvcmtlci50c1wiLFxuICAgIC8vIHR5cGU6IFwibW9kdWxlXCIsXG4gIH0sXG4gIGhvc3RfcGVybWlzc2lvbnM6IFtcIio6Ly8qLypcIl0sXG4gIGRlZmF1bHRfbG9jYWxlOiBcImVuXCIsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFuaWZlc3QoKTogY2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMyB7XG4gIGNvbnN0IG1hbmlmZXN0ID0ge1xuICAgIGF1dGhvcjogcGtnLmF1dGhvcixcbiAgICBkZXNjcmlwdGlvbjogcGtnLmRlc2NyaXB0aW9uLFxuICAgIG5hbWU6IHBrZy5kaXNwbGF5TmFtZSA/PyBwa2cubmFtZSxcbiAgICB2ZXJzaW9uOiBwa2cudmVyc2lvbixcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIC4uLm1hbmlmZXN0LFxuICAgIC4uLk1hbmlmZXN0VjMsXG4gICAgbWFuaWZlc3RfdmVyc2lvbjogMyxcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFIsU0FBUyxjQUFjLGVBQWU7QUFDcFUsU0FBUyxjQUFjO0FBQ3ZCLE9BQU8sa0JBQWtCO0FBQ3pCLE9BQU8sVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRGpCLElBQU0sYUFBaUQ7QUFBQSxFQUNyRCxpQkFBaUI7QUFBQSxJQUNmO0FBQUEsTUFDRSxJQUFJLENBQUMsbUNBQW1DO0FBQUEsTUFDeEMsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLEtBQUs7QUFBQSxJQUNMLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFDQSxZQUFZO0FBQUEsSUFDVixNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsRUFDZjtBQUFBLEVBSUEsMEJBQTBCO0FBQUEsSUFDeEI7QUFBQSxNQUNFLFdBQVcsQ0FBQyxrREFBa0QsaUNBQWlDLGdDQUFnQztBQUFBLE1BQy9ILFNBQVMsQ0FBQyxTQUFTO0FBQUEsSUFDckI7QUFBQSxFQUNGO0FBQUEsRUFFQSxhQUFhLENBQUMsV0FBVyxvQkFBb0IsV0FBVztBQUFBLEVBQ3hELFVBQVU7QUFBQSxJQUNSLHFCQUFxQjtBQUFBLE1BQ25CLGVBQWU7QUFBQSxRQUNiLFNBQVM7QUFBQSxRQUNULEtBQUs7QUFBQSxNQUNQO0FBQUEsTUFDQSxhQUFhO0FBQUEsSUFDZjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGNBQWM7QUFBQSxNQUlaLElBQUk7QUFBQSxJQUNOO0FBQUEsSUFDQSxlQUFlO0FBQUEsRUFDakI7QUFBQSxFQUNBLFlBQVk7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLEVBRWxCO0FBQUEsRUFDQSxrQkFBa0IsQ0FBQyxTQUFTO0FBQUEsRUFDNUIsZ0JBQWdCO0FBQ2xCO0FBRU8sU0FBUyxjQUF5QztBQUN2RCxRQUFNLFdBQVc7QUFBQSxJQUNmLFFBQVEsZ0JBQUk7QUFBQSxJQUNaLGFBQWEsZ0JBQUk7QUFBQSxJQUNqQixNQUFNLGdCQUFJLGVBQWUsZ0JBQUk7QUFBQSxJQUM3QixTQUFTLGdCQUFJO0FBQUEsRUFDZjtBQUVBLFNBQU87QUFBQSxJQUNMLEdBQUc7QUFBQSxJQUNILEdBQUc7QUFBQSxJQUNILGtCQUFrQjtBQUFBLEVBQ3BCO0FBQ0Y7OztBRC9EQSxTQUFTLGFBQWE7QUFDdEIsT0FBTyxzQkFBc0I7QUFDN0IsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxzQkFBc0I7QUFSL0IsSUFBTSxtQ0FBbUM7QUFXekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDMUMsY0FBYztBQUFBLFVBQ1osc0JBQXNCLEVBQUUsVUFBVSxlQUFlLEdBQUc7QUFDbEQsbUJBQU87QUFBQSxjQUNMLEdBQUc7QUFBQSxjQUNILGVBQWUsU0FBUyxTQUFTLGdCQUFnQjtBQUFBLFlBQ25EO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELGFBQWE7QUFBQSxRQUNYLFVBQVUsWUFBWTtBQUFBLE1BQ3hCLENBQUM7QUFBQSxNQUNELFdBQVc7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQO0FBQUEsWUFDRSx5QkFBeUIsQ0FBQyxDQUFDLFdBQVcsU0FBUyxDQUFDO0FBQUEsVUFDbEQ7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxlQUFlO0FBQUEsUUFDYixTQUFTO0FBQUEsVUFDUDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsTUFBTTtBQUFBLFVBQ1I7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFdBQVcsSUFBSSxVQUFVLFNBQVMsV0FBVztBQUFBLElBQy9DO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsdUJBQXVCO0FBQUEsSUFDbkM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
