import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FieldLayout } from '../../_common/layout/index.js';
import {
  ButtonField,
  CustomCalendarField,
  CustomRadioField,
  LocationField,
} from '../../_common/ui/index.js';
import { useFormValidation } from '../../_hooks/form-validation.hook.js';
import { useGetServiceOptionsQuery } from '../../_services/booking.api.js';
import {
  incrementFormCurrentStep,
  setFormCurrentStep,
} from '../../_slices/form.slice.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { handleProgressStateChanges } from '../../_utils/progress-utils.js';
import { handleEnquirySubmission } from '../../_utils/enquiry-util.js';
import { useSubmitFormMutation } from '../../_services/enquiry.api.js';
import { useQueryParams } from '../../_hooks/query-params.hook.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

dayjs.extend(customParseFormat);

export default function BookingForm() {
  //Hooks
  const dispatch = useDispatch();
  const { handleEventV2 } = useFormValidation();

  // Redux States
  const data = useSelector((state) => state.booking);

  const {
    user_details,
    user_booking,
    location_results,
    repairers_results: options,
    booking_form,
    progress_uuid,
  } = data;
  const { errors, is_valid: valid } = booking_form;
  const { service_appointment } = user_details;
  const {
    service_location: serviceLocationField,
    service_appointment: serviceAppointmentDateTimeField,
    location: locationField,
  } = booking_form.fields;
  const { service_location } = user_booking;

  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);

  // API Queries
  const { data: serviceLocationOptions } = useGetServiceOptionsQuery();
  const [submitForm, { isLoading }] = useSubmitFormMutation();
  const { brandSearchParam } = useQueryParams();

  // region Event handlers
  const handleEventWrapper = (event, field) => {
    handleEventV2({ event, field, form: 'booking_form' });
  };
  const handleChange = async (e) => {
    e.preventDefault();
    await dispatch(setFormCurrentStep(4));
    void handleProgressStateChanges(dispatch, progress_uuid, true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleEnquirySubmission(dispatch, data, submitForm, brandSearchParam);
    await dispatch(incrementFormCurrentStep());
    void handleProgressStateChanges(dispatch, progress_uuid, true);
  };
  // endregion

  const areAllTravelDistancesAboveLimit = () => {
    if (!options.branches) {
      return false;
    }

    return options.branches.every((option) => {
      return option.travel_distance > 50000;
    });
  };

  const { has_booked } = data.user_booking;

  // region Hooks - Use effect hooks
  useEffect(() => {
    if (options) {
      if (service_location === 'at_home') {
        const aboveLimit = areAllTravelDistancesAboveLimit();
        if (aboveLimit) {
          handleEventWrapper('service_centre', serviceLocationField);
        }
      }

      const minDate = dayjs(options.min_date, 'DD/MM/YYYY')
        .hour(8)
        .minute(0)
        .second(0)
        .toDate();
      const maxDate = dayjs(options.max_date, 'DD/MM/YYYY').toDate();

      setMinDate(minDate);
      setMaxDate(maxDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, service_appointment]);
  useEffect(() => {
    if (data) {
      setIsDataReady(true);
    }
  }, [data]);
  useEffect(() => {
    let currentOption = [];
    // Only show 1 listing as per
    // https://ideascience.atlassian.net/browse/NW458-328
    if (service_location === 'at_home' && options.branches) {
      currentOption = options.branches.slice(0, 1);
      setLocalOptions(currentOption);
    } else {
      currentOption = options.branches;
      setLocalOptions(currentOption);
    }
  }, [service_location, options]);
  //   endregion

  const renderAddressAutocomplete = (
    <>
      <FieldLayout
        id={locationField.id}
        error={errors[locationField.id]}
        showErrorIcon={false}
      >
        <LocationField
          id={locationField.id}
          type={'address'}
          value={data[locationField.object_name][locationField.id]}
          disabled={has_booked}
          placeholder={'Enter postcode or suburb'}
          className={errors[locationField.id] ? 'field--error' : ''}
          options={location_results}
          hasSearchIcon={true}
          hasLocationIcon={!has_booked}
          hasToggleMap={!has_booked}
          allowBackgroundRepairerSearch={!has_booked}
          allowSpecialChars={true}
          allowAutomaticGeocoding={true}
          onBlur={(e) => handleEventWrapper(e, locationField)}
          onChange={(e) => handleEventWrapper(e, locationField)}
        />
      </FieldLayout>
      {service_location === 'at_home' && (
        <section className={'bg-[#05d6f5] p-6 mt-6 rounded '}>
          <p className={'text-base  text-white font-bold'}>
            We’ll ask for the address you&#39;d like us to come to in the next
            step — whether it&#39;s your home, office, or somewhere else that
            suits you best.
          </p>
        </section>
      )}
    </>
  );

  return (
    <>
      {isDataReady && (
        <>
          <section className={'w-full'}>
            <FieldLayout
              id={serviceLocationField.id}
              error={errors[serviceLocationField.id]}
              showErrorIcon={false}
            >
              <CustomRadioField
                id={serviceLocationField.id}
                value={
                  data[serviceLocationField.object_name][
                    serviceLocationField.id
                  ]
                }
                options={serviceLocationOptions}
                disableOptionKey={
                  areAllTravelDistancesAboveLimit() ? 'at_home' : ''
                }
                onChange={(e) => handleEventWrapper(e, serviceLocationField)}
                layout="grid-sm"
                disabled={has_booked}
                optionClassName={'bg-white py-6'}
                showSelectionIndicator={true}
              ></CustomRadioField>
            </FieldLayout>
          </section>
          <section className={`w-full`}>{renderAddressAutocomplete}</section>

          <section className={'w-full'}>
            <FieldLayout
              id={serviceAppointmentDateTimeField.id}
              error={errors[serviceAppointmentDateTimeField.id]}
              showErrorIcon={false}
            >
              <CustomCalendarField
                value={
                  data[serviceAppointmentDateTimeField.object_name][
                    serviceAppointmentDateTimeField.id
                  ]
                }
                minDate={minDate ?? new Date()}
                maxDate={maxDate}
                onChange={(e) =>
                  handleEventWrapper(e, serviceAppointmentDateTimeField)
                }
                options={localOptions}
              ></CustomCalendarField>
            </FieldLayout>
          </section>
          <div className={'w-full flex items-center justify-center'}>
            <div
              className={'flex flex-col gap-3 basis-full w-auto max-w-[280px]'}
            >
              <ButtonField
                className="w-full"
                variant="confirm"
                disabled={!valid || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <Spin
                      indicator={
                        <LoadingOutlined
                          style={{ fontSize: 24, color: 'white' }}
                          spin
                        />
                      }
                    />
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </ButtonField>
              <ButtonField
                className="w-full"
                variant="change"
                onClick={handleChange}
              >
                Go Back
              </ButtonField>
            </div>
          </div>
          {/*endregion*/}
        </>
      )}
    </>
  );
}
