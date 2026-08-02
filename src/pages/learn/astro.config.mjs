import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://nexwealth.in", // update to your real domain once you buy it
  integrations: [tailwind(), sitemap()],
  output: "static", // static site, deployed to Cloudflare Pages
});
