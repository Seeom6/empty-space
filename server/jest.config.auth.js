module.exports = {
  displayName: 'Authentication Tests',
  testMatch: [
    '<rootDir>/src/modules/auth/**/*.spec.ts',
    '<rootDir>/src/package/auth/**/*.spec.ts'
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/modules/auth/**/*.(t|j)s',
    'src/package/auth/**/*.(t|j)s',
    '!src/modules/auth/**/*.spec.ts',
    '!src/package/auth/**/*.spec.ts',
    '!src/modules/auth/**/*.interface.ts',
    '!src/package/auth/**/*.interface.ts',
  ],
  coverageDirectory: './coverage/auth',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup-auth.ts'],
  moduleNameMapping: {
    '^@Modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@Package/(.*)$': '<rootDir>/src/package/$1',
    '^@Infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@Common/(.*)$': '<rootDir>/src/common/$1',
  },
  testTimeout: 30000,
  maxWorkers: 1, // Run tests sequentially to avoid Redis conflicts
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
};
