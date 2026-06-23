import React from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { CheckIcon } from '@heroicons/react/20/solid';

export default function CustomDropdownField({
  className,
  value = '',
  options = [],
  disabled = false,
  onChange,
  placeholder = '',
}) {
  const baseClass = `
  h-12 w-full flex justify-between items-center cursor-default rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-base
  text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2
    ${disabled ? '!bg-gray-100' : ''}`;

  const selectedOption = options.find((option) => option.id === value);

  return (
    <>
      <Listbox value={value} onChange={onChange} as="div" disabled={disabled}>
        <div className="relative">
          <ListboxButton className={`${baseClass} ${className}`}>
            <span
              className={`col-start-1 row-start-1 truncate ${!selectedOption && placeholder ? 'text-gray-400' : ''}`}
            >
              {selectedOption ? selectedOption.value : placeholder}
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
            />
          </ListboxButton>

          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm">
            {options.map((option) => (
              <ListboxOption
                key={option.id}
                value={option.id}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-[var(--dropdown-selected-bg)] data-[focus]:text-white data-[focus]:outline-none"
              >
                <span className="block truncate font-normal group-data-[selected]:font-semibold">
                  {option.value}
                </span>

                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--dropdown-text-selected-bg)] group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                  <CheckIcon aria-hidden="true" className="size-5" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </>
  );
}
