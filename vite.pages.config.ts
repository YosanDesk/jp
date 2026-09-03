import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "github-pages",
  base: "/north-team-office/",
  plugins: [react()],
  build: { outDir: "../pages-dist", emptyOutDir: true },
});
