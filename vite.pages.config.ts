import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "github-pages",
  base: "/jp/",
  plugins: [react()],
  build: { outDir: "../pages-dist", emptyOutDir: true },
});
