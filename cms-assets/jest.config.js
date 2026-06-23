export default {
  coverageProvider: 'v8',
  clearMocks: true,
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transformIgnorePatterns: [],
  // setupFilesAfterEnv: ['<rootDir>/nwg-project/nwg-booking-app/jest.setup.js'],
};
