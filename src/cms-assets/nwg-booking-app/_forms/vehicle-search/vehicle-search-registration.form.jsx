import React, { useEffect, useState } from 'react';
import { FieldLayout } from '../../_common/layout';
import {
  ButtonField,
  CustomDropdownField,
  TextField,
  LocationField,
} from '../../_common/ui';
import { useDispatch, useSelector } from 'react-redux';
import { useFormValidation } from '../../_hooks/form-validation.hook.js';
import { useFindVehicleV3Mutation } from '../../_services/vehicle.api.js';
import { useGetStatesOptionsQuery } from '../../_services/map.api.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { handleVehicleLookup } from '../../_utils/vehicle-util.js';
import { v4 as uuidv4 } from 'uuid';
import { setProgressIdentifier } from '../../_slices/booking.slice.js';
import { PhoneIcon } from '@heroicons/react/24/solid';
import { useQueryParams } from '../../_hooks/query-params.hook.js';
import { BRANDS } from '../../_common/constants/index.js';

/**
 * VehicleSearchRegistrationForm Component
 *
 * A form that allows users to search for vehicle details using registration number and state.
 * Handles form validation, API calls, and Redux state updates.
 */
export default function VehicleSearchRegistrationForm() {
  // region Hooks
  const dispatch = useDispatch();
  const { handleEventV2 } = useFormValidation();
  const [isMobile, setIsMobile] = useState(false);
  const { trackingPhone, trackingPhoneFormatted, brandSearchParam } =
    useQueryParams();
  const isAAGBrand = brandSearchParam === BRANDS.AAG;
  const hideContact = false;

  // endregion

  // region Redux States
  const data = useSelector((state) => state.booking);
  const {
    registration_search_form,
    location_results,
    enquiry_progress_loading,
    overlay,
  } = data;

  const { fields, is_valid, errors } = registration_search_form;
  const { registration_number, state, location } = fields;
  // endregion

  // region Redux Query/Mutations
  const [getVehicleDetail, { isLoading }] = useFindVehicleV3Mutation();
  const { data: states } = useGetStatesOptionsQuery({
    subscribe: false,
    forceRefetch: true,
  });
  // endregion

  // region Event Handlers
  /**
   * Handles form submission
   * - Validates all required fields
   * - Calls API to fetch vehicle details
   * - Dispatches results to Redux store
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isExistingSession = !!localStorage.getItem('nwg_eq_uuid');
    let progressId = localStorage.getItem('nwg_eq_uuid');
    if (!progressId) {
      progressId = uuidv4();
      localStorage.setItem('nwg_eq_uuid', progressId);
    }

    await dispatch(setProgressIdentifier(progressId));
    await handleVehicleLookup(
      data,
      dispatch,
      { registration_number, state },
      getVehicleDetail,
      { progressId, isExistingSession },
    );
  };
  const handleEventWrapper = (event, field) => {
    handleEventV2({ event, field, form: 'registration_search_form' });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize(); // initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const useRegularLayout = isMobile || !overlay;

  // Collect field errors for overlay mode
  const fieldErrors = overlay
    ? [
        errors[registration_number.id],
        errors[state.id],
        errors[location.id],
      ].filter(Boolean)
    : [];

  // Reusable field components
  const registrationNumberField = (
    <FieldLayout
      label={useRegularLayout ? registration_number.label : ''}
      id={registration_number.id}
      error={overlay ? null : errors[registration_number.id]}
    >
      <TextField
        id="registration_number"
        placeholder={useRegularLayout ? '' : registration_number.label}
        value={data[registration_number.object_name][registration_number.id]}
        hasAutoTrim={true}
        uppercase={true}
        onBlur={(e) => handleEventWrapper(e, registration_number)}
        onChange={(e) => handleEventWrapper(e, registration_number)}
        className={`${errors[registration_number.id] ? 'field--error' : ''} ${overlay ? '!rounded-xl' : ''}`}
      />
    </FieldLayout>
  );

  const stateField = (
    <FieldLayout
      id={state.id}
      label={useRegularLayout ? state.label : ''}
      error={overlay ? null : errors[state.id]}
    >
      <CustomDropdownField
        id={state.id}
        placeholder={useRegularLayout ? '' : state.label}
        value={data[state.object_name][state.id]}
        options={states}
        onBlur={(e) => handleEventWrapper(e, state)}
        onChange={(e) => handleEventWrapper(e, state)}
        className={`${errors[state.id] ? 'field--error' : ''} ${overlay ? '!rounded-xl' : ''}`}
      />
    </FieldLayout>
  );

  const locationField = (
    <FieldLayout
      id={location.id}
      label={useRegularLayout ? location.label : ''}
      error={overlay ? null : errors[location.id]}
    >
      <LocationField
        id={location.id}
        options={location_results}
        placeholder={useRegularLayout ? '' : location.label}
        value={data[location.object_name][location.id]}
        onBlur={(e) => handleEventWrapper(e, location)}
        onChange={(e) => handleEventWrapper(e, location)}
        className={`${errors[location.id] ? 'field--error' : ''} ${overlay ? '!rounded-xl' : ''}`}
        allowBackgroundRepairerSearch={true}
      />
    </FieldLayout>
  );

  const buttonContent =
    isLoading || enquiry_progress_loading ? (
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />
        }
      />
    ) : (
      <span>Get Quote</span>
    );

  const phoneNumber =
    trackingPhone || (!isAAGBrand ? '1300363632' : '1300291103');
  const phoneDisplay =
    trackingPhoneFormatted || (!isAAGBrand ? '1300 363 632' : '1300 291 103');

  const contactContent = (
    <div
      className={`flex flex-wrap items-center gap-2 text-sm text-[#a7a7a7] font-semibold mt-3
      ${isMobile ? 'justify-between text-xs gap-1' : 'justify-center'}`}
    >
      <span>24/7 Phone Support {!isMobile ? '- Call Us Today' : ''}</span>
      <div className="flex items-center gap-2">
        <a
          href={`tel:${phoneNumber}`}
          className="flex gap-2 font-bold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hovered)]"
        >
          <PhoneIcon className="size-4 " />
          {phoneDisplay}
        </a>
      </div>
    </div>
  );

  // endregion
  return (
    <>
      {data && (
        <form
          className={`flex flex-col gap-[8px] w-full justify-center ${overlay ? `rounded-xl shadow-lg p-4 ${useRegularLayout ? 'mb-[50px]' : 'mb-[200px]'} bg-white` : 'bg-white'}`}
        >
          {useRegularLayout ? (
            // Regular layout: stacked fields
            <>
              <div className="flex gap-3 [@media(max-width:420px)]:flex-col">
                {registrationNumberField}
                {stateField}
              </div>
              <div>{locationField}</div>
              {errors && <div className="error-message">{errors.form}</div>}
              <ButtonField
                className="w-full !rounded-xl"
                variant="quote"
                onClick={handleSubmit}
                disabled={!is_valid || isLoading || enquiry_progress_loading}
              >
                {buttonContent}
              </ButtonField>
              {hideContact ? (
                <div aria-hidden="true" className="h-3" />
              ) : (
                contactContent
              )}
            </>
          ) : (
            // Overlay layout: all fields in one row
            <>
              <div className="flex gap-3 max-w-full">
                {registrationNumberField}
                {stateField}
                {locationField}
                <ButtonField
                  className={`[@media(min-width:601px)]:flex-1 [@media(min-width:601px)]:self-end !rounded-xl [@media(max-width:600px)]:w-full [@media(max-width:600px)]:!h-[48px`}
                  variant="quote"
                  onClick={handleSubmit}
                  overlay={overlay}
                  disabled={!is_valid || isLoading || enquiry_progress_loading}
                >
                  {buttonContent}
                </ButtonField>
              </div>
              <div>
                {(fieldErrors.length > 0 || errors.form) && (
                  <div className="absolute error-message">
                    {fieldErrors.length > 0 ? fieldErrors[0] : errors.form}
                  </div>
                )}
              </div>
              {hideContact ? (
                <div aria-hidden="true" className="h-3" />
              ) : (
                contactContent
              )}
            </>
          )}
        </form>
      )}
    </>
  );
}
