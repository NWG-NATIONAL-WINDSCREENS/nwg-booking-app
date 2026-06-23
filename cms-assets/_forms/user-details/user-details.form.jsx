import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ButtonField,
  CheckboxField,
  CustomDropdownField,
  CustomRadioField,
  TextField,
  Loader,
  LocationField,
} from '../../_common/ui/index.js';
import { setFormCurrentStep } from '../../_slices/form.slice.js';
import { FieldLayout } from '../../_common/layout/index.js';
import {
  useGetInsurerOptionsQuery,
  useGetPaymentTypeOptionsQuery,
} from '../../_services/vehicle.api.js';
import { useActivePricingOptions } from '../../_hooks/active-options.hook.js';
import { useFormValidation } from '../../_hooks/form-validation.hook.js';
import {
  useCreateAppointmentMutation,
  useSubmitFormMutation,
} from '../../_services/enquiry.api.js';
import {
  setBookingCreated,
  setPaymentReceived,
  toggleAddressAutocomplete,
  validatePropValue,
} from '../../_slices/booking.slice.js';
import { BRANDS, TEST_PAYMENT_LINK } from '../../_common/constants/index.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ChevronRightIcon } from '@heroicons/react/20/solid/index.js';
import { useGetStatesOptionsQuery } from '../../_services/map.api.js';
import { handleLocationChange } from '../../_utils/location-util.js';
import ph_smiley from '../../assets/ph_smiley.png';
import { handleProgressStateChanges } from '../../_utils/progress-utils.js';
import { handleEnquirySubmission } from '../../_utils/enquiry-util.js';
import { useQueryParams } from '../../_hooks/query-params.hook.js';

export default function UserDetailsForm() {
  const dispatch = useDispatch();
  const { brandSearchParam, devSearchParam } = useQueryParams();
  // Live brand pricing options — used to resolve the selected option's payment
  // link (RTK Query caches this; damage-selection already fetched the same key).
  const { data: activeOptions } = useActivePricingOptions();
  const [insurerOptions, setInsurerOptions] = useState([]);
  // Custom hook for handling form validation
  const { handleEventV2 } = useFormValidation();

  // Retrieve data from Redux store
  const data = useSelector((state) => state.booking);
  const {
    address_results,
    address_loading,
    address_autocomplete,
    location_loading,
    progress_uuid,
  } = data;
  const {
    fields,
    errors,
    warnings,
    is_valid: valid,
  } = useSelector((state) => state.booking.user_form);

  const { has_paid, has_booked, service_location } = data.user_booking;
  const {
    payment_type,
    home_suburb,
    home_state,
    home_postcode,
    home_address_valid,
    home_location,
  } = data.user_details;

  const popupRef = useRef(null);
  const [options, setOptions] = useState([]);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [localToggleAddressAutocomplete, setLocalToggleAddressAutocomplete] =
    useState(address_autocomplete);

  const {
    payment_type: paymentTypeField,
    first_name,
    last_name: lastNameField,
    email: emailField,
    mobile: mobileField,
    insurer: insurerField,
    policy_number: policyNumberField,
    claim_number: claimNumberField,
    terms,
    home_address: homeAddressField,
    home_street_address: homeStreetAddressField,
    home_suburb: homeSuburbField,
    home_state: homeStateField,
    home_postcode: homePostcodeField,
  } = fields;

  const { data: paymentTypeOptions } = useGetPaymentTypeOptionsQuery();
  const { data: insurers } = useGetInsurerOptionsQuery();
  const { data: states } = useGetStatesOptionsQuery();

  const [submitForm, { isLoading: submitLoading }] = useSubmitFormMutation();
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const handleChange = async (e) => {
    e.preventDefault();
    await dispatch(setFormCurrentStep(5));
    void handleProgressStateChanges(dispatch, progress_uuid, true);
  };
  const handleEventWrapper = (event, field) => {
    handleEventV2({ event, field, form: 'user_form' });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fixes bug where customer did not proceed with payment
    void handleProgressStateChanges(dispatch, progress_uuid, true);

    await handleEnquirySubmission(dispatch, data, submitForm, brandSearchParam);

    if (home_address_valid || service_location === 'service_centre') {
      if (payment_type === 'myself' && !has_paid) {
        await handlePayment();
      } else {
        await handleAppointmentCreation();
      }
    } else {
      const payload = {
        suburb: `${home_suburb}`,
        state: `${home_state}`,
        postcode: home_postcode,
        validate_suburb: true,
      };

      await void handleLocationChange(
        dispatch,
        payload,
        false,
        'customer_manual',
      );

      // Trigger a validation so we can set the form disabled if location is >= 50+ KM
      dispatch(
        validatePropValue({
          field: homeSuburbField,
          form: 'registration_search_form',
        }),
      );
    }
  };
  const handlePayment = async () => {
    setPaymentInProgress(true);
    // payment_link_url is the full HubSpot checkout URL for the selected
    // option's active version (live from the pricing API). Append embed-full +
    // the customer's email so checkout opens embedded with the email pre-filled.
    const chipOption = (activeOptions ?? []).find(
      (opt) => opt.option_id === data.user_vehicle_damage.damage_type,
    );
    // `?dev=<DEV_KEY>` swaps in the test payment link so the flow can be run
    // without charging a real card; live runs use the selected option's link.
    const paymentUrl = devSearchParam
      ? TEST_PAYMENT_LINK
      : chipOption?.payment_link_url;
    if (!paymentUrl) {
      console.error(
        'user-details: no payment link for option',
        data.user_vehicle_damage.damage_type,
      );
      setPaymentInProgress(false);
      return;
    }

    // The test link already carries a query string, so append our params with
    // the correct separator rather than a hardcoded `?`.
    const separator = paymentUrl.includes('?') ? '&' : '?';
    const popup = window.open(
      `${paymentUrl}${separator}embed-full&email=${data.user_details.email}`,
      '_blank',
      'width=600,height=700,scrollbars=yes,resizable=yes',
    );

    popupRef.current = popup;

    const popupCheckInterval = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(popupCheckInterval);
        setPaymentInProgress(false);
      }
    }, 1000);
  };
  const handleAppointmentCreation = useCallback(async () => {
    if (has_booked) {
      dispatch(setFormCurrentStep(7));

      // Scroll to the top upon changing the page
      return;
    }
    try {
      const { service_appointment, service_location } = data.user_booking;

      const {
        enquiry_id,
        home_street_address,
        home_suburb,
        home_state,
        home_postcode,
        home_place_id,
        home_longitude,
        home_latitude,
        home_address,
      } = data.user_details;

      const street_address =
        service_location === 'at_home'
          ? home_street_address
          : service_appointment.street_address;
      // No suburb at the Company record level
      const suburb = service_location === 'at_home' ? home_suburb : '';
      const state =
        service_location === 'at_home' ? home_state : service_appointment.state;
      const postcode =
        service_location === 'at_home'
          ? home_postcode
          : service_appointment.postcode;
      const place_id =
        service_location === 'at_home'
          ? home_place_id
          : service_appointment.place_id;
      const longitude =
        service_location === 'at_home'
          ? home_longitude
          : service_appointment.longitude;
      const latitude =
        service_location === 'at_home'
          ? home_latitude
          : service_appointment.latitude;
      const address =
        service_location === 'at_home'
          ? home_address
          : service_appointment.address;

      if (service_appointment) {
        const payload = {
          enquiry_id: enquiry_id,
          company_id: service_appointment.company_id,
          appointment: {
            name: `${enquiry_id} - ${service_appointment.value}`,
            timestamp_start: service_appointment.timestamp_start,
            timestamp_end: service_appointment.timestamp_end,
            street_address,
            suburb,
            state,
            postcode,
            place_id,
            longitude,
            latitude,
            address: address ? address : `${suburb} ${state}, ${postcode}`,
          },
        };

        // Use this someday but not today
        // const payload = prepareAppointmentPayload(payload);

        await createAppointment(payload).unwrap();

        console.log(
          '*************************************************************',
        );
        console.log('Appointment Created');
        console.log(
          '*************************************************************',
        );

        // Wait for state to be updated
        await dispatch(setBookingCreated());
        // Then update the state to HubSpot
        void handleProgressStateChanges(dispatch, progress_uuid, true);
        localStorage.removeItem('nwg_eq_uuid');

        dispatch(setFormCurrentStep(7));
      } else {
        console.error('Missing appointment details');
      }
    } catch (e) {
      console.error('user-details', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createAppointment, data, dispatch, has_booked, submitForm]);
  const handleToggle = (toggle) => {
    setLocalToggleAddressAutocomplete(toggle);
    dispatch(toggleAddressAutocomplete(toggle));
    dispatch(validatePropValue({ field: homeAddressField, form: 'user_form' }));
  };

  const onPaymentSuccess = useCallback(() => {
    setPaymentInProgress(false);
    dispatch(setPaymentReceived());
    void handleAppointmentCreation();
  }, [dispatch, handleAppointmentCreation]);

  // Primary signal: the success popup posts back to its opener (this iframe).
  // postMessage over the opener handle is immune to storage partitioning, which
  // is what silently breaks the BroadcastChannel below — the funnel is a
  // partitioned third-party iframe while the success page is a first-party
  // top-level popup, so they never share a BroadcastChannel partition.
  useEffect(() => {
    const handler = (event) => {
      // Only trust messages from our own origin (the success page is same-host).
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'paymentSuccess') onPaymentSuccess();
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onPaymentSuccess]);

  // Fallback for same-partition contexts (older browsers / non-iframed funnel).
  useEffect(() => {
    const channel = new BroadcastChannel('nwg-payment');

    channel.onmessage = (event) => {
      if (event.data?.type === 'paymentSuccess') onPaymentSuccess();
    };

    return () => {
      channel.close();
    };
  }, [onPaymentSuccess]);
  useEffect(() => {
    if (payment_type) {
      const selectedOption = paymentTypeOptions?.filter(
        (option) => option.id === payment_type,
      );
      setOptions(selectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, paymentTypeOptions]);
  useEffect(() => {
    if (insurers) {
      const sortedInsurers = [...insurers].sort((a, b) =>
        a.value.localeCompare(b.value),
      );

      const tradeSpecificBrokersIndex = sortedInsurers.findIndex(
        (insurer) => insurer.value === 'Trade-specific brokers',
      );
      const tradeSpecificBrokers =
        tradeSpecificBrokersIndex !== -1
          ? sortedInsurers.splice(tradeSpecificBrokersIndex, 1)
          : [];

      const finalInsurers = [...sortedInsurers, ...tradeSpecificBrokers];

      setInsurerOptions(finalInsurers);
    }
  }, [insurers]);

  const renderManualAddressSearch = (
    <>
      <div className="flex flex-col md:flex-row gap-3">
        <FieldLayout
          id={homeStreetAddressField.id}
          label={homeStreetAddressField.label}
          error={errors[homeStreetAddressField.id]}
          showRequiredIdentifier={homeStreetAddressField.required}
        >
          <TextField
            id={homeStreetAddressField}
            value={
              data[homeStreetAddressField.object_name][
                homeStreetAddressField.id
              ]
            }
            onBlur={(e) => handleEventWrapper(e, homeStreetAddressField)}
            disabled={has_booked}
            onChange={(e) => handleEventWrapper(e, homeStreetAddressField)}
            className={errors[homeStreetAddressField.id] ? 'field--error' : ''}
          />
        </FieldLayout>
        <FieldLayout
          id={homeSuburbField.id}
          label={homeSuburbField.label}
          error={errors[homeSuburbField.id]}
          showRequiredIdentifier={homeSuburbField.required}
        >
          <TextField
            id={homeSuburbField}
            value={data[homeSuburbField.object_name][homeSuburbField.id]}
            onBlur={(e) => handleEventWrapper(e, homeSuburbField)}
            disabled={has_booked}
            onChange={(e) => handleEventWrapper(e, homeSuburbField)}
            className={errors[homeSuburbField.id] ? 'field--error' : ''}
          />
        </FieldLayout>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <FieldLayout
          id={homeStateField.id}
          label={homeStateField.label}
          error={errors[homeStateField.id]}
          showRequiredIdentifier={homeStateField.required}
        >
          <CustomDropdownField
            id={homeStateField.id}
            value={data[homeStateField.object_name][homeStateField.id]}
            options={states}
            disabled={has_booked}
            onBlur={(e) => handleEventWrapper(e, homeStateField)}
            onChange={(e) => handleEventWrapper(e, homeStateField)}
            className={errors[homeStateField.id] ? 'field--error' : ''}
          />
        </FieldLayout>
        <FieldLayout
          id={homePostcodeField.id}
          label={homePostcodeField.label}
          error={errors[homePostcodeField.id]}
          showRequiredIdentifier={homePostcodeField.required}
        >
          <TextField
            id={homePostcodeField.id}
            value={data[homePostcodeField.object_name][homePostcodeField.id]}
            onBlur={(e) => handleEventWrapper(e, homePostcodeField)}
            disabled={has_booked}
            onChange={(e) => handleEventWrapper(e, homePostcodeField)}
            className={errors[homePostcodeField.id] ? 'field--error' : ''}
          />
        </FieldLayout>
      </div>
    </>
  );
  const renderAddressAutocomplete = (
    <>
      <div className="flex flex-col md:flex-row gap-3">
        <FieldLayout
          id={homeAddressField.id}
          label={homeAddressField.label}
          error={errors[homeAddressField.id]}
          showRequiredIdentifier={homeAddressField.required}
        >
          <LocationField
            id={homeAddressField.id}
            type={'address'}
            disabled={has_booked}
            value={data[homeAddressField.object_name][homeAddressField.id]}
            className={errors[homeAddressField.id] ? 'field--error' : ''}
            options={address_results}
            isLoading={address_loading}
            allowAutocomplete={true}
            allowSpecialChars={true}
            onBlur={(e) => handleEventWrapper(e, homeAddressField)}
            onChange={(e) => handleEventWrapper(e, homeAddressField)}
          />
        </FieldLayout>
      </div>
    </>
  );

  const renderUserDetailsForm = (
    <section className={'w-full flex flex-col bg-white p-6 gap-6'}>
      <h2 className={'text-xl font-semibold leading-[38px]'}>
        Please provide us your contact details.
      </h2>
      <div className="flex flex-col md:flex-row gap-3">
        <FieldLayout
          id={first_name.id}
          label={first_name.label}
          error={errors[first_name.id]}
          showRequiredIdentifier={first_name.required}
        >
          <TextField
            id="first_name"
            value={data[first_name.object_name][first_name.id]}
            onBlur={(e) => handleEventWrapper(e, first_name)}
            onChange={(e) => handleEventWrapper(e, first_name)}
            disabled={has_booked}
            className={errors[first_name.id] ? 'field--error' : ''}
            allowSpecialChars={false}
          />
        </FieldLayout>
        <FieldLayout
          id={lastNameField.id}
          label={lastNameField.label}
          error={errors[lastNameField.id]}
          showRequiredIdentifier={lastNameField.required}
        >
          <TextField
            id="last_name"
            value={data[lastNameField.object_name][lastNameField.id]}
            onBlur={(e) => handleEventWrapper(e, lastNameField)}
            onChange={(e) => handleEventWrapper(e, lastNameField)}
            disabled={has_booked}
            className={errors[lastNameField.id] ? 'field--error' : ''}
            allowSpecialChars={false}
          />
        </FieldLayout>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <FieldLayout
          id={emailField.id}
          label={emailField.label}
          error={errors[emailField.id]}
          warning={warnings[emailField.id]}
          showRequiredIdentifier={emailField.required}
        >
          <TextField
            id={emailField.id}
            value={data[emailField.object_name][emailField.id]}
            onChange={(e) => handleEventWrapper(e, emailField)}
            disabled={has_booked}
            className={errors[emailField.id] ? 'field--error' : ''}
            validated={emailField.validated}
            hasAutoTrim={true}
          ></TextField>
        </FieldLayout>
        <FieldLayout
          id={mobileField.id}
          label={mobileField.label}
          error={errors[mobileField.id]}
          showRequiredIdentifier={mobileField.required}
        >
          <TextField
            id="other_contact"
            value={data[mobileField.object_name][mobileField.id]}
            onBlur={(e) => handleEventWrapper(e, mobileField)}
            disabled={has_booked}
            onChange={(e) => handleEventWrapper(e, mobileField)}
            className={errors[mobileField.id] ? 'field--error' : ''}
            validated={mobileField.validated}
            hasAutoTrim={true}
          />
        </FieldLayout>
      </div>

      {service_location === 'at_home' && (
        <>
          <hr className={'text-gray-300'} />

          {!has_booked && (
            <div className={'flex flex-col gap-1 justify-start text-sm'}>
              <>
                <p>
                  <button
                    disabled={has_booked}
                    className={'text-[var(--brand-primary)] cursor-pointer hover:underline'}
                    onClick={() =>
                      handleToggle(!localToggleAddressAutocomplete)
                    }
                  >
                    {!localToggleAddressAutocomplete
                      ? 'Turn on auto-complete'
                      : 'Turn off auto-complete'}
                  </button>
                </p>
              </>
            </div>
          )}

          {localToggleAddressAutocomplete
            ? renderAddressAutocomplete
            : renderManualAddressSearch}
          {errors.form && <div className="error-message">{errors.form}</div>}
        </>
      )}

      {/*endregion*/}
      {data[paymentTypeField.object_name][paymentTypeField.id] ===
        'insurance' && (
        <>
          <div className="flex gap-3">
            <FieldLayout
              id={insurerField.id}
              label={insurerField.label}
              error={errors[insurerField.id]}
              showRequiredIdentifier={insurerField.required}
            >
              <CustomDropdownField
                id={insurerField.id}
                value={data[insurerField.object_name][insurerField.id]}
                options={insurerOptions}
                disabled={has_booked}
                onBlur={(e) => handleEventWrapper(e, insurerField)}
                onChange={(e) => handleEventWrapper(e, insurerField)}
                className={errors[insurerField.id] ? 'field--error' : ''}
              />
            </FieldLayout>
          </div>
          <div className="flex flex-col gap-3 text-sm/6">
            <p>
              Providing your policy number is not required at this stage but
              will help process your request more quickly.
            </p>

            <FieldLayout
              id={policyNumberField.id}
              label={policyNumberField.label}
              error={errors[policyNumberField.id]}
            >
              <TextField
                id={policyNumberField.id}
                value={
                  data[policyNumberField.object_name][policyNumberField.id]
                }
                uppercase={true}
                disabled={has_booked}
                onBlur={(e) => handleEventWrapper(e, policyNumberField)}
                onChange={(e) => handleEventWrapper(e, policyNumberField)}
                className={errors[policyNumberField.id] ? 'field--error' : ''}
                allowSpecialChars={false}
              />
            </FieldLayout>
          </div>
          <div className="flex gap-3">
            <FieldLayout
              id={claimNumberField.id}
              label={claimNumberField.label}
              error={errors[claimNumberField.id]}
            >
              <TextField
                id={claimNumberField.id}
                value={data[claimNumberField.object_name][claimNumberField.id]}
                uppercase={true}
                disabled={has_booked}
                onBlur={(e) => handleEventWrapper(e, claimNumberField)}
                onChange={(e) => handleEventWrapper(e, claimNumberField)}
                className={errors[claimNumberField.id] ? 'field--error' : ''}
                allowSpecialChars={false}
              />
            </FieldLayout>
          </div>
        </>
      )}

      <div className="flex gap-3">
        <FieldLayout id={terms.id} error={errors[terms.id]}>
          <CheckboxField
            id={terms.id}
            disabled={has_booked}
            value={data[terms.object_name][terms.id]}
            label={
              'By proceeding, you confirm you have accepted our Terms and Conditions and Privacy Policy.'
            }
            onChange={(e) => handleEventWrapper(e, terms)}
            className={errors[terms.id] ? 'field--error' : ''}
          />
        </FieldLayout>
      </div>
    </section>
  );

  return (
    <>
      {data && (
        <>
          {paymentInProgress && (
            <Loader
              label={'Processing your payment...'}
              onClose={() => {
                setPaymentInProgress(false);
              }}
            ></Loader>
          )}

          <section className={'w-full'}>
            <FieldLayout
              id={paymentTypeField.id}
              error={errors[paymentTypeField.id]}
              showErrorIcon={false}
            >
              <CustomRadioField
                id={paymentTypeField.id}
                value={data[paymentTypeField.object_name][paymentTypeField.id]}
                disabled={has_booked}
                options={options}
                onChange={(e) => handleEventWrapper(e, paymentTypeField)}
              ></CustomRadioField>
            </FieldLayout>
          </section>

          {renderUserDetailsForm}

          {!errors.form &&
            home_address_valid &&
            service_location === 'at_home' && (
              <div
                className={`p-3 rounded-sm bg-[var(--issue-contact-bg)] flex flex-row gap-2 justify-center items-start`}
              >
                <img src={ph_smiley} width={48} height={48} alt="Smiley" />
                <h1 className={`text-3xl text-white`}>
                  You&#39;re in luck — we can provide service at{' '}
                  <b>{home_location}</b>
                </h1>
              </div>
            )}

          {brandSearchParam === BRANDS.AAG && payment_type === 'myself' && (
            <div className={`p-3 rounded-sm bg-[var(--issue-contact-bg)]`}>
              <ul className={`text-base text-white text-center`}>
                <li>
                  Action Auto Glass is a member of the National Windscreens
                  Group.
                </li>
                <li>
                  All invoices will be issued by National
                  Windscreens.
                </li>
              </ul>
            </div>
          )}
          {/*region Submit Button */}
          <div className={'w-full flex items-center justify-center'}>
            <div
              className={'flex flex-col gap-3 basis-full w-auto max-w-[280px]'}
            >
              <ButtonField
                className="w-full group"
                variant={
                  home_address_valid || service_location === 'service_centre'
                    ? 'confirm'
                    : 'quote'
                }
                disabled={!valid || isLoading || submitLoading}
                onClick={handleSubmit}
              >
                {isLoading || submitLoading || location_loading ? (
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
                  <>
                    {payment_type === 'myself' && !has_paid ? (
                      <div className={'flex gap-1 items-center justify-center'}>
                        {home_address_valid ||
                        service_location === 'service_centre' ? (
                          <>
                            <span>Pay by Credit/Debit Card</span>
                            <ChevronRightIcon
                              className={`w-6 text-black  ${!valid || isLoading || submitLoading ? 'text-white' : 'text-black group-hover:text-white'}`}
                            />
                          </>
                        ) : (
                          <span>Submit</span>
                        )}
                      </div>
                    ) : (
                      <>
                        {has_booked || has_paid ? (
                          <span>Continue</span>
                        ) : (
                          <span>Submit</span>
                        )}
                      </>
                    )}
                  </>
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
