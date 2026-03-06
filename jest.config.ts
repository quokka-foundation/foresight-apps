import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  coverageThreshold: { global: { lines: 80 } },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^lightweight-charts$': '<rootDir>/test/__mocks__/lightweight-charts.ts',
  },
  testMatch: ['**/test/unit/**/*.test.ts', '**/test/unit/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
}

export default config
