import React, { useEffect, useRef, useState } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import {
  ArrowPathIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import { useDebounce } from '@uidotdev/usehooks';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearLocationResults,
  setDisableGeolocation,
  toggleAppointmentOverlay,
} from '../../_slices/booking.slice.js';
import { mapAPI } from '../../_services/map.api.js';
import locate from '../../assets/locate.svg';
import map from '../../assets/map.svg';
import map_white from '../../assets/map_white.svg';
import { handleLocationChange } from '../../_utils/location-util.js';

// Being used to validate Postcode or Suburb field
const POSTCODE_REGEX = /^[0-9]{4}$/;

export default function LocationField({
  id,
  placeholder,
  className,
  required = false,
  disabled = false,
  value = '',
  onChange,
  options = [],
  hasSearchIcon = false,
  hasLocationIcon = false,
  hasToggleMap = false,
  allowBackgroundRepairerSearch = false,
  allowSpecialChars = false,
  allowAutomaticGeocoding = false,
  allowAutocomplete = false,
}) {
  // region Local/Redux States
  const dispatch = useDispatch();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const debouncedSearchQuery = useDebounce(query, 1000);
  const isPostcode = POSTCODE_REGEX.test(debouncedSearchQuery);

  const [selected, setSelected] = useState(false);
  const [hasAutoGeolocationTriggered, setHasAutoGeolocationTriggered] =
    useState(false);

  const {
    from_saved_state,
    repairers_results,
    appointment_overlay,
    location_loading,
    repairers_loading,
    address_loading,
    user_details,
  } = useSelector((state) => state.booking);

  const { location, location_latitude, location_longitude } = user_details;
  // endregion
  // region Event handlers
  const handleChange = async (current) => {
    if (!current) return;

    const selectedValue = current.value;

    // Set current value to state
    onChange(selectedValue);
    // Update local query with the current value from state
    setQuery(selectedValue);
    // Set flag to ensure the debounced query  will not trigger
    setSelected(true);
    // Clear location results upon selection of value
    dispatch(clearLocationResults());

    const payload = current.place_id
      ? { place_id: current.place_id }
      : { suburb: current.value };

    void handleLocationChange(
      dispatch,
      payload,
      allowBackgroundRepairerSearch,
      allowBackgroundRepairerSearch ? 'repairer' : 'customer',
    );
  };
  const handleQueryChange = (e) => {
    let selectedValue = e.target.value;

    if (!allowSpecialChars) {
      selectedValue = selectedValue.replace(/[^a-zA-Z0-9 ]/g, '');
    }

    // Set current text search value to trigger debounced query
    setQuery(selectedValue);
    onChange(selectedValue);
    // Change selected flag to false to trigger debounce query
    setSelected(false);

    // Clear current postcode
    // dispatch(clearLocationGeocode());
  };
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: long } = position.coords;

        const payload = {
          latlng: `${lat},${long}`,
        };

        const location = await handleLocationChange(
          dispatch,
          payload,
          allowBackgroundRepairerSearch,
          allowBackgroundRepairerSearch ? 'repairer' : 'customer',
        );

        inputRef.current?.focus();

        if (debouncedSearchQuery) {
          setQuery(location);
        }
      },
      (error) => {
        const postcode = 3000;

        // Set to Melbourne VIC 3000
        setQuery('Melbourne VIC');
        dispatch(
          setDisableGeolocation({
            disable: true,
          }),
        );

        void handleLocationChange(dispatch, {
          suburb: 'Melbourne',
          state: 'VIC',
          postcode,
        });
        console.error('Error getting geolocation:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };
  const toggle = () => {
    dispatch(toggleAppointmentOverlay(!appointment_overlay));
  };
  // endregion
  // region Hooks - Use Effect
  useEffect(() => {
    if (selected || !debouncedSearchQuery) {
      return;
    }

    if (allowAutocomplete) {
      const result = dispatch(
        mapAPI.endpoints.getAddress.initiate(debouncedSearchQuery, {
          subscribe: false,
          forceRefetch: true,
        }),
      );
      return result.unsubcribe;
    } else {
      if (isPostcode) {
        dispatch(
          mapAPI.endpoints.getSuburbsByPostcode.initiate(debouncedSearchQuery, {
            subscribe: false,
            forceRefetch: true,
          }),
        );
      } else {
        dispatch(
          mapAPI.endpoints.getSuburbs.initiate(debouncedSearchQuery, {
            subscribe: false,
            forceRefetch: true,
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);
  useEffect(() => {
    if (!query && value) {
      setSelected(true);
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, query]);
  useEffect(() => {
    if (!hasAutoGeolocationTriggered && allowAutomaticGeocoding && !location) {
      setHasAutoGeolocationTriggered(true);
      handleGetCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowAutomaticGeocoding]);
  useEffect(() => {
    if (
      id === 'location' &&
      from_saved_state &&
      location_latitude &&
      location_longitude &&
      repairers_results.length === 0
    ) {
      const payload = {
        latlng: `${location_latitude},${location_longitude}`,
      };

      void handleLocationChange(
        dispatch,
        payload,
        allowBackgroundRepairerSearch,
        allowBackgroundRepairerSearch ? 'repairer' : 'customer',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, from_saved_state]);
  // endregion

  const baseClass = `
  h-12 w-full px-3 py-1.5 appearance-none rounded-sm bg-white text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1
  outline-gray-300 focus:outline-2 focus:-outline-offset-2 ${location_loading || address_loading || (repairers_loading && allowAutocomplete) ? 'pr-10' : ''}
  ${disabled ? '!bg-gray-100' : ''}`;

  return (
    <div className={'flex gap-3'}>
      <Combobox
        immediate
        id={id}
        className={'w-full'}
        as="div"
        value={value}
        onChange={(current) => {
          handleChange(current);
        }}
        required={required}
      >
        <div className="relative">
          {hasSearchIcon && (
            <div className="absolute inset-y-0 left-1 flex items-center rounded-r-md px-2 focus:outline-none">
              <MagnifyingGlassIcon
                className="size-5 text-black"
                aria-hidden="true"
              />
            </div>
          )}
          <ComboboxInput
            ref={inputRef}
            disabled={
              disabled ||
              location_loading ||
              address_loading ||
              (repairers_loading && allowAutocomplete)
            }
            data-lpignore="true"
            className={`${baseClass} ${className} ${hasSearchIcon ? 'pl-10' : ''}`}
            onChange={handleQueryChange}
            placeholder={placeholder}
            value={query}
            /**
             * value={query} sets the text input to query indefinite
             * unless forced to change to selected option
             */
          />
          <div className="absolute inset-y-0 right-1 flex items-center rounded-r-md px-2 focus:outline-none">
            {(location_loading || address_loading) && (
              <ArrowPathIcon
                className="size-5 text-gray-400 animate-spin"
                aria-hidden="true"
              />
            )}
            {!location_loading && !address_loading && hasLocationIcon && (
              <a onClick={handleGetCurrentLocation}>
                <img
                  src={locate}
                  alt="Locate"
                  className={'size-6 text-gray-400 cursor-pointer'}
                />
              </a>
            )}
          </div>

          {options.length > 0 && (
            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {options.map((opt) => (
                <ComboboxOption
                  key={opt.id}
                  value={opt}
                  className={
                    'group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-[var(--dropdown-selected-bg)] data-[focus]:text-white data-[focus]:outline-none'
                  }
                >
                  <span className="block truncate group-data-[selected]:font-semibold">
                    {opt.value}
                  </span>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-[var(--dropdown-text-selected-bg)] group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon className="size-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>

      {hasToggleMap && repairers_results?.branches?.length > 0 && (
        <a
          onClick={toggle}
          className={`${appointment_overlay ? 'bg-[#00db8c] hover:bg-[#01a469] hidden' : 'block bg-white hover:bg-[#e0e0e0]'} lg:hidden w-12 h-12 flex justify-center items-center rounded cursor-pointer`}
        >
          <img
            src={appointment_overlay ? map_white : map}
            alt="map"
            className={'size-6 text-gray-400 cursor-pointer'}
          />
        </a>
      )}
    </div>
  );
}
