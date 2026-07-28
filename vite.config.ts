import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "copy-dreamhost-config",
      closeBundle() {
        copyFileSync(resolve("public/.htaccess"), resolve("dist/.htaccess"));
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
