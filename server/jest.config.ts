import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
