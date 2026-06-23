/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { FieldSkeleton } from '../../../_common/layout/index.js';

describe('FieldSkeleton Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<FieldSkeleton />);
    expect(container).toBeInTheDocument();
  });

  it('renders label skeleton', () => {
    const { getByText } = render(<FieldSkeleton />);
    const labelSkeleton = getByText((content, element) =>
      element?.classList.contains('bg-[var(--field-skeleton-label-bg)]'),
    );
    expect(labelSkeleton).toBeInTheDocument();
  });

  it('renders field skeleton', () => {
    const { container } = render(<FieldSkeleton />);
    const fieldSkeleton = container.querySelector('div.mt-2');
    expect(fieldSkeleton).toBeInTheDocument();
  });
});
