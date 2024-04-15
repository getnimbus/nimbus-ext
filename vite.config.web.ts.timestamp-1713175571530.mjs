// vite.config.web.ts
import { defineConfig, loadEnv } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/@sveltejs/vite-plugin-svelte/dist/index.js";
import "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/@samrum/vite-plugin-web-extension/dist/index.js";
import path from "path";
import { windi } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/svelte-windicss-preprocess/dist/index.mjs";
import sveltePreprocess from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/svelte-preprocess/dist/index.js";
import "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/unplugin-auto-import/dist/vite.js";
import { viteStaticCopy } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/vite-plugin-static-copy/dist/index.js";
import { VitePWA } from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/vite-plugin-pwa/dist/index.js";
import inject from "file:///Users/binhnguyen/Desktop/nimbus-ext/node_modules/@rollup/plugin-inject/dist/es/index.js";
var __vite_injected_original_dirname = "/Users/binhnguyen/Desktop/nimbus-ext";
var vite_config_web_default = defineConfig(({ mode }) => {
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
      viteStaticCopy({
        targets: [
          {
            src: "src/_locales",
            dest: ""
          },
          {
            src: path.resolve(__vite_injected_original_dirname, "./src/assets/logo/"),
            dest: "assets"
          }
        ]
      }),
      VitePWA({
        selfDestroying: true
      })
    ],
    resolve: {
      alias: {
        "~": path.resolve(__vite_injected_original_dirname, "./src"),
        "webext-bridge": path.resolve(__vite_injected_original_dirname, "./src/lib/web-bridge"),
        "webextension-polyfill": path.resolve(
          __vite_injected_original_dirname,
          "./src/lib/web-chrome"
        )
      }
    },
    define: {
      APP_TYPE: {
        TYPE: "WEB"
      }
    },
    server: {
      port: 5173
    },
    root: path.resolve(__vite_injected_original_dirname, "./src"),
    optimizeDeps: {
      esbuildOptions: {
        target: "es2020"
      }
    },
    publicDir: path.resolve(__vite_injected_original_dirname, "./public"),
    build: {
      target: ["es2020"],
      rollupOptions: {
        plugins: [
          inject({ Buffer: ["buffer/", "Buffer"] })
        ],
        input: {
          app: path.resolve(__vite_injected_original_dirname, "./src/index.html"),
          options: path.resolve(__vite_injected_original_dirname, "./src/entries/options/index.html")
        },
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[hash].[ext]`
        }
      },
      outDir: path.resolve(__vite_injected_original_dirname, "web-build"),
      sourcemap: env.WATCH === "true" ? "inline" : false
    }
  };
});
export {
  vite_config_web_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcud2ViLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JpbmhuZ3V5ZW4vRGVza3RvcC9uaW1idXMtZXh0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYmluaG5ndXllbi9EZXNrdG9wL25pbWJ1cy1leHQvdml0ZS5jb25maWcud2ViLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9iaW5obmd1eWVuL0Rlc2t0b3AvbmltYnVzLWV4dC92aXRlLmNvbmZpZy53ZWIudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCB3ZWJFeHRlbnNpb24gZnJvbSBcIkBzYW1ydW0vdml0ZS1wbHVnaW4td2ViLWV4dGVuc2lvblwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGdldE1hbmlmZXN0IH0gZnJvbSBcIi4vc3JjL21hbmlmZXN0XCI7XG5pbXBvcnQgeyB3aW5kaSB9IGZyb20gXCJzdmVsdGUtd2luZGljc3MtcHJlcHJvY2Vzc1wiO1xuaW1wb3J0IHN2ZWx0ZVByZXByb2Nlc3MgZnJvbSBcInN2ZWx0ZS1wcmVwcm9jZXNzXCI7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tIFwidml0ZS1wbHVnaW4tc3RhdGljLWNvcHlcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG5pbXBvcnQgaW5qZWN0IGZyb20gXCJAcm9sbHVwL3BsdWdpbi1pbmplY3RcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbi8qKiBAdHlwZSB7aW1wb3J0KCd2aXRlJykuVXNlckNvbmZpZ30gKi9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICBzdmVsdGUoe1xuICAgICAgICBwcmVwcm9jZXNzOiBbc3ZlbHRlUHJlcHJvY2VzcygpLCB3aW5kaSh7fSldLFxuICAgICAgICBleHBlcmltZW50YWw6IHtcbiAgICAgICAgICBkeW5hbWljQ29tcGlsZU9wdGlvbnMoeyBmaWxlbmFtZSwgY29tcGlsZU9wdGlvbnMgfSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgLi4uY29tcGlsZU9wdGlvbnMsXG4gICAgICAgICAgICAgIGN1c3RvbUVsZW1lbnQ6IGZpbGVuYW1lLmVuZHNXaXRoKFwiLmN1c3RvbS5zdmVsdGVcIiksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHZpdGVTdGF0aWNDb3B5KHtcbiAgICAgICAgdGFyZ2V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJzcmMvX2xvY2FsZXNcIixcbiAgICAgICAgICAgIGRlc3Q6IFwiXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyB7XG4gICAgICAgICAgLy8gICBzcmM6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9wdWJsaWNcIiksXG4gICAgICAgICAgLy8gICBkZXN0OiBcIlwiLFxuICAgICAgICAgIC8vIH0sXG4gICAgICAgICAgLy8ge1xuICAgICAgICAgIC8vICAgc3JjOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vcHVibGljL3JvYm90cy50eHRcIiksXG4gICAgICAgICAgLy8gICBkZXN0OiBcIlwiLFxuICAgICAgICAgIC8vIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2Fzc2V0cy9sb2dvL1wiKSxcbiAgICAgICAgICAgIGRlc3Q6IFwiYXNzZXRzXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAgVml0ZVBXQSh7XG4gICAgICAgIHNlbGZEZXN0cm95aW5nOiB0cnVlLFxuICAgICAgICAvLyB3b3JrYm94OiB7XG4gICAgICAgIC8vICAgZ2xvYlBhdHRlcm5zOiBbXCIqKi8qLntjc3MsaHRtbCxzdmVsdGUsdHMsZ2lmLHN2Zyxwbmcsd29mZjJ9XCJdLFxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyBkZXZPcHRpb25zOiB7XG4gICAgICAgIC8vICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXG4gICAgICAgIC8vIG1hbmlmZXN0OiB7XG4gICAgICAgIC8vICAgbmFtZTogXCJOaW1idXNcIixcbiAgICAgICAgLy8gICBzaG9ydF9uYW1lOiBcIk5pbWJ1c1wiLFxuICAgICAgICAvLyAgIHN0YXJ0X3VybDogXCIvXCIsXG4gICAgICAgIC8vICAgZGlzcGxheTogXCJzdGFuZGFsb25lXCIsXG4gICAgICAgIC8vICAgZGVzY3JpcHRpb246IFwiaHR0cHM6Ly9nZXRuaW1idXMuaW9cIixcbiAgICAgICAgLy8gICBpY29uczogW1xuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICBzcmM6IFwiYXNzZXRzL2xvZ28vNTEyLnBuZ1wiLFxuICAgICAgICAvLyAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAvLyAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgIC8vICAgICAgIHB1cnBvc2U6IFwiYW55XCIsXG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICBzcmM6IFwiYXNzZXRzL2xvZ28vMjU2LnBuZ1wiLFxuICAgICAgICAvLyAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAvLyAgICAgICBzaXplczogXCIyNTZ4MjU2XCIsXG4gICAgICAgIC8vICAgICAgIHB1cnBvc2U6IFwiYW55XCIsXG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICBzcmM6IFwiYXNzZXRzL2xvZ28vMTQ0LnBuZ1wiLFxuICAgICAgICAvLyAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAvLyAgICAgICBzaXplczogXCIxNDR4MTQ0XCIsXG4gICAgICAgIC8vICAgICAgIHB1cnBvc2U6IFwiYW55XCIsXG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICBzcmM6IFwiYXNzZXRzL2xvZ28vMTI4LnBuZ1wiLFxuICAgICAgICAvLyAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAvLyAgICAgICBzaXplczogXCIxMjh4MTI4XCIsXG4gICAgICAgIC8vICAgICAgIHB1cnBvc2U6IFwiYW55XCIsXG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICBzcmM6IFwiYXNzZXRzL2xvZ28vNDgucG5nXCIsXG4gICAgICAgIC8vICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgIC8vICAgICAgIHNpemVzOiBcIjQ4eDQ4XCIsXG4gICAgICAgIC8vICAgICAgIHB1cnBvc2U6IFwiYW55XCIsXG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgIF0sXG4gICAgICAgIC8vIH0sXG4gICAgICB9KSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiflwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgICBcIndlYmV4dC1icmlkZ2VcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9saWIvd2ViLWJyaWRnZVwiKSxcbiAgICAgICAgXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjogcGF0aC5yZXNvbHZlKFxuICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgICBcIi4vc3JjL2xpYi93ZWItY2hyb21lXCJcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIEFQUF9UWVBFOiB7XG4gICAgICAgIFRZUEU6IFwiV0VCXCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiA1MTczLFxuICAgIH0sXG4gICAgcm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwdWJsaWNEaXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9wdWJsaWNcIiksXG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogW1wiZXMyMDIwXCJdLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgaW5qZWN0KHsgQnVmZmVyOiBbXCJidWZmZXIvXCIsIFwiQnVmZmVyXCJdIH0pLFxuICAgICAgICAgIC8vIGpzb24oKSxcbiAgICAgICAgICAvLyBnbG9iYWxzKCksXG4gICAgICAgICAgLy8gYnVpbHRpbnMoKSxcbiAgICAgICAgXSxcbiAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICBhcHA6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvaW5kZXguaHRtbFwiKSxcbiAgICAgICAgICBvcHRpb25zOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2VudHJpZXMvb3B0aW9ucy9pbmRleC5odG1sXCIpLFxuICAgICAgICB9LFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uanNgLFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5qc2AsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLltoYXNoXS5bZXh0XWAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIndlYi1idWlsZFwiKSxcbiAgICAgIHNvdXJjZW1hcDogZW52LldBVENIID09PSBcInRydWVcIiA/IFwiaW5saW5lXCIgOiBmYWxzZSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNTLFNBQVMsY0FBYyxlQUFlO0FBQzVVLFNBQVMsY0FBYztBQUN2QixPQUF5QjtBQUN6QixPQUFPLFVBQVU7QUFFakIsU0FBUyxhQUFhO0FBQ3RCLE9BQU8sc0JBQXNCO0FBQzdCLE9BQXVCO0FBQ3ZCLFNBQVMsc0JBQXNCO0FBQy9CLFNBQVMsZUFBZTtBQUN4QixPQUFPLFlBQVk7QUFWbkIsSUFBTSxtQ0FBbUM7QUFjekMsSUFBTywwQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDMUMsY0FBYztBQUFBLFVBQ1osc0JBQXNCLEVBQUUsVUFBVSxlQUFlLEdBQUc7QUFDbEQsbUJBQU87QUFBQSxjQUNMLEdBQUc7QUFBQSxjQUNILGVBQWUsU0FBUyxTQUFTLGdCQUFnQjtBQUFBLFlBQ25EO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELGVBQWU7QUFBQSxRQUNiLFNBQVM7QUFBQSxVQUNQO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBU0E7QUFBQSxZQUNFLEtBQUssS0FBSyxRQUFRLGtDQUFXLG9CQUFvQjtBQUFBLFlBQ2pELE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsTUErQ2xCLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsaUJBQWlCLEtBQUssUUFBUSxrQ0FBVyxzQkFBc0I7QUFBQSxRQUMvRCx5QkFBeUIsS0FBSztBQUFBLFVBQzVCO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsTUFBTSxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3JDLGNBQWM7QUFBQSxNQUNaLGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXLEtBQUssUUFBUSxrQ0FBVyxVQUFVO0FBQUEsSUFDN0MsT0FBTztBQUFBLE1BQ0wsUUFBUSxDQUFDLFFBQVE7QUFBQSxNQUNqQixlQUFlO0FBQUEsUUFDYixTQUFTO0FBQUEsVUFDUCxPQUFPLEVBQUUsUUFBUSxDQUFDLFdBQVcsUUFBUSxFQUFFLENBQUM7QUFBQSxRQUkxQztBQUFBLFFBQ0EsT0FBTztBQUFBLFVBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsa0JBQWtCO0FBQUEsVUFDL0MsU0FBUyxLQUFLLFFBQVEsa0NBQVcsa0NBQWtDO0FBQUEsUUFDckU7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsUUFBUSxLQUFLLFFBQVEsa0NBQVcsV0FBVztBQUFBLE1BQzNDLFdBQVcsSUFBSSxVQUFVLFNBQVMsV0FBVztBQUFBLElBQy9DO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
