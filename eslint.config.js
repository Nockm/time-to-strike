import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import tsStylistic from '@stylistic/eslint-plugin-ts'
import jsStylistic from '@stylistic/eslint-plugin-js'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.all,
      ...tseslint.configs.all,
      jsStylistic.configs.all,
      tsStylistic.configs.all,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Personal preferences. (Unlikely to change these.)
      "@stylistic/js/array-element-newline": "off",
      "@stylistic/js/brace-style": "off",
      "@stylistic/js/comma-dangle": ["warn", "always-multiline"],
      "@stylistic/js/dot-location": ["error", "property"],
      "@stylistic/js/function-call-argument-newline": "off",
      "@stylistic/js/linebreak-style": ["warn", "windows"],
      "@stylistic/js/multiline-comment-style": "off",
      "@stylistic/js/multiline-ternary": "off",
      "@stylistic/js/no-confusing-arrow": "off",
      "@stylistic/js/object-curly-spacing": ["warn", "always"],
      "@stylistic/js/object-property-newline": "off",
      "@stylistic/js/padded-blocks": ["warn", "never"],
      "@stylistic/js/quotes": ["warn", "single"],
      "@stylistic/ts/array-element-newline": "off",
      "@stylistic/ts/brace-style": "off",
      "@stylistic/ts/comma-dangle": ["warn", "always-multiline"],
      "@stylistic/ts/object-curly-spacing": ["warn", "always"],
      "@stylistic/ts/object-property-newline": "off",
      "@stylistic/ts/quotes": ["warn", "single"],
      "@typescript-eslint/max-params": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "capitalized-comments": "off",
      "func-style": "off",
      "id-length": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-params": "off",
      "max-statements": "off",
      "no-console": "off",
      "no-duplicate-imports": "off",
      "no-inline-comments": "off",
      "no-ternary": "off",
      "one-var": "off",
      "sort-imports": "off",
      "sort-keys": "off",

      // Not sure. (Need to try `strictNullChecks` compiler option first.)
      "@typescript-eslint/prefer-nullish-coalescing": "off", // This rule requires the `strictNullChecks` compiler option to be turned on to function correctly
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off", // This rule requires the `strictNullChecks` compiler option to be turned on to function correctly
      "@typescript-eslint/no-unnecessary-condition": "off", // This rule requires the `strictNullChecks` compiler option to be turned on to function correctly
      "@typescript-eslint/strict-boolean-expressions": "off", // This rule requires the `strictNullChecks` compiler option to be turned on to function correctly

      // Need a lot of time to fix these.
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // Should fix these soon.
      "no-await-in-loop": "off",
    },
  },
  {
    // App-specific
    files: [
      'src/**/*.{ts,tsx}',
    ],
    rules: {
      "@typescript-eslint/naming-convention": ["off"],
    },
  },
  {
    // Script-specific
    files: [
      'data/**/*.{ts,tsx}',
      'test/**/*.{ts,tsx}',
    ],
    rules: {
    },
  },
)
