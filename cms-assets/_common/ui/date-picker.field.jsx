import React, { useState } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
const dateFormat = 'DD/MM/YYYY';
/**
 * A reusable date picker field component.
 *
 * @param {string} [className] - Additional CSS classes for styling.
 * @param {string} [value=''] - The controlled value of the input.
 * @param {Date} [maxDate='new Date()'] - The maximum date selectable in the picker.
 * @param {(value) => void} onChange - Callback function triggered on change.
 */
export default function DatePickerField({
  className,
  value = '',
  maxDate = dayjs(),
  onChange,
}) {
  const baseClass = `rounded-md h-12 w-full bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--input-outline-bg)] pr-10`;
  const [localValue, setLocalValue] = useState(
    value ? dayjs(value, 'DD/MM/YYYY') : '',
  );
  const disableAfterToday = (current) => {
    return current && current > maxDate.endOf('day');
  };
  const handleChange = (current) => {
    setLocalValue(current);
    if (current) {
      onChange(current.format('DD/MM/YYYY'));
    }
  };
  return (
    <>
      <DatePicker
        className={`${baseClass} ${className}`}
        format={{
          format: dateFormat,
          type: 'mask',
        }}
        value={localValue}
        disabledDate={disableAfterToday}
        onChange={(current) => handleChange(current)}
      />
    </>
  );
}
