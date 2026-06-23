import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

/**
 * A reusable dropdown (select) field component.
 *
 * @param {string} id - The unique identifier for the select field.
 * @param {string} [className] - Additional CSS classes for styling.
 * @param {boolean} [required=false] - Whether the field is required.
 * @param {string} [value=''] - The currently selected value.
 * @param {Array<{ id: string, value: string }>} [options=[]] - The list of selectable options.
 * @param {(event: React.FocusEvent<HTMLSelectElement>) => void} [onBlur] - Callback for the `onBlur` event.
 * @param {(event: React.ChangeEvent<HTMLSelectElement>) => void} onChange - Callback for the `onChange` event.
 */
export default function DropdownField({
  id,
  className,
  required = false,
  value = '',
  options = [],
  onBlur,
  onChange,
}) {
  const baseClass = `h-12 w-full px-3 py-1.5 appearance-none rounded-sm bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2  pr-10`;

  return (
    <>
      <select
        id={id}
        name={id}
        value={value ?? ''}
        onBlur={onBlur}
        onChange={onChange}
        required={required}
        className={`${baseClass} ${className}`}
        data-testid={id}
      >
        <option className={'hidden'} />
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.value}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="absolute right-3 top-1/2 transform -translate-y-1/2  pointer-events-none size-5 text-gray-500 sm:size-4"
      />
    </>
  );
}
