import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://jojo.schibsted.com",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  prefetch: {
    prefetchAll: true,
  },
});
