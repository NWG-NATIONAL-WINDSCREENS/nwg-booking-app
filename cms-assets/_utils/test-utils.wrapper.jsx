import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '../_stores/store.js';

/**
 * Custom render function for testing components with Redux.
 *
 * @param {React.ReactElement} ui - The component to render.
 * @param {Object} [options] - Additional options.
 * @param {Object} [options.preloadedState={}] - Initial state for the Redux store.
 * @param {Object} [options.store] - Custom Redux store (if not provided, a new one is created).
 * @returns {Object} The result of the render and the store instance.
 */
export function renderWithProviders(
  ui,
  { store = setupStore({}), ...renderOptions } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
