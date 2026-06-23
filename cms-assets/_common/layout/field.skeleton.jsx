import React from 'react';

/**
 * A skeleton placeholder for a form field.
 *
 * This component serves as a loading state for form fields, displaying placeholder elements
 * for both the label and the input field. Background colors are customizable via CSS variables.
 */
export default function FieldSkeleton() {
  const baseClass = `h-12 rounded-[4px] w-full px-3 py-1.5 text-base pr-10 bg-[var(--field-skeleton-control-bg)]`;

  return (
    <>
      <div className={'flex-1'}>
        <div className="h-6 rounded-[4px] bg-[var(--field-skeleton-label-bg)] w-20 block text-sm/6"></div>
        <div className={`mt-2 relative ${baseClass} `}></div>
      </div>
    </>
  );
}
