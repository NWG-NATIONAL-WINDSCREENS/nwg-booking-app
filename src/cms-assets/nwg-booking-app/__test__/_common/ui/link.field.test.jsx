/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LinkField } from '../../../_common/ui/index.js';

describe('LinkField Component', () => {
  it('renders the link with children', () => {
    render(<LinkField>Click me</LinkField>);

    const linkElement = screen.getByText('Click me');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveClass('cursor-pointer underline');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<LinkField onClick={handleClick}>Click me</LinkField>);

    const linkElement = screen.getByText('Click me');
    fireEvent.click(linkElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom class names', () => {
    render(<LinkField className="text-red-500">Styled Link</LinkField>);

    const linkElement = screen.getByText('Styled Link');
    expect(linkElement).toHaveClass('text-red-500');
  });
});
