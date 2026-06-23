import React, { useEffect, useRef, useState } from 'react';
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
  MapPinIcon,
} from '@heroicons/react/20/solid/index.js';
import calendar from '../../assets/calendar.svg';
import { Carousel, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  setRepairerDisplayedDataKey,
  setSelectedAppointmentDate,
  setSelectedAppointmentDateTime,
  toggleAppointmentOverlay,
} from '../../_slices/booking.slice.js';
import { MapWidget } from './index.js';
import MapErrorBoundary from './map-error-boundary.jsx';
import map_white from '../../assets/map_white.svg';
import map from '../../assets/map.svg';
import { formatDateLong, parseDate } from '../../_utils/date-util.js';

dayjs.extend(customParseFormat);

export default function CustomCalendarField({
  value,
  minDate,
  maxDate,
  options,
  onChange,
}) {
  //  region Local States/References
  const dispatch = useDispatch();
  const carouselRefs = useRef([]);

  const [localValue, setLocalValue] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [calendarChange, setCalendarChange] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    activeStartDate.toLocaleString('en-AU', { month: 'long' }),
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  const [delayedExpanded, setDelayedExpanded] = useState(false);
  const isMobile = window.innerWidth <= 500;
  // endregion
  // region Redux States
  const data = useSelector((state) => state.booking);
  const {
    user_booking,
    appointment_overlay,
    repairers_loading: isLoading,
    repairer_displayed_data_key,
  } = data;
  const { has_booked } = user_booking;
  const {
    service_appointment_date_time_branch_index: branchIndex,
    service_appointment_date_time_page_index: pageIndex,
    service_appointment_date,
    service_location,
  } = user_booking;
  const homeService = service_location === 'at_home';
  // endregion
  // region Functions
  const updateMonth = (newDate) => {
    setActiveStartDate(newDate);
    setCurrentMonth(newDate.toLocaleString('en-AU', { month: 'long' }));
  };
  const goToPreviousMonth = () => {
    const prevMonthEnd = new Date(
      activeStartDate.getFullYear(),
      activeStartDate.getMonth(),
      0,
    );

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
  const goToSlide = (index, carouselIndex = null) => {
    if (carouselIndex !== null) {
      const carousel =
        carouselRefs.current[appointment_overlay ? 0 : carouselIndex];
      if (carousel && typeof carousel.goTo === 'function') {
        carousel.goTo(index);
      }
    } else {
      carouselRefs.current.forEach((carousel) => {
        if (carousel && typeof carousel.goTo === 'function') {
          carousel.goTo(index);
        }
      });
    }
  };
  const toggleExpand = (index) => {
    setExpanded((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };
  const toggleOverlay = () => {
    dispatch(toggleAppointmentOverlay(!appointment_overlay));
  };
  const countAppointmentOptions = (appointmentDate) => {
    if (options) {
      const totalOptions = options.reduce((total, option) => {
        if (Array.isArray(option[repairer_displayed_data_key])) {
          option[repairer_displayed_data_key].forEach((item) => {
            item.week.forEach((day) => {
              if (day.date === appointmentDate && !day.disabled) {
                const serviceCentreOptions = day.options.filter(
                  (opt) =>
                    opt.service_location === service_location && !opt.disabled,
                );
                total += serviceCentreOptions.length;
              }
            });
          });
        }
        return total;
      }, 0);

      setAvailableSlots(totalOptions);
    }
  };
  //endregion
  // region Event handlers
  const handleCalendarChange = (current) => {
    setCalendarChange(true);

    const formattedDate = dayjs(current).format('DD/MM/YYYY H:mm');

    setLocalValue(current);
    dispatch(setSelectedAppointmentDate(formattedDate));
  };
  const handleChange = (currentValue, selectedIndexes) => {
    onChange(currentValue);

    const current = parseDate(currentValue.value, minDate);

    updateMonth(current);
    setLocalValue(current);

    const formattedDate = dayjs(current).format('DD/MM/YYYY H:mm');

    if (selectedIndexes) {
      const { branchIndex, pageIndex, dayIndex } = selectedIndexes;
      dispatch(
        setSelectedAppointmentDateTime({
          service_appointment_date: formattedDate,
          service_appointment_date_time_branch_index: branchIndex,
          service_appointment_date_time_page_index: pageIndex,
          service_appointment_date_time_day_index: dayIndex,
        }),
      );
    }
  };
  const handleAppointmentOverlayOptions = () => {
    if (options) {
      if (appointment_overlay) {
        if (window.innerWidth <= 1023) {
          if (value) {
            const current = options.filter(
              (branch) => branch.repairer_id === value.repairer_id,
            );
            setLocalOptions(current);
          } else {
            setLocalOptions([]);
          }
        } else {
          setLocalOptions(options);
        }
      } else {
        setLocalOptions(options);
      }
    }
    setTimeout(() => {
      setOptionsLoading(false);
    }, 1000);
  };
  const handleAppointmentOptionsCount = () => {
    if (localValue) {
      const serviceAppointmentDate = localValue.toLocaleDateString('en-AU');
      countAppointmentOptions(serviceAppointmentDate);
    }
  };
  // endregion
  // region Hooks - Use Effect
  useEffect(() => {
    if (service_appointment_date) {
      const selectedDate = parseDate(service_appointment_date);
      setLocalValue(selectedDate);
    }

    if (isMobile) {
      dispatch(setRepairerDisplayedDataKey('paginated_date_options_sm'));
    } else {
      dispatch(setRepairerDisplayedDataKey('paginated_date_options'));
    }

    if (window.innerWidth <= 1023) {
      if (value && options) {
        const current = options.filter(
          (branch) => branch.repairer_id === value.repairer_id,
        );
        setLocalOptions(current);
      }
    } else {
      setLocalOptions(options);
    }

    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (localValue && options && service_location) {
      handleAppointmentOptionsCount();
    }

    // Make sure that paginated_date_options is available in the branch object
    // And the change is coming from calendarChange local state
    if (localValue && options && calendarChange) {
      const serviceAppointmentDate = localValue.toLocaleDateString('en-AU');
      const branchIndex = localOptions.findIndex(
        (opt) =>
          Array.isArray(opt[repairer_displayed_data_key]) &&
          opt[repairer_displayed_data_key].length > 0 &&
          opt.repairer_id === value?.repairer_id,
      );

      if (branchIndex === -1) {
        return;
      }

      const optionWithPages = options[branchIndex];
      const pages = optionWithPages[repairer_displayed_data_key];

      const tryFindMatch = (targetDate) => {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const dayIndex = page.week.findIndex(
            (day) => day.date === targetDate,
          );
          if (dayIndex !== -1) {
            return { pageIndex: i, dayIndex, matchedDay: page[dayIndex] };
          }
        }
        return null;
      };

      let result = tryFindMatch(serviceAppointmentDate);

      if (!result) {
        const [day, month, year] = serviceAppointmentDate.split('/');
        let current = new Date(`${year}-${month}-${day}`);

        // Fallback if no match has been found, and finds closest previous date
        for (let i = 1; i <= 30; i++) {
          current.setDate(current.getDate() - 1);
          const fallbackDate = current
            .toLocaleDateString('en-GB')
            .split('/')
            .map((part) => part.padStart(2, '0'))
            .join('/');

          result = tryFindMatch(fallbackDate);
          if (result) break;
        }
      }

      if (result) {
        goToSlide(result.pageIndex, branchIndex);
        // Set calendar's change local state = false to reset
        setCalendarChange(false);
      } else {
        console.log('No match found even after fallback.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue]);
  useEffect(() => {
    const key = homeService
      ? isMobile
        ? 'at_home_paginated_date_options_sm'
        : 'at_home_paginated_date_options'
      : isMobile
        ? 'paginated_date_options_sm'
        : 'paginated_date_options';
    dispatch(setRepairerDisplayedDataKey(key));
    // void handleMapEventChange(
    //     dispatch,
    //     null,
    //     key,
    //     service_location,
    //     null,
    //     options,
    //     current,
    // );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service_location]);
  useEffect(() => {
    if (value && !optionsLoading) {
      if (window.innerWidth <= 1023 && appointment_overlay) {
        const current = options.filter(
          (branch) => branch.repairer_id === value.repairer_id,
        );
        setLocalOptions(current);
      } else {
        setLocalOptions(options);
      }

      if (value.value) {
        const selectedDate = parseDate(value.value);

        updateMonth(selectedDate);
        setLocalValue(selectedDate);

        setTimeout(() => {
          // setCalendarChange(true);

          if (pageIndex !== null && branchIndex !== null) {
            goToSlide(pageIndex, branchIndex);

            if (!expanded[branchIndex]) {
              // collapseAll(branchIndex);
            }
          }
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, optionsLoading]);
  useEffect(() => {
    if (options && service_location === 'service_centre' && !value) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      // setLocalValue(currentDate);
      // dispatch(setSelectedAppointmentDate(currentDate.toLocaleString()));
    }
    handleAppointmentOverlayOptions();
    handleAppointmentOptionsCount();

    if (options && options.length > 0) {
      let localPageIndex = 0;

      const isHomeService = repairer_displayed_data_key.includes('at_home');
      const currentFlag = isHomeService
        ? 'home_options_disabled'
        : 'service_centre_options_disabled';

      const isOptionsDisabled =
        options[0][repairer_displayed_data_key][localPageIndex][currentFlag];

      if (isOptionsDisabled) {
        localPageIndex++;
        setTimeout(() => goToSlide(localPageIndex), 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);
  useEffect(() => {
    setOptionsLoading(true);
    handleAppointmentOverlayOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment_overlay]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedExpanded(expanded.some((expand) => expand));
    });

    return () => clearTimeout(timer);
  }, [expanded]);
  // endregion
  // region UX Components
  const renderCarousel = (
    branch,
    displayedDateOptions,
    branchIndex,
    expanded,
    value,
    handleChange,
  ) => {
    return (
      <Carousel
        ref={(el) => (carouselRefs.current[branchIndex] = el)}
        className={'custom-carousel'}
        arrows
        dots={false}
        infinite={false}
      >
        {displayedDateOptions.map((paginated_date_option, pageIndex) => (
          <div key={pageIndex}>
            <div className={'flex flex-row gap-3'}>
              {paginated_date_option.week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`flex flex-col gap-3 items-center justify-center ${homeService ? (isMobile ? 'basis-[50%]' : 'basis-[33%]') : ''}`}
                >
                  {/*region Day and Date*/}
                  <div className={'flex flex-col justify-center items-center'}>
                    <b className={'text-[8px] capitalize'}>{day.day}</b>
                    <span className={'text-[10px]'}>{day.label}</span>
                  </div>
                  {/*endregion*/}
                  {/*region Timeslots*/}
                  <div
                    className={`w-full flex flex-col gap-3 overflow-hidden transition-[max-height] duration-300 ease-in-out  ${
                      expanded[branchIndex]
                        ? 'max-h-[1000px]'
                        : `${
                            appointment_overlay
                              ? `[@media(max-width:670px)]:${homeService ? (isMobile ? 'max-h-[200px]' : '') : 'max-h-[30px]'}`
                              : '[@media(max-width:375px)]:max-h-[120px] max-h-[140px]'
                          }`
                    }`}
                  >
                    {day.options &&
                      day.options
                        .filter((option) => {
                          return option.service_location === service_location;
                        })
                        .map((option) => {
                          const disabled =
                            (branch.travel_distance > 50000 && homeService) ||
                            has_booked ||
                            option.disabled;

                          return (
                            <div
                              key={option.id}
                              className="flex items-center gap-3"
                            >
                              <input
                                data-lpignore="true"
                                type="checkbox"
                                id={option.id}
                                checked={value?.id === option.id}
                                onChange={() =>
                                  handleChange(option, {
                                    branchIndex,
                                    pageIndex,
                                    dayIndex,
                                  })
                                }
                                aria-label={option.label}
                                disabled={disabled}
                                className={`absolute opacity-0`}
                              />
                              <label
                                htmlFor={option.id}
                                className={`${homeService ? 'h-10' : ''} w-full flex justify-center items-center text-sm/6 font-medium rounded border-1 border-[var(--chip-border)] bg-[var(--chip-bg)] py-1 px-3
                            ${
                              disabled
                                ? value?.id === option.id
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-gray-200 text-gray-400'
                                : value?.id === option.id
                                  ? 'bg-[var(--chip-selected-bg)]! text-white cursor-pointer'
                                  : `bg-[var(--chip-bg)] cursor-pointer hover:bg-[var(--chip-selected-bg)] hover:text-white hover:border-[var(--chip-selected-bg)]`
                            }`}
                              >
                                <span className={'text-[10px] leading-[140%]'}>
                                  {option.label}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                  </div>
                  {/*endregion*/}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    );
  };
  const renderCalendar = (
    <>
      <div className={'flex flex-col gap-3'}>
        <Disclosure defaultOpen>
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
                  <span className="text-base font-bold pt-1">
                    {currentMonth} {activeStartDate.getFullYear()}
                  </span>
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
                  <div
                    className={
                      'p-6 pb-12 [@media(max-width:500px)]:p-0! bg-white'
                    }
                  >
                    {
                      <Calendar
                        tileDisabled={() => !localOptions || has_booked}
                        value={localValue}
                        minDate={minDate}
                        maxDate={maxDate}
                        onChange={(current) => handleCalendarChange(current)}
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
                    }
                  </div>
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
  const renderBranchDetails = (branch) => (
    <>
      <section className={'flex flex-col gap-6 min-w-[180px]'}>
        {homeService ? null : (
          <h1 className={'text-xl font-bold flex gap-2'}>
            <span>{branch.name}</span>
          </h1>
        )}
        <div
          className={
            'flex flex-col gap-6 justify-between [@media(max-width:500px)]:flex-row'
          }
        >
          <span className={'text-sm [@media(max-width:500px)]:basis-[70%]'}>
            {homeService ? (
              <p>
                You pick the place — home or office — and we’ll be there. Book
                your time window, and our expert technicians will do the job
                while you get on with your day.
              </p>
            ) : (
              branch.google_address
            )}
          </span>

          {homeService ? null : (
            <h1 className={'text-xl font-bold flex gap-2'}>
              <div className={'flex gap-2'}>
                <MapPinIcon aria-hidden="true" className="size-5 black" />
                <span className={'text-sm text-nowrap'}>
                  {branch.distance_text}
                </span>
              </div>
            </h1>
          )}
        </div>
      </section>
    </>
  );
  const renderAppointmentSelection = (
    <>
      <div
        className={`transition-all  duration-500 ease-in-out ${appointment_overlay ? 'bg-white/0 absolute z-[999999] bottom-12 left-1/2 transform -translate-x-1/2' : 'bg-white'}`}
      >
        {(isLoading || optionsLoading) && (
          <div className={'flex justify-center items-center p-6 py-12'}>
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 64, color: 'var(--brand-primary)' }}
                  spin
                />
              }
            />
          </div>
        )}
        {!isLoading && !optionsLoading && options && (
          <div
            className={`flex flex-col justify-center items-center ${appointment_overlay ? '' : 'p-6'} `}
          >
            {localValue && (
              <div
                className={`
                transition-all duration-300 ease-in-out
                ${appointment_overlay ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}
              `}
              >
                <h1>
                  <b>{availableSlots}</b> available{' '}
                  {`slot${availableSlots === 1 ? '' : 's'}`} on{' '}
                  <b>{formatDateLong(localValue)}</b>
                </h1>
              </div>
            )}

            {localOptions?.length > 0 &&
              localOptions.map((branch, branchIndex) => (
                <div key={branchIndex} className={'w-full'}>
                  {!branch.operating_hours_unavailable && (
                    <div
                      className={`relative ${appointment_overlay ? '' : 'mt-6'}`}
                    >
                      <div
                        className={`bg-white flex flex-row [@media(max-width:670px)]:flex-col gap-4 p-6 border-2 ${branch.repairer_id === value?.repairer_id ? 'border-[var(--chip-container-border-selected)]' : 'border-[var(--chip-container-border)]'} rounded-sm`}
                      >
                        {renderBranchDetails(branch)}

                        <div className={'flex flex-col items-center gap-3'}>
                          <fieldset className="flex flex-row gap-3 ">
                            <div
                              className={
                                'max-w-[380px] [@media(max-width:500px)]:max-w-[240px] [@media(max-width:375px)]:max-w-[205px]!'
                              }
                            >
                              {renderCarousel(
                                branch,
                                branch[repairer_displayed_data_key],
                                branchIndex,
                                expanded,
                                value,
                                handleChange,
                              )}
                            </div>
                          </fieldset>
                          {service_location !== 'at_home' && (
                            <div className={'text-center'}>
                              <a
                                className={
                                  'flex gap-1 items-center justify-center underline text-base leading-[140%] cursor-pointer'
                                }
                                onClick={() => toggleExpand(branchIndex)}
                              >
                                <span>
                                  {expanded[branchIndex] ? 'Less' : 'More'}{' '}
                                  Schedules
                                </span>
                                <span>
                                  <ChevronDownIcon
                                    className={`w-5 transition-transform duration-300 ease-in-out ${
                                      expanded[branchIndex] ? 'rotate-180' : ''
                                    }`}
                                  />
                                </span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
  // endregion
  return (
    <>
      <div className={'flex flex-col gap-3'}>
        {renderCalendar}
        <div className="relative transition-all duration-300 ease-in-out">
          {/* Keep normal flow to avoid flickering */}
          <div className="">{renderAppointmentSelection}</div>

          <a
            onClick={toggleOverlay}
            className={`absolute z-[999999] top-3 right-3 ${appointment_overlay ? 'block bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hovered)]' : 'hidden bg-white hover:bg-[#e0e0e0]'} w-12 h-12 flex justify-center items-center rounded cursor-pointer`}
          >
            <img
              src={appointment_overlay ? map_white : map}
              alt="map"
              className={'size-6 text-gray-400 cursor-pointer'}
            />
          </a>

          {/* MapWidget toggles normally */}
          <MapErrorBoundary>
            <MapWidget
              hidden={!appointment_overlay}
              isMobile={true}
              isExpanded={delayedExpanded}
              topOffset={-0.15}
            />
          </MapErrorBoundary>
        </div>
      </div>
    </>
  );
}
