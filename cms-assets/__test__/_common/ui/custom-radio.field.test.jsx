/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomRadioField } from '../../../_common/ui/index.js';

describe('CustomRadioField Component', () => {
  const mockOnChange = jest.fn();
  const options = [
    { id: 'option1', value: 'Option 1' },
    { id: 'option2', value: 'Option 2' },
    { id: 'option3', value: 'Option 3' },
  ];

  it('renders all radio options', () => {
    render(
      <CustomRadioField
        id="test-radio"
        value=""
        options={options}
        onChange={mockOnChange}
      />,
    );

    options.forEach((option) => {
      expect(screen.getByText(option.value)).toBeInTheDocument();
    });
  });

  it('preselects the correct option', () => {
    render(
      <CustomRadioField
        id="test-radio"
        value="option2"
        options={options}
        onChange={mockOnChange}
      />,
    );

    const selectedRadio = screen.getByLabelText('Option 2');
    expect(selectedRadio).toBeInTheDocument();
  });

  it('calls onChange when a new option is selected', () => {
    render(
      <CustomRadioField
        id="test-radio"
        value="option1"
        options={options}
        onChange={mockOnChange}
      />,
    );

    const option2Radio = screen.getByLabelText('Option 2');
    fireEvent.click(option2Radio);

    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });
});
