/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonField } from '../../../_common/ui/index.js';

describe('ButtonField Component', () => {
  it('renders button with correct variant styles', () => {
    const { rerender } = render(
      <ButtonField variant="quote">Quote</ButtonField>,
    );

    const button = screen.getByRole('button', { name: 'Quote' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(
      'bg-[var(--btn-quote-bg)] text-[var(--btn-quote-text)]',
    );

    // Test another variant
    rerender(<ButtonField variant="submit">Submit</ButtonField>);
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveClass(
      'bg-[var(--btn-submit-bg)] text-[var(--btn-submit-text)]',
    );
  });
  it('renders button with confirm variant', () => {
    const { rerender } = render(
      <ButtonField variant="confirm">Confirm</ButtonField>,
    );

    const button = screen.getByRole('button', { name: 'Confirm' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('hover:bg-transparent bg-white ');

    // Test another variant
    rerender(<ButtonField variant="submit">Submit</ButtonField>);
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveClass(
      'bg-[var(--btn-submit-bg)] text-[var(--btn-submit-text)]',
    );
  });
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(
      <ButtonField variant="help" onClick={handleClick}>
        Help
      </ButtonField>,
    );

    const button = screen.getByRole('button', { name: 'Help' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders children inside the button', () => {
    render(<ButtonField variant="cancel">Cancel</ButtonField>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders button with a custom class', () => {
    render(
      <ButtonField variant="submit" className="w-100">
        Submit
      </ButtonField>,
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveClass('w-100');
  });
  it('renders button with a disabled attribute', () => {
    render(
      <ButtonField variant="submit" className="w-100" disabled={true}>
        Submit
      </ButtonField>,
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
});
