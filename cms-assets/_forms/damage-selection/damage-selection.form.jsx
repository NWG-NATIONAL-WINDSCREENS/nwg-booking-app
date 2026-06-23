import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ButtonField,
  CustomDropdownField,
  CustomRadioField,
  DatePickerField,
  TextField,
} from '../../_common/ui/index.js';
import {
  incrementFormCurrentStep,
  setFormCurrentStep,
} from '../../_slices/form.slice.js';
import { FieldLayout } from '../../_common/layout/index.js';
import { useFormValidation } from '../../_hooks/form-validation.hook.js';
import windshield_impact from '../../assets/damage_assessment.png';
import round_phone from '../../assets/round_phone.png';
import ph_smiley from '../../assets/ph_smiley.png';
import {
  useGetCauseOfDamageOptionsQuery,
  useGetDamageOptionsQuery,
  useGetImpactLocationOptionsQuery,
  useGetImpactOptionsQuery,
  useGetIssueContactOptionsQuery,
  useGetPreferredCallTimeOptionsQuery,
} from '../../_services/vehicle.api.js';
import { useActivePricingOptions } from '../../_hooks/active-options.hook.js';
import { setOptionPrices } from '../../_slices/booking.slice.js';
import { svgMap } from '../../_common/constants/booking-options.js';
import { handleEnquirySubmission } from '../../_utils/enquiry-util.js';
import { useSubmitFormMutation } from '../../_services/enquiry.api.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { handleProgressStateChanges } from '../../_utils/progress-utils.js';
import { useQueryParams } from '../../_hooks/query-params.hook.js';
import { BRANDS } from '../../_common/constants/index.js';

export default function DamageSelectionForm() {
  // region Hooks
  const dispatch = useDispatch();
  const { handleEventV2 } = useFormValidation();
  const { trackingPhone2, trackingPhoneFormatted2, brandSearchParam } =
    useQueryParams();
  const isAag = brandSearchParam === BRANDS.AAG;
  const fallbackPhone = isAag ? '1300291103' : '1300011584';
  const fallbackPhoneFormatted = isAag ? '1300 291 103' : '1300 011 584';
  // endregion
  // region Local States
  // eslint-disable-next-line no-unused-vars
  const [selectedWindow, setSelectedWindow] = useState('');
  // endregion
  // region Redux States
  const data = useSelector((state) => state.booking);
  const {
    damage_assessments_form,
    user_vehicle_damage,
    user_booking,
    user_details,
    progress_uuid,
  } = data;
  const { fields, is_valid: valid, errors, warnings } = damage_assessments_form;
  const { has_paid, has_booked } = user_booking;
  const { damage: damageValue } = user_vehicle_damage;
  const { enquiry_id } = user_details;
  const {
    damage,
    damage_type,
    impact,
    impact_location,
    issue_contact,
    contact,
    first_name,
    last_name,
    other_contact,
    preferred_time,
    cause_of_damage,
    date_of_damage,
  } = fields;
  //endregion

  // region Redux Queries/Mutations
  const { data: damageOptions } = useGetDamageOptionsQuery();
  const { data: causeOfDamageOptions } = useGetCauseOfDamageOptionsQuery();
  // Brand-specific pricing options from HubDB (active only, sorted by sequence).
  // Maps the API's option_id/option_label/svg into the {id, value, image, price,
  // payment_link_url} shape CustomRadioField expects. payment_link_url is the
  // full HubSpot checkout URL for the option's active version (null for
  // callback-only options).
  const { data: rawChipOptions } = useActivePricingOptions();
  const chipOptions = (rawChipOptions ?? []).map((opt) => ({
    id: opt.option_id,
    value: opt.option_label,
    price: opt.price,
    payment_link_url: opt.payment_link_url,
    image: svgMap[opt.svg],
  }));
  const { data: impactOptions } = useGetImpactOptionsQuery();
  const { data: impactLocationOptions } = useGetImpactLocationOptionsQuery();
  const { data: rawIssueContactOptions } = useGetIssueContactOptionsQuery();
  const issueContactOptions = isAag
    ? rawIssueContactOptions?.map((opt) =>
        opt.id === 'call_nwg' ? { ...opt, value: 'Call AAG to discuss' } : opt,
      )
    : rawIssueContactOptions;
  const { data: preferredCallTimeOptions } =
    useGetPreferredCallTimeOptionsQuery();
  const [submitForm, { isLoading }] = useSubmitFormMutation();
  // endregion

  // region Event Handlers
  /**
   * Handles form submission
   * - Validates all required fields
   * - Calls API to fetch vehicle details
   * - Dispatches results to Redux store
   * @param {Event} e - Form submit event
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        if (data.skip_to_confirmation) {
          await handleEnquirySubmission(
            dispatch,
            data,
            submitForm,
            brandSearchParam,
          );
          void handleProgressStateChanges(dispatch, progress_uuid, true);
          localStorage.removeItem('nwg_eq_uuid');
          dispatch(setFormCurrentStep(7));
          return;
        }

        await handleEnquirySubmission(
          dispatch,
          data,
          submitForm,
          brandSearchParam,
        );
        await dispatch(incrementFormCurrentStep());
        await handleProgressStateChanges(
          dispatch,
          progress_uuid,
          !!progress_uuid,
        );
      } catch (err) {
        console.error('damage-selection', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, dispatch, submitForm],
  );

  const handleChange = async (e) => {
    e.preventDefault();
    if (enquiry_id) {
      void handleProgressStateChanges(dispatch, progress_uuid, !!progress_uuid);
    }
    dispatch(setFormCurrentStep(2));
  };
  const handleEventWrapper = (event, field) => {
    if (field === damage) {
      selectWindow(event);
    }

    handleEventV2({
      event,
      field,
      form: 'damage_assessments_form',
    });
  };
  const selectWindow = (event) => {
    // Reset all paths
    const areas = document.querySelectorAll(
      'path.window, #path_other_left, #path_other_right',
    );
    areas.forEach((currArea) => currArea.classList.remove('selected-window'));

    const pathId = `path_${event}`;
    const selectedPath = document.getElementById(pathId);

    // If the event is 'path_other', select all related paths
    if (pathId === 'path_other') {
      const windowPaths = document.querySelectorAll(
        'path.window, #path_other_left, #path_other_right',
      );
      windowPaths.forEach((window) => {
        window.classList.add('selected-window');
      });
    } else {
      if (selectedPath) {
        selectedPath.classList.add('selected-window');
      }
    }
  };
  const setupMapEvents = () => {
    const areas = document.querySelectorAll(
      'path.window, #path_other_left, #path_other_right',
    );
    const listeners = [];

    const handleMouseOver = (area) => {
      const childPaths = area.querySelectorAll('path');
      const hoverColor = 'var(--brand-primary)';
      const selectedHoverColor = 'var(--brand-primary-hovered)';

      if (area.classList.contains('selected-window')) {
        if (childPaths.length > 0) {
          childPaths.forEach((item) => (item.style.fill = selectedHoverColor));
        } else {
          area.style.fill = selectedHoverColor;
        }
      } else {
        if (childPaths.length > 0) {
          childPaths.forEach((item) => (item.style.fill = hoverColor));
        } else {
          area.style.fill = hoverColor;
        }
      }
    };

    const handleMouseOut = (area) => {
      const childPaths = area.querySelectorAll('path');

      if (childPaths.length > 0) {
        childPaths.forEach((item) => (item.style.fill = ''));
      } else {
        area.style.fill = '';
      }
    };

    const handleClick = (area) => {
      setSelectedWindow(area.id);
      area.classList.add('selected-window');

      switch (area.id) {
        case 'path_windscreen':
          handleEventWrapper('windscreen', damage);
          break;
        case 'path_left_side_window':
          handleEventWrapper('left_side_window', damage);
          break;
        case 'path_right_side_window':
          handleEventWrapper('right_side_window', damage);
          break;
        case 'path_other_left':
        case 'path_other_right':
          handleEventWrapper('other', damage);
          break;
        case 'path_rear_window':
          handleEventWrapper('rear_window', damage);
          break;
      }
    };

    areas.forEach((area) => {
      const mouseOverListener = () => handleMouseOver(area);
      const mouseOutListener = () => handleMouseOut(area);
      const clickListener = () => handleClick(area);

      area.addEventListener('mouseover', mouseOverListener);
      area.addEventListener('mouseout', mouseOutListener);
      area.addEventListener('click', clickListener);

      listeners.push(
        { el: area, type: 'mouseover', fn: mouseOverListener },
        { el: area, type: 'mouseout', fn: mouseOutListener },
        { el: area, type: 'click', fn: clickListener },
      );
    });

    // Cleanup function to remove event listeners
    return () => {
      listeners.forEach(({ el, type, fn }) => {
        el.removeEventListener(type, fn);
      });
    };
  };
  // endregion
  // region UX components
  const renderDamageReason = (
    <>
      <div className="w-full flex flex-col md:flex-row gap-3">
        <FieldLayout
          id={date_of_damage.id}
          label={date_of_damage.label}
          error={errors[date_of_damage.id]}
        >
          <DatePickerField
            className={''}
            value={data[date_of_damage.object_name][date_of_damage.id]}
            disabled={has_paid || has_booked}
            onChange={(e) => handleEventWrapper(e, date_of_damage)}
          />
        </FieldLayout>
        <FieldLayout
          id={cause_of_damage.id}
          label={cause_of_damage.label}
          error={errors[cause_of_damage.id]}
        >
          <CustomDropdownField
            id={cause_of_damage.id}
            value={data[cause_of_damage.object_name][cause_of_damage.id]}
            options={causeOfDamageOptions}
            disabled={has_paid || has_booked}
            onBlur={(e) => handleEventWrapper(e, cause_of_damage)}
            onChange={(e) => handleEventWrapper(e, cause_of_damage)}
            className={errors[cause_of_damage.id] ? 'field--error' : ''}
          />
        </FieldLayout>
      </div>
    </>
  );
  const renderVehicleWindows = (
    <>
      <svg
        className={'max-w-[350px] max-h-[160px]'}
        id={'damage-assessment-window'}
        viewBox="0 0 350 163"
        height="100%"
        width="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect height="163" fill="#1E1E1E" />
        <g id="Vehicle Windows V3" clipPath="url(#clip0_0_1)">
          <rect width="350" height="163" fill="white" />
          <path
            id="car"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M236.407 1.83568C236.114 2.30868 237.671 6.40968 239.866 10.9487L243.857 19.2017L209.089 18.5937C189.966 18.2597 152.045 17.7217 124.82 17.3987L75.32 16.8107L50.32 20.4117C36.57 22.3917 24.05 24.4417 22.498 24.9667C20.946 25.4927 17.916 27.3157 15.765 29.0187C-2.83 43.7467 -4.235 114.034 13.68 133.318C18.644 138.66 22.408 139.75 48.981 143.537L74.32 147.148L158.82 146.193C205.295 145.668 243.404 145.301 243.507 145.377C243.61 145.454 241.909 149.071 239.726 153.415C237.275 158.29 236.113 161.669 236.688 162.244C239.699 165.255 248.275 155.194 248.275 148.65V144.784L255.797 145.63C259.935 146.095 271.383 146.364 281.239 146.227C298.859 145.983 299.342 145.918 310.239 142.328C325.838 137.188 330.131 134.838 333.881 129.388C338.778 122.27 346.503 105.133 347.931 98.2187C348.712 94.4337 349.524 92.4827 350.002 93.2367C350.435 93.9177 350.729 88.4007 350.655 80.9757C350.581 73.5507 350.306 68.8257 350.044 70.4757C349.641 73.0207 349.37 72.5307 348.262 67.2487C346.634 59.4897 340.067 44.3677 334.878 36.4257C330.121 29.1457 327.296 27.4717 310.82 22.1667C298.545 18.2157 298.014 18.1367 281.32 17.8097C271.97 17.6257 260.596 17.8787 256.045 18.3717C248.64 19.1737 247.836 19.0987 248.387 17.6627C249.373 15.0927 246.865 9.03168 243.083 4.84468C239.678 1.07568 237.486 0.0886784 236.407 1.83568ZM130.651 23.9757C116.534 24.2507 104.727 24.7327 104.414 25.0457C104.102 25.3597 105.235 27.5057 106.933 29.8147L110.021 34.0137L154.259 33.4757L156.007 28.7647C156.969 26.1737 157.433 23.9237 157.038 23.7647C156.643 23.6057 144.769 23.7007 130.651 23.9757ZM169.067 24.2257C167.567 26.1067 164.82 31.7327 164.82 32.9257C164.82 33.6167 170.543 33.9767 181.57 33.9777C197.569 33.9797 199.508 33.7517 224.818 28.8967C239.392 26.1007 251.504 23.6247 251.735 23.3947C251.965 23.1637 233.683 22.9757 211.109 22.9757C179.472 22.9757 169.836 23.2627 169.067 24.2257ZM84.82 26.6927C88.635 28.3867 104.528 32.9757 106.577 32.9757C107.376 32.9757 106.865 31.4897 105.201 28.9757L102.554 24.9757L91.937 25.0577C81.473 25.1377 81.37 25.1607 84.82 26.6927ZM249.32 29.0387C241.794 29.7407 231.922 31.5137 212.463 35.6597C209.796 36.2277 209.649 36.5077 210.262 39.8717C210.623 41.8537 211.575 47.0757 212.377 51.4757C215.821 70.3697 215.322 98.5157 211.179 119.081C210.294 123.47 209.786 127.275 210.048 127.537C211.206 128.695 233.475 133.139 245.32 134.576C258.38 136.16 269.148 135.941 272.74 134.019C275.165 132.721 280.307 119.559 283.086 107.535C286.05 94.7107 286.039 69.4207 283.064 56.4167C280.45 44.9887 275.189 31.2357 272.996 30.0947C270.223 28.6527 258.887 28.1467 249.32 29.0387ZM32.984 43.7257C29.887 55.4007 28.818 65.4827 28.84 82.7977C28.866 103.363 31.92 123.933 35.474 127.487C36.709 128.722 41.014 128.976 60.7 128.976C89.187 128.976 88.624 129.162 86.369 120.502C83.704 110.27 82.418 84.2627 83.665 65.8067C84.271 56.8247 85.458 46.8517 86.302 43.6437C87.147 40.4367 87.582 37.3987 87.27 36.8937C86.948 36.3747 75.482 35.9757 60.871 35.9757H35.039L32.984 43.7257ZM1.212 81.9757C1.212 89.4007 1.369 92.4387 1.562 88.7257C1.754 85.0127 1.754 78.9387 1.562 75.2257C1.369 71.5127 1.212 74.5507 1.212 81.9757ZM96.729 133.482C92.004 134.779 86.604 136.509 84.729 137.327L81.32 138.813L87.82 138.905C91.395 138.956 95.952 139.268 97.946 139.598C101.377 140.165 101.742 139.95 104.744 135.587C106.616 132.865 107.384 131.006 106.618 131.049C105.904 131.09 101.454 132.184 96.729 133.482ZM106.378 135.068C104.889 137.318 103.816 139.285 103.995 139.439C104.362 139.756 157.82 140.84 157.82 140.531C157.82 140.422 157.103 138.227 156.226 135.654L154.632 130.976H109.086L106.378 135.068ZM164.82 131.353C164.82 131.666 165.81 133.96 167.019 136.449L169.219 140.976L252.32 140.744L230.82 136.263C210.006 131.926 208.61 131.767 187.07 131.283C174.832 131.008 164.82 131.039 164.82 131.353Z"
            fill="#3D3D3D"
          />
          <g id="path_other_left" className="window">
            <path
              d="M82.5 25.5C82 24.5 102.5 24.5 102.5 24.5C105 28.5 107.5 32.5 107 33C106.5 33.5 82 27 82.5 25.5Z"
              fill="#EEEEEE"
            />
            <path
              d="M110 34.5C114.909 34.5 152.045 34 154.5 34C155.482 30.7 158 24.5 157.5 23.5C156 23 107 24 104 25C104 26 109.509 33.95 110 34.5Z"
              fill="#EEEEEE"
            />
          </g>
          <g id="path_other_right" className="window">
            <path
              d="M80.9999 139C83.3472 139.055 91.5 138.5 100 140C102.5 140.5 107.563 131.563 107 131C106.437 130.437 80.4913 137.417 80.9999 139Z"
              fill="#EEEEEE"
            />
            <path
              className={'window'}
              d="M109 131C114 131 152.5 131 155 131C156 134 157.5 138 158.5 141C152.5 141 116.5 140 103.5 139.5C103.5 139 108.5 131.5 109 131Z"
              fill="#EEEEEE"
            />
          </g>
          <path
            id="path_rear_window"
            className="window"
            d="M34.9999 36.0001C34.9999 35.0001 84.4999 35.5 86.9999 36.5C87.9999 37 87.4999 38 86.4999 44C82.9999 61 82.4999 112.5 86.9999 122C88.9999 128 84.9999 128 84.9999 128C82.9999 130 39.4998 129.5 35.9999 128C25.9999 123.714 25.9999 48 34.9999 36.0001Z"
            fill="#EEEEEE"
          />
          <path
            id="path_left_side_window"
            className="window"
            d="M169 23.5C171 22 252 22 252 23.5C252 24 227 29 227 29C227 29 206.46 33.7117 193 34.5C183 34.5 175.5 34.5 165 34C162.941 33.9019 168.577 23.8173 169 23.5Z"
            fill="#EEEEEE"
          />
          <path
            id="path_right_side_window"
            className="window"
            d="M168.53 140.887C170.565 142.371 253 142.371 253 140.887C253 140.392 227.557 135.443 227.557 135.443C227.557 135.443 206.653 130.78 192.955 130C182.778 130 175.145 130 164.459 130.495C162.363 130.592 168.099 140.573 168.53 140.887Z"
            fill="#EEEEEE"
          />
          <path
            id="path_windscreen"
            className="window"
            d="M210.5 35.5C222.5 30.7 254 25.5252 270.5 29.0252C290 33.1616 292.5 128.5 270.5 135.025C265.141 136.615 238 136.5 210.5 128.5C206.5 127.336 213.472 88.0504 213.5 80.0252C213.528 72 206.75 37 210.5 35.5Z"
            fill="#EEEEEE"
          />
          <path
            id="wheel"
            d="M284 121.5C290.904 121.5 296.5 115.904 296.5 109C296.5 102.096 290.904 96.5 284 96.5C277.096 96.5 271.5 102.096 271.5 109C271.5 115.904 277.096 121.5 284 121.5Z"
            stroke="#3D3D3D"
            strokeWidth="3"
          />
        </g>
        <defs>
          <clipPath id="clip0_0_1">
            <rect width="350" height="163" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </>
  );
  // end region

  // region Hook - Use Effects
  // Mirror live brand prices into booking state so calculateQuote (a reducer)
  // can price the quote without reading the RTK Query cache.
  useEffect(() => {
    if (!rawChipOptions) return;
    const priceMap = Object.fromEntries(
      rawChipOptions.map((opt) => [opt.option_id, opt.price]),
    );
    dispatch(setOptionPrices(priceMap));
  }, [rawChipOptions, dispatch]);

  useEffect(() => {
    if (!selectedWindow && damageValue) {
      selectWindow(damageValue);
    }

    const cleanup = setupMapEvents();

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [damageValue]);
  // end region
  return (
    <>
      {data && (
        <>
          {/*region Contact Field */}
          <section className={'w-full bg-white p-6'}>
            <FieldLayout
              id={contact.id}
              label={contact.label}
              error={errors[contact.id]}
              warning={warnings[contact.id]}
              showRequiredIdentifier={contact.required}
            >
              <TextField
                id={contact.id}
                disabled={has_paid || has_booked}
                value={data[contact.object_name][contact.id]}
                onChange={(e) => handleEventWrapper(e, contact)}
                className={errors[contact.id] ? 'field--error' : ''}
                validated={contact.validated}
                hasAutoTrim={true}
              ></TextField>
            </FieldLayout>
          </section>
          {/*endregion*/}
          {/*region Damage Field */}
          <section className={'w-full flex flex-col gap-6 bg-white p-6'}>
            <FieldLayout
              id={damage.id}
              error={errors[damage.id]}
              label={
                <>
                  <div className={'flex flex-col justify-center w-full'}>
                    <h2 className={'text-xl font-semibold leading-[38px] pb-6'}>
                      {damage.label}
                    </h2>
                  </div>
                </>
              }
              showErrorIcon={false}
            >
              <div className={'flex items-center justify-center pb-6'}>
                {renderVehicleWindows}
              </div>

              <CustomRadioField
                id={damage.id}
                disabled={has_paid || has_booked}
                value={data[damage.object_name][damage.id]}
                options={damageOptions}
                onChange={(e) => handleEventWrapper(e, damage)}
                invertSelectedImages
              ></CustomRadioField>
            </FieldLayout>

            {renderDamageReason}
          </section>
          {/*endregion*/}

          {/*region Damage Type Field */}
          {data[damage.object_name][damage.id] === 'windscreen' && (
            <section className={'w-full bg-white p-6'}>
              <FieldLayout
                id={damage_type.id}
                label={
                  <h2 className={'text-xl font-semibold leading-[38px]'}>
                    {damage_type.label}
                  </h2>
                }
                error={errors[damage_type.id]}
                showErrorIcon={false}
              >
                <CustomRadioField
                  id={damage_type.id}
                  disabled={has_paid || has_booked}
                  value={data[damage_type.object_name][damage_type.id]}
                  options={chipOptions}
                  onChange={(e) => handleEventWrapper(e, damage_type)}
                  layout="grid"
                  invertSelectedImages
                ></CustomRadioField>
              </FieldLayout>
            </section>
          )}
          {/*endregion*/}
          {/*region Impact Field */}
          {(data[damage_type.object_name][damage_type.id] === 'chip' ||
            data[damage_type.object_name][damage_type.id] === '2_chips' ||
            data[damage_type.object_name][damage_type.id] === '3_chips') && (
            <section className={'w-full bg-white p-6'}>
              <FieldLayout
                id={impact.id}
                label={
                  <h2 className={'text-xl font-semibold leading-[38px] '}>
                    {impact.label}
                  </h2>
                }
                error={errors[impact.id]}
                showErrorIcon={false}
              >
                <CustomRadioField
                  id={impact.id}
                  disabled={has_paid || has_booked}
                  value={data[impact.object_name][impact.id]}
                  options={impactOptions}
                  onChange={(e) => handleEventWrapper(e, impact)}
                  layout="grid"
                ></CustomRadioField>
              </FieldLayout>
            </section>
          )}
          {/*endregion*/}
          {/*region Impact Location */}
          {data[impact.object_name][impact.id] === 'smaller_than_2_coin' && (
            <>
              <section className={'w-full bg-white p-6'}>
                <FieldLayout
                  id={impact_location.id}
                  label={
                    <>
                      <div className={'flex flex-col gap-6'}>
                        <h2 className={'text-xl font-semibold leading-[38px]'}>
                          {impact_location.label}
                        </h2>
                        <h2
                          className={
                            'text-base font-semibold leading-[22px] pb-6'
                          }
                        >
                          {impact_location.description}
                        </h2>
                      </div>
                    </>
                  }
                  error={errors[impact_location.id]}
                  showErrorIcon={false}
                >
                  <img
                    src={windshield_impact}
                    alt="Windshield Impact"
                    className="pb-6 m-auto w-full max-w-[450px]"
                  />

                  <CustomRadioField
                    id={impact_location.id}
                    value={
                      data[impact_location.object_name][impact_location.id]
                    }
                    disabled={has_paid || has_booked}
                    options={impactLocationOptions}
                    onChange={(e) => handleEventWrapper(e, impact_location)}
                  ></CustomRadioField>
                </FieldLayout>
              </section>
              {data[impact_location.object_name][impact_location.id] ===
                'green_area' && (
                <div
                  className={`p-3 rounded-sm bg-[var(--issue-contact-bg)] flex flex-row gap-2 justify-center items-center`}
                >
                  <img src={ph_smiley} width={48} height={48} alt="Smiley" />
                  <h1 className={`text-3xl text-white`}>
                    Great news! We can repair the damage!
                  </h1>
                </div>
              )}
            </>
          )}
          {/*endregion*/}
          {/*region Issue Contact*/}
          {/*TODO: Add animation on toggling the contact section*/}
          {(data[damage.object_name][damage.id] === 'right_side_window' ||
            data[damage.object_name][damage.id] === 'left_side_window' ||
            data[damage.object_name][damage.id] === 'rear_window' ||
            data[damage.object_name][damage.id] === 'other' ||
            data[impact.object_name][impact.id] === 'bigger_than_2_coin' ||
            data[damage_type.object_name][damage_type.id] === 'crack' ||
            data[impact_location.object_name][impact_location.id] ===
              'white_area' ||
            data[damage_type.object_name][damage_type.id] ===
              'more_than_4_chips') && (
            <>
              <section className={'w-full bg-white p-6 pb-12'}>
                <FieldLayout
                  id={issue_contact.id}
                  label={
                    <>
                      <h2
                        className={'text-xl font-semibold leading-[38px] pb-6'}
                      >
                        {issue_contact.label}
                      </h2>
                    </>
                  }
                  error={errors[issue_contact.id]}
                  showErrorIcon={false}
                >
                  <CustomRadioField
                    id={issue_contact.id}
                    disabled={has_paid || has_booked}
                    value={data[issue_contact.object_name][issue_contact.id]}
                    options={issueContactOptions}
                    onChange={(e) => handleEventWrapper(e, issue_contact)}
                    layout="grid-sm"
                  ></CustomRadioField>
                  <div
                    className={`flex flex-col pt-6 justify-center items-center gap-2`}
                  >
                    {data[issue_contact.object_name][issue_contact.id] ===
                      'call_nwg' && (
                      <div className="flex flex-col items-center gap-2">
                        <div className={`flex flex-row gap-3 items-center`}>
                          <img
                            src={round_phone}
                            width={42}
                            height={42}
                            alt="Phone"
                          />
                          <a
                            href={`tel:${trackingPhone2 || fallbackPhone}`}
                            className={
                              'text-[var(--text-green)] font-bold text-3xl hover:underline'
                            }
                          >
                            {trackingPhoneFormatted2 || fallbackPhoneFormatted}
                          </a>
                        </div>
                        <div>
                          <span>24 hours, 7 Days a Week</span>
                        </div>
                      </div>
                    )}

                    {data[issue_contact.object_name][issue_contact.id] ===
                      'callback' && (
                      <>
                        <div className="w-full flex flex-col md:flex-row gap-3">
                          <FieldLayout
                            id={first_name.id}
                            label={first_name.label}
                            error={errors[first_name.id]}
                            showRequiredIdentifier={first_name.required}
                          >
                            <TextField
                              id="first_name"
                              disabled={has_paid || has_booked}
                              value={
                                data[first_name.object_name][first_name.id]
                              }
                              onBlur={(e) => handleEventWrapper(e, first_name)}
                              onChange={(e) =>
                                handleEventWrapper(e, first_name)
                              }
                              className={
                                errors[first_name.id] ? 'field--error' : ''
                              }
                              allowSpecialChars={false}
                            />
                          </FieldLayout>
                          <FieldLayout
                            id={last_name.id}
                            label={last_name.label}
                            error={errors[last_name.id]}
                            showRequiredIdentifier={last_name.required}
                          >
                            <TextField
                              id="last_name"
                              disabled={has_paid || has_booked}
                              value={data[last_name.object_name][last_name.id]}
                              onBlur={(e) => handleEventWrapper(e, last_name)}
                              onChange={(e) => handleEventWrapper(e, last_name)}
                              className={
                                errors[last_name.id] ? 'field--error' : ''
                              }
                              allowSpecialChars={false}
                            />
                          </FieldLayout>
                        </div>
                        {/*{data[contact.object_name][contact.id] && (*/}
                        <div className="w-full flex flex-col md:flex-row gap-3">
                          <FieldLayout
                            id={other_contact.id}
                            label={other_contact.label}
                            error={errors[other_contact.id]}
                            showRequiredIdentifier={other_contact.required}
                          >
                            <TextField
                              id="other_contact"
                              disabled={has_paid || has_booked}
                              value={
                                data[other_contact.object_name][
                                  other_contact.id
                                ]
                              }
                              onBlur={(e) =>
                                handleEventWrapper(e, other_contact)
                              }
                              onChange={(e) =>
                                handleEventWrapper(e, other_contact)
                              }
                              className={
                                errors[other_contact.id] ? 'field--error' : ''
                              }
                              validated={other_contact.validated}
                              hasAutoTrim={true}
                            />
                          </FieldLayout>
                          <FieldLayout
                            id={preferred_time.id}
                            label={preferred_time.label}
                            error={errors[preferred_time.id]}
                          >
                            <CustomDropdownField
                              id={preferred_time.id}
                              disabled={has_paid || has_booked}
                              value={
                                data[preferred_time.object_name][
                                  preferred_time.id
                                ]
                              }
                              options={preferredCallTimeOptions}
                              onBlur={(e) =>
                                handleEventWrapper(e, preferred_time)
                              }
                              onChange={(e) =>
                                handleEventWrapper(e, preferred_time)
                              }
                              className={
                                errors[preferred_time.id] ? 'field--error' : ''
                              }
                            />
                          </FieldLayout>
                        </div>
                      </>
                    )}
                  </div>
                </FieldLayout>
              </section>
              <div
                className={`p-3 rounded-sm bg-[var(--issue-contact-bg)] flex justify-center items-center`}
              >
                <h1 className={`text-3xl text-white`}>
                  We&#39;d like to speak to you!
                </h1>
              </div>
            </>
          )}
          {/*endregion*/}

          {/*region Buttons*/}
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
