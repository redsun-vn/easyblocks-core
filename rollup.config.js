// @ts-check
import alias from "@rollup/plugin-alias";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "node:path";
import visualizer from "rollup-plugin-visualizer";
import packageJson from "./package.json";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

/**
 * Re-attach the `"use client"` directive to the client entry chunk.
 *
 * Rollup strips module-level directives when bundling (see `onwarn` below), so the
 * per-file directives in `src/components/*` never reach `dist`. Without a directive in
 * the built output a Next.js App Router consumer cannot tell which exports are
 * client-only, and is left choosing between two broken states: mark the package external
 * for Server Components and have the client import resolve to `undefined` during SSR, or
 * bundle it and have `React.createContext` run in the RSC environment, where it does not
 * exist.
 *
 * Keyed on the entry name so the server entries stay server-side. The directive must be
 * the first statement, ahead of the banner comment.
 *
 * @returns {import('rollup').Plugin}
 */
const useClientDirective = () => ({
  name: "use-client-directive",
  renderChunk(code, chunk) {
    if (!chunk.isEntry || chunk.name !== "client") {
      return null;
    }

    return { code: `"use client";\n${code}`, map: null };
  },
});

const getPlugins = (stat, isFullBundle = false) => {
  /**
   * @type {Array<import('rollup').Plugin>}
   */

  const plugins = [
    babel({
      configFile: "./.babelrc.json",
      extensions,
      exclude: [/(node_modules|(editor|compiler)\/dist)/],
      babelHelpers: "runtime",
    }),
    nodeResolve({
      extensions,
      browser: isFullBundle, // browser: true for bundled editor, it's important not to add "node" stuff to the editor that is run in the browser
    }),

    commonjs(),
    json(),

    visualizer({
      filename: stat,
      gzipSize: true,
    }),
  ];

  // if (process.env.NODE_ENV === "production") {
  //     plugins.push(terser());
  // }

  return plugins;
};

const dependencyKeys = Object.keys(packageJson.dependencies || {});
const peerDependencyKeys = Object.keys(packageJson.peerDependencies || {});

const allDependenciesKeys = [
  ...dependencyKeys,
  ...peerDependencyKeys.map((key) => new RegExp(`^${key}`)),
  /@babel\/runtime/,
  /^lodash\//,
  /react-dom/,
];

function createRollupConfigs({
  inputFile,
  baseOutputDir,
  baseStatOutputDir,
  isFullBundle = false,
}) {
  const banner = "/* with love from shopstory */";
  const external = isFullBundle ? [] : allDependenciesKeys;

  const onwarn = (warning, warn) => {
    if (
      warning.message.includes(
        "Module level directives cause errors when bundled, 'use client' was ignored.",
      )
    ) {
      return;
    }

    // parser file is automatically generated and we don't have control over it
    if (
      warning.message.includes(
        `Entry module "../reduce-css-calc/src/parser.js" is implicitly using "default" export mode`,
      )
    ) {
      return;
    }

    warn(warning);
  };

  /** @type import('rollup').RollupOptions */
  const esBundleConfig = {
    input: inputFile,
    output: {
      format: "es",
      dir: `${baseOutputDir}/es`,
      banner,
      sourcemap: false,
    },
    plugins: [
      ...getPlugins(
        path.join(baseStatOutputDir, "es/index.html"),
        isFullBundle,
      ),
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      useClientDirective(),
    ],
    external,
    onwarn,
  };

  /** @type import('rollup').RollupOptions */
  const cjsBundleConfig = {
    input: inputFile,
    output: {
      format: "cjs",
      dir: `${baseOutputDir}/cjs`,
      banner,
      entryFileNames: "[name].cjs",
      sourcemap: false,
    },
    plugins: [
      ...getPlugins(
        path.join(baseStatOutputDir, "cjs/index.html"),
        isFullBundle,
      ),
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      useClientDirective(),
    ],
    external,
    onwarn,
  };

  return [esBundleConfig, cjsBundleConfig];
}

export default createRollupConfigs({
  inputFile: [
    "./src/index.ts",
    "./src/_internals.ts",
    "./src/buildDocument.ts",
    "./src/client.ts",
  ],
  baseOutputDir: "dist",
  baseStatOutputDir: "stats",
});
