import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://nexwealth.in", // update to your real domain once you buy it
  integrations: [tailwind()],
  output: "static", // static site, deployed to Cloudflare Pages
});
