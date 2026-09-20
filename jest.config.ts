import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  transform: {
    "\\.[jt]sx?$": ["babel-jest", { rootMode: "upward" }],
  },
  // The same alias `tsconfig.json` gives the compiler (`baseUrl: src`, `@/*`).
  // Without it here, half the suites in this package — `resop`, `normalize`,
  // `compileInternal` and the rich-text ones among them — failed to load at all
  // and were reported as suite errors rather than as tests. They have been
  // running green as "21 failed to run" for long enough that the compiler's
  // own tests were not covering the compiler.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
};

export default config;
