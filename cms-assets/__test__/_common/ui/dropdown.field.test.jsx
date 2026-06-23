/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropdownField } from '../../../_common/ui/index.js';

jest.mock('@heroicons/react/16/solid', () => ({
  ChevronDownIcon: jest.fn(() => <svg data-testid="chevron-icon" />),
}));

describe('DropdownField Component', () => {
  let handleChange;
  let handleBlur;
  const options = [
    { id: 1, value: 'Wade Cooper' },
    { id: 2, value: 'Arlene Mccoy' },
  ];

  beforeEach(() => {
    handleBlur = jest.fn();
    handleChange = jest.fn();
  });

  it('renders dropdown with options', () => {
    render(
      <DropdownField
        id="test-dropdown"
        onChange={handleChange}
        required={true}
        options={options}
      />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    fireEvent.focus(select);
    options.forEach((option) => {
      expect(screen.getByText(option.value)).toBeInTheDocument();
    });

    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', () => {
    render(
      <DropdownField
        id="test-dropdown"
        onChange={handleChange}
        options={options}
      />,
    );

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'Wade Cooper' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur when focus is lost', () => {
    render(
      <DropdownField
        id="test-dropdown"
        onBlur={handleBlur}
        onChange={handleChange}
        options={options}
      />,
    );

    const select = screen.getByRole('combobox');

    fireEvent.blur(select);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('displays default selected value if provided', () => {
    render(
      <DropdownField
        id="test-dropdown"
        value="Arlene Mccoy"
        onChange={handleChange}
        options={options}
      />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('Arlene Mccoy');
  });

  it('displays empty options', () => {
    render(
      <DropdownField
        id="test-dropdown"
        value="Arlene Mccoy"
        onChange={handleChange}
      />,
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveTextContent('');
    expect(select.childElementCount).toBe(0);
  });
});
