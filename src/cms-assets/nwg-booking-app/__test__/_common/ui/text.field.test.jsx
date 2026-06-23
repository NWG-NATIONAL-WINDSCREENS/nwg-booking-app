/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField } from '../../../_common/ui/index.js';

describe('TextField Component', () => {
  let handleChange;
  let handleBlur;

  beforeEach(() => {
    handleBlur = jest.fn();
    handleChange = jest.fn();
  });

  it('renders the input field', () => {
    render(
      <TextField
        id="test-input"
        placeholder="Enter text"
        onChange={handleChange}
        required={true}
      />,
    );

    const inputElement = screen.getByPlaceholderText('Enter text');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'text');
  });

  it('supports custom id and value', () => {
    render(
      <TextField
        id="custom-id"
        value="Test Value"
        readOnly
        onChange={handleChange}
      />,
    );

    const inputElement = screen.getByDisplayValue('Test Value');
    expect(inputElement).toHaveAttribute('id', 'custom-id');
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<TextField id="input-test" onChange={handleChange} />);

    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'New Text' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur when focus is lost', () => {
    const handleBlur = jest.fn();
    render(
      <TextField
        id="input-blur-test"
        onChange={handleChange}
        onBlur={handleBlur}
      />,
    );

    const inputElement = screen.getByRole('textbox');
    fireEvent.blur(inputElement);

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('applies custom class names', () => {
    render(<TextField className="text-red-500" onChange={handleChange} />);

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('text-red-500');
  });
});
