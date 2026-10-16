/**
 * eslint.config.js
 * Purpose: Lint rules for the React frontend (`npm run lint`).
 * Inputs:  every .js/.jsx file under src/.
 * Outputs: warnings/errors in the terminal.
 * API calls: none.
 * Rule sets: ESLint recommended + React + Rules of Hooks + jsx-a11y (accessibility).
 */
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // React 17+ JSX: no "import React" needed
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/prop-types': 'off', // props are documented in each file header instead
      // Our components take an account `role` prop ("admin", "buyer"…), which is not an ARIA role.
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
      // Backdrops close on click; keyboard users close with Escape (handled in Modal).
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      // Modals move focus into the first field on open by design.
      'jsx-a11y/no-autofocus': 'off',
    },
  },
];
