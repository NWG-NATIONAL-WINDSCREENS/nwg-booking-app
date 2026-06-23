import React from 'react';

/**
 * A reusable link component.
 *
 * @param {React.ReactNode} children - The content inside the link.
 * @param {() => void} onClick - Callback function for click events.
 * @param {string} [className=''] - Additional CSS classes for styling.
 */
export default function LinkField({ children, onClick, className = '' }) {
  return (
    <a
      className={`flex text-base underline cursor-pointer text-black transition duration-200 ease-in-out ${className}`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
