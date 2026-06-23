/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { FieldLayout } from '../../../_common/layout/index.js';

describe('FieldLayout Component', () => {
  it('renders label and children', async () => {
    await act(async () => {
      render(
        <FieldLayout label="Test Label">
          <input type="text" data-testid="input-field" />
        </FieldLayout>,
      );
    });
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('input-field')).toBeInTheDocument();
  });

  it('displays error message and icon when error is provided', async () => {
    await act(async () => {
      render(
        <FieldLayout label="Test Label" error="Required field">
          <input type="text" />
        </FieldLayout>,
      );
    });
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('does not show error message and icon when there is no error', async () => {
    await act(async () => {
      render(
        <FieldLayout label="Test Label">
          <input type="text" />
        </FieldLayout>,
      );
    });
    expect(screen.queryByText('Required field')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-icon')).not.toBeInTheDocument();
  });
});
