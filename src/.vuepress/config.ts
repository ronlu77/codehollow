import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  title: "code hollow",
  description: "Code hollow is a blog for documenting personal growth.",
  port: 8080,
  base: "/",
  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
