import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Desmonta el árbol de React entre tests para evitar fugas de estado/DOM.
afterEach(() => {
  cleanup();
});
