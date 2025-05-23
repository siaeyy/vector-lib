import { defineConfig } from "tsup";

const js_banner = `
/*!
 * @package vector-lib
 * @version 0.1.0
 * @date 2025-05-23
 * @author siaeyy
 * @license undefined
 * 
 * A package for easy usage of vectors.
 */
`;

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    banner: {
        js: js_banner,
    },
});