import React from 'react';
import { CheckIcon } from './icons.jsx';

/**
 * A reusable text input field component.
 *
 * @param {string} id - The unique identifier for the input field.
 * @param {string} [className] - Additional CSS classes for styling.
 * @param {boolean} [required=false] - Whether the input is required.
 * @param {string} [placeholder=''] - Placeholder text for the input.
 * @param {string} [value=''] - The controlled value of the input.
 * @param hasAutoTrim
 * @param {boolean} [allowSpecialChars=false] - The flag filters special characters in the text field.
 * @param {boolean} [uppercase=false] - The flag that converts value to uppercase letters.
 * @param disabled
 * @param {() => void} onChange - Callback function triggered on change.
 * @param {boolean} validated - Flag to show a check mark on the text field.
 */
export default function TextField({
  id,
  className,
  required = false,
  placeholder = '',
  value = '',
  uppercase = false,
  hasAutoTrim = false,
  allowSpecialChars = true,
  disabled = false,
  onChange,
  validated,
}) {
  const baseClass = `
  rounded-md h-12 w-full bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 text-gray-900 
  placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--input-outline-bg)] pr-10
  ${disabled ? '!bg-gray-100' : ''}`;

  const handleChange = (e) => {
    let newValue = e.target.value;

    if (hasAutoTrim) {
      newValue = newValue.replace(/\s+/g, '');
    }

    if (!allowSpecialChars) {
      newValue = newValue.replace(/[^a-zA-Z0-9 ]/g, '');
    }

    if (uppercase) {
      newValue = newValue.toUpperCase();
    }

    onChange(newValue);
  };

  return (
    <>
      <input
        id={id}
        name={id}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        value={value ?? ''}
        // onBlur={onBlur}
        onChange={handleChange}
        data-testid={id}
        className={`${baseClass} ${className}`}
        autoComplete="off"
      />
      {validated && value && (
        <CheckIcon
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-[var(--brand-primary)] transition-opacity duration-300 ease-in-out ${!validated ? 'opacity-0 scale-10 invisible' : 'opacity-100 scale-100 visible'}`}
        />
      )}
    </>
  );
}
