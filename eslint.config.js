const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['dist/**', 'node_modules/**', 'webpack.config.js', 'src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.app.json',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        HTMLCanvasElement: 'readonly',
        WebGLRenderingContext: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      'no-unreachable': 'error',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    files: ['src/**/__tests__/**/*.ts', 'src/**/__tests__/**/*.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.test.json',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      'no-unreachable': 'error',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
];