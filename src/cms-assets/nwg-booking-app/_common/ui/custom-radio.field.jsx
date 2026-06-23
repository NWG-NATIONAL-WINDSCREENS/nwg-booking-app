import React from 'react';
import radio_selected from '../../assets/radio-selected.svg';
import radio_not_selected from '../../assets/radio-not-selected.svg';

/**
 * A custom multi-select checkbox group component.
 * @param {string} id - The unique identifier for the input field.
 * @param {string} [className] - Additional CSS classes for styling.
 * @param {string} [value=''] - A delimited string of currently selected values.
 * @param {boolean} [disabled=false] - Disables the button when set to `true`.
 * @param disableOptionKey
 * @param {Array<{ id: string, value: string }>} [options=[]] - The list of checkbox options.
 * @param {(value: string) => void} onChange - Callback function to handle value changes.
 * @param {'multi' | 'single'} [selectType='single'] - Determines whether multi-select or single-select is enabled.
 * @param showSelectionIndicator
 * @param {'flex' | 'grid' | 'grid-sm' } [layout=flex] - Determines whether layout of the options.
 * @param {string} [optionClassName] - Additional CSS classes for options.
 */
export default function CustomCheckboxField({
  id,
  className = '',
  value = '',
  disabled = false,
  disableOptionKey,
  options = [],
  onChange,
  selectType = 'single',
  layout = 'flex',
  showSelectionIndicator = false,
  invertSelectedImages = false,
  optionClassName = '',
}) {
  const selectedArray = selectType === 'multi' ? value.split(',') : [value];

  const handleChange = (currentValue) => {
    let newSelectedValues;

    if (selectType === 'multi') {
      // Multi-select behavior: add or remove value from delimited string
      if (selectedArray.includes(currentValue)) {
        newSelectedValues = selectedArray
          .filter((v) => v !== currentValue)
          .filter(Boolean) // Remove any empty values
          .join(',');
      } else {
        newSelectedValues = [...selectedArray, currentValue]
          .filter(Boolean) // Remove any empty values
          .join(',');
      }
    } else {
      newSelectedValues = currentValue;
    }

    onChange(newSelectedValues);
  };

  const renderIndicator = (id) => {
    return (
      <>
        {selectedArray.includes(id) ? (
          <img
            src={radio_selected}
            alt="Selected"
            className="size-5 transition-opacity duration-300 ease-in-out"
          />
        ) : (
          <img
            src={radio_not_selected}
            alt="Not selected"
            className="size-5 transition-opacity duration-300 ease-in-out"
          />
        )}
      </>
    );
  };
  return (
    <fieldset aria-label={id}>
      <div
        className={`${className} gap-3 ${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-5 grid-cols-responsive' : layout === 'grid-sm' ? 'grid grid-cols-2 [@media(max-width:500px)]:grid-cols-1' : 'flex flex-col w-full'}`}
      >
        {options &&
          options.map((option) => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                id={option.id}
                checked={selectedArray.includes(option.id)}
                onChange={() => handleChange(option.id)}
                aria-label={option.value}
                disabled={disabled || option.id === disableOptionKey}
                className={`absolute opacity-0`}
              />
              <label
                htmlFor={option.id}
                className={`w-full flex p-3 rounded-sm text-sm/6 font-medium auto-rows-max text-gray-700 cursor-pointer ${optionClassName}
                ${layout === 'grid' ? 'h-[120px] [@media(max-width:500px)]:h-[100px] items-end justify-center text-center' : layout === 'grid-sm' ? `${showSelectionIndicator ? 'justify-between' : 'justify-center sm:justify-start'}` : 'items-center'}
               ${disabled || option.id === disableOptionKey ? (selectedArray.includes(option.id) ? 'bg-gray-400! text-white cursor-not-allowed' : 'bg-gray-200! text-gray-400 cursor-not-allowed') : selectedArray.includes(option.id) ? 'bg-[var(--radio-selected-bg)]! text-white cursor-pointer' : `bg-[var(--radio-bg)] cursor-pointer`}`}
              >
                <div
                  className={`h-full w-full flex flex-col ${option.image ? 'justify-center items-center' : ''}`}
                >
                  {option.image && (
                    <img
                      src={option.image}
                      width={50}
                      height={50}
                      className={`pt-3 ${invertSelectedImages && selectedArray.includes(option.id) ? 'brand-invert' : ''}`}
                      alt={option.value}
                    />
                  )}
                  <span
                    className={
                      'basis-[50%] font-bold [@media(max-width:450px)]:text-xs'
                    }
                  >
                    {option.value}
                  </span>
                </div>
                {showSelectionIndicator && renderIndicator(option.id)}
              </label>
            </div>
          ))}
      </div>
    </fieldset>
  );
}
