import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
 import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "../api/dist",
    emptyOutDir: true,
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    TanStackRouterVite({
      routeFilePrefix: "~",
      routeTreeFileHeader: [
        "/* eslint-disable eslint-comments/no-unlimited-disable */",
        "/* eslint-disable */",
      ],
      autoCodeSplitting:true,
      generatedRouteTree: "./src/route-tree.gen.ts",

    }),
    react(),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
