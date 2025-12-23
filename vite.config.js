import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import fs from "fs";
import path from "path";

function copyFolderRecursive(src, dest) {
  return fs.promises
    .rm(dest, { recursive: true, force: true })
    .then(() => fs.promises.mkdir(dest, { recursive: true }))
    .then(async () => {
      const entries = await fs.promises.readdir(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          await copyFolderRecursive(srcPath, destPath);
        } else {
          await fs.promises.copyFile(srcPath, destPath);
        }
      }
    });
}

function copyCloudfunctionsPlugin() {
  return {
    name: "copy-cloudfunctions",
    async closeBundle() {
      try {
        const projectRoot = process.cwd();
        const src = path.join(projectRoot, "cloudfunctions");
        const envDir = process.env.NODE_ENV === "production" ? "build" : "dev";
        const platform = process.env.UNI_PLATFORM || "mp-weixin";
        const dest = path.join(projectRoot, "dist", envDir, platform, "cloudfunctions");

        if (!fs.existsSync(src)) {
          // nothing to copy
          return;
        }

        await copyFolderRecursive(src, dest);
        console.log("[copy-cloudfunctions] copied", src, "->", dest);
      } catch (e) {
        console.warn("[copy-cloudfunctions] failed to copy cloudfunctions", e);
      }
    },
  };
}

export default defineConfig({
  plugins: [uni(), copyCloudfunctionsPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/global.scss";',
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
