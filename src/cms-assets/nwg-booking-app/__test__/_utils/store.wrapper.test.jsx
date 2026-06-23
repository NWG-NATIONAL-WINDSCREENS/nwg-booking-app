/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import StoreWrapper from '../../_utils/store.wrapper';
import { setupStore } from '../../_stores/store.js';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('StoreWrapper', () => {
  it('should provide the Redux store to children components', () => {
    useSelector.mockReturnValue({});

    const { getByText } = render(
      <StoreWrapper>
        <div>Test Component</div>
      </StoreWrapper>,
    );

    expect(getByText('Test Component')).toBeInTheDocument();
  });

  it('should initialize store correctly', () => {
    const store = setupStore();
    expect(store.getState()).toBeDefined();
  });
});
