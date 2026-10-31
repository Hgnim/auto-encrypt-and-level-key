//bundle
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        dts({
            include: ["src"],
            outDirs: "./dist/bundle",
            tsconfigPath: "./tsconfig.node.json",
        }),
    ],
    build: {
        lib: {
            entry: {
                node: path.resolve(__dirname, "src/node/index.ts"),
                client: path.resolve(__dirname, "src/client/index.ts"),
            },
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                //node模块外部化，无需打包
                "path",
                "fs",
            ],
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name]-[hash].js",
                assetFileNames: "[name][extname]",
            },
        },
        //源码映射
        sourcemap: true,
        //压缩
        minify: true,
        outDir: "dist/bundle",
    },
});
