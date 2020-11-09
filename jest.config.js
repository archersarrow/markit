module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  modulePathIgnorePatterns: [
    '<rootDir>/src/renderer/.next/',
    '<rootDir>/src/renderer/constants/',
    '<rootDir>/src/electron/'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest'
  },
  testRegex: '/__tests__/.*\\.(test|spec)\\.js?$',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/renderer/next.config.js']
}
