import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

/**
 * A reusable layout component for form fields.
 *
 * Props:
 * @param {string} id - The unique identifier for the form field.
 * @param {string} label - The label text for the form field.
 * @param {React.ReactNode} children - The input or form control element.
 * @param {string} [error] - Optional error message to display.
 * @param toggle
 * @param {boolean} [showRequiredIdentifier] - Optional flag to show required indicator to display.
 * @param {boolean} [showErrorIcon] - Determines whether the error icon will be shown
 */
export default function FieldLayout({
  id,
  label,
  children,
  error,
  warning,
  toggle,
  showRequiredIdentifier = false,
  showErrorIcon = true,
}) {
  return (
    <>
      <div className={'flex-1 relative'}>
        <label htmlFor={id} className="flex gap-1 block text-sm/6">
          <span>{label}</span>
          {showRequiredIdentifier && (
            <>
              <span className={'text-red-600'}>*</span>
            </>
          )}
        </label>
        <div className="mt-2 relative">
          {children}
          {error && showErrorIcon && (
            <ExclamationCircleIcon
              data-testid="error-icon"
              aria-hidden="true"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-red-500 transition-opacity`}
            />
          )}
        </div>
        {error && (
          <div data-testid={`${id}-error`} className="mt-1 error-message">
            {error}
          </div>
        )}
        {warning && (
          <div data-testid={`${id}-warning`} className="mt-1 warning-message">
            {warning}
          </div>
        )}
        {toggle && (
          <div
            data-testid={`${id}-error`}
            className={`absolute ${error ? 'bottom-0' : ''} right-0 mt-1`}
          >
            {toggle}
          </div>
        )}
      </div>
    </>
  );
}
