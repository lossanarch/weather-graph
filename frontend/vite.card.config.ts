import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "../custom_components/weather_graph/frontend"),
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, "src/weather-graph-card.ts"),
      name: "WeatherGraphCard",
      formats: ["es"],
      fileName: () => "weather-graph-card.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
