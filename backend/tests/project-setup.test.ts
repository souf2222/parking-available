import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Project Setup', () => {
  it('should have TypeScript configured correctly', () => {
    const tsconfig = require('../tsconfig.json');
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.target).toBe('ES2020');
    expect(tsconfig.compilerOptions.module).toBe('commonjs');
  });

  it('should have package.json with required scripts', () => {
    const pkg = require('../package.json');
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.start).toBeDefined();
    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });

  it('should have jest configured for testing', () => {
    const jestConfig = require('../jest.config.js');
    expect(jestConfig).toBeDefined();
    expect(jestConfig.preset).toBe('ts-jest');
    expect(jestConfig.testEnvironment).toBe('node');
  });
});
