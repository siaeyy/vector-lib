import typescript from 'rollup-plugin-typescript2';

const banner = `
/*!
 * @package vector-lib
 * @version 0.1.1
 * @date 2025-05-23
 * @author siaeyy
 * @license undefined
 * 
 * A package for easy usage of vectors.
 */
`;

export default {
    input: 'src/index.ts',
    output: [
        {
            file: "dist/index.js",
            format: 'cjs',
            sourcemap: true,
            banner,
        },
        {
            file: "dist/index.mjs",
            format: 'es',
            sourcemap: true,
            banner,
        },
    ],
    plugins: [
        typescript({
            tsconfig: 'tsconfig.json',
            useTsconfigDeclarationDir: true,
        }),
    ],
};