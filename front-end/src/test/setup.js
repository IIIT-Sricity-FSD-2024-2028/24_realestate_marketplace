/**
 * setup.js
 * Purpose: Runs before every Vitest test file — adds DOM matchers such as
 *          toBeInTheDocument() and clears browser storage between tests.
 * Inputs:  none.  Outputs: none.  API calls: none.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup(); // unmount components rendered by the test
  localStorage.clear(); // each test starts signed out with empty storage
  sessionStorage.clear();
});
