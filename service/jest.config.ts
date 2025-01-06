import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
   preset: "ts-jest",
   globalSetup: './beforeAllTests.ts',
   modulePathIgnorePatterns: [
      '/.stryker-tmp/',
   ],
   testEnvironment: "node",
   testMatch: [
      '**/?(*.)+(micro|integration).ts',
   ],
   testPathIgnorePatterns: [
      '/node_modules/',
      '/build/',
      '/coverage/',
      '/tsoa-generated/',
   ],
   collectCoverageFrom: [
      '**/*.ts',
      '!*.config.*',
      '!**/tsoa-generated/**/*.ts',
   ],
   testTimeout: 60_000,
   coverageThreshold: {
      global: {
         branches: 20,
         functions: 20,
         lines: 20,
         statements: 20
      }
   },
   passWithNoTests: true,
   coverageDirectory: 'coverage',
}

export default config;
