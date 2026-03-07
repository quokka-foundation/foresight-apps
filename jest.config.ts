import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  coverageThreshold: { global: { lines: 80 } },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^lightweight-charts$": "<rootDir>/src/test/__mocks__/lightweight-charts.ts",
  },
  testMatch: ["**/test/unit/**/*.test.ts", "**/test/unit/**/*.test.tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
};

export default config;
