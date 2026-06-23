/* eslint-disable */
// TODO: DELETE AS DEPRECATED
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid/index.js';
import calendar from '../../assets/calendar.svg';

dayjs.extend(customParseFormat);

export default function CalendarField({ value, minDate, maxDate, onChange }) {
  const parseDate = (str) => {
    if (str) {
      const [day, month, year] = str.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  const [localValue, setLocalValue] = useState(parseDate(value));
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    activeStartDate.toLocaleString('en-AU', { month: 'long' }),
  );

  const year = localValue.getFullYear();

  const header = `${currentMonth} ${year}`;

  const handleChange = (current) => {
    setLocalValue(current);
    if (current) {
      onChange(current.toLocaleDateString('en-AU'));
    }
  };

  const updateMonth = (newDate) => {
    setActiveStartDate(newDate);
    setCurrentMonth(newDate.toLocaleString('en-AU', { month: 'long' }));
  };

  const goToPreviousMonth = () => {
    const prevMonthEnd = new Date(
      activeStartDate.getFullYear(),
      activeStartDate.getMonth(),
      0,
    ); // 0th day of the current month is the last day of the previous month

    // Compare the last day of the previous month with minDate
    if (prevMonthEnd >= minDate) {
      updateMonth(prevMonthEnd);
    }
  };

  const goToNextMonth = () => {
    const next = new Date(
      activeStartDate.getFullYear(),
      activeStartDate.getMonth() + 1,
      1,
    );
    if (next <= maxDate) {
      updateMonth(next);
    }
  };
  const isPrevDisabled =
    new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1) <
    minDate;

  const isNextDisabled =
    new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 1) >
    maxDate;

  useEffect(() => {
    if (value) {
      setLocalValue(parseDate(value));
    }
  }, [value]);

  return (
    <div className={'flex flex-col gap-3'}>
      <Disclosure>
        {({ open }) => (
          <>
            <div
              className={
                'bg-white flex flex-row justify-between items-center px-6'
              }
            >
              <button
                onClick={goToPreviousMonth}
                disabled={isPrevDisabled}
                className={`w-10 h-10`}
              >
                <ChevronLeftIcon
                  className={`w-6 text-black ${isPrevDisabled ? 'text-gray-300' : 'cursor-pointer'}`}
                />
              </button>
              <DisclosureButton className="w-full justify-center flex items-center center gap-2 p-6">
                <img
                  src={calendar}
                  alt="Calendar"
                  className={`size-6 transition-opacity duration-300 ease-in-out`}
                />
                <span className="text-base font-bold pt-1">{header}</span>
              </DisclosureButton>
              <button
                onClick={goToNextMonth}
                disabled={isNextDisabled}
                className={`w-10 h-10`}
              >
                <ChevronRightIcon
                  className={`w-6 text-black ${
                    isNextDisabled ? 'text-gray-300' : 'cursor-pointer'
                  }`}
                />
              </button>
            </div>
            <DisclosurePanel
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col border-1 border-gray-200 divide-y divide-gray-300">
                <div className={'p-6 pb-12 bg-white'}>
                  <Calendar
                    value={localValue}
                    minDate={minDate}
                    maxDate={maxDate}
                    onChange={(current) => handleChange(current)}
                    onClickLabel={(e) => e.preventDefault()}
                    activeStartDate={activeStartDate}
                    formatShortWeekday={(locale, date) =>
                      date
                        .toLocaleDateString(locale, { weekday: 'short' })
                        .slice(0, 2)
                    }
                    prevLabel={
                      <ChevronLeftIcon
                        className={`w-6 h-6  ${
                          isPrevDisabled
                            ? 'text-gray-300'
                            : 'cursor-pointer  text-black'
                        }`}
                        onClick={goToPreviousMonth}
                      />
                    }
                    nextLabel={
                      <ChevronRightIcon
                        className={`w-6 h-6  ${
                          isNextDisabled
                            ? 'text-gray-300'
                            : 'cursor-pointer  text-black'
                        }`}
                        onClick={goToNextMonth}
                      />
                    }
                  />
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
