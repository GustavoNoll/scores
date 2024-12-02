/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/scalability/',
    '/src/__tests__/mocks/acsInforms/generator.ts'
  ]
};