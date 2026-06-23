import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonField, CustomRadioField } from '../../_common/ui/index.js';
import {
  incrementFormCurrentStep,
  setFormCurrentStep,
} from '../../_slices/form.slice.js';
import { CheckIcon } from '@heroicons/react/20/solid';
import { BRANDS } from '../../_common/constants/index.js';
import { FieldLayout } from '../../_common/layout/index.js';
import { useGetPaymentTypeOptionsQuery } from '../../_services/vehicle.api.js';
import { useActivePricingOptions } from '../../_hooks/active-options.hook.js';
import { useFormValidation } from '../../_hooks/form-validation.hook.js';
import { handleProgressStateChanges } from '../../_utils/progress-utils.js';
import { handleEnquirySubmission } from '../../_utils/enquiry-util.js';
import { useSubmitFormMutation } from '../../_services/enquiry.api.js';
import { useQueryParams } from '../../_hooks/query-params.hook.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function PaymentForm() {
  const dispatch = useDispatch();

  const { handleEventV2 } = useFormValidation();

  const data = useSelector((state) => state.booking);
  const { user_booking, user_details, payment_form, progress_uuid } = data;
  const { has_paid, has_booked } = user_booking;
  const { fields, errors } = payment_form;
  const { payment_type } = fields;
  const { payment_type: paymentType } = user_details;

  const { data: paymentTypeOptions } = useGetPaymentTypeOptionsQuery();
  const [submitForm, { isLoading }] = useSubmitFormMutation();
  const { brandSearchParam } = useQueryParams();
  const { data: activeOptions } = useActivePricingOptions();

  const handleChange = async (e) => {
    e.preventDefault();
    await dispatch(setFormCurrentStep(3));
    void handleProgressStateChanges(dispatch, progress_uuid, true);
  };
  const handleEventWrapper = (event, field) => {
    handleEventV2({ event, field, form: 'payment_form' });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleEnquirySubmission(dispatch, data, submitForm, brandSearchParam);
    await dispatch(incrementFormCurrentStep());
    void handleProgressStateChanges(dispatch, progress_uuid, true);
  };

  const getDamageType = (current) => {
    // service_label is the live, brand-specific service description from the
    // pricing API (e.g. "Chip Repair x 2").
    const option = (activeOptions ?? []).find(
      (opt) => opt.option_id === current,
    );
    return option?.service_label ?? '';
  };

  return (
    <>
      {data && (
        <>
          <section className={'w-full bg-white p-6 pb-12'}>
            <FieldLayout
              id={payment_type.id}
              label={
                <>
                  <h2 className={'text-xl font-semibold leading-[38px] pb-6'}>
                    {payment_type.label}
                  </h2>
                </>
              }
              error={errors[payment_type.id]}
              showErrorIcon={false}
            >
              <CustomRadioField
                id={payment_type.id}
                value={data[payment_type.object_name][payment_type.id]}
                options={paymentTypeOptions}
                disabled={has_booked || has_paid}
                onChange={(e) => handleEventWrapper(e, payment_type)}
                layout="grid-sm"
              ></CustomRadioField>
            </FieldLayout>
          </section>

          <section
            className={
              'w-full bg-white p-6 pb-12 flex flex-col gap-3 payment-selection border-1 border-[var(--brand-primary)] rounded'
            }
          >
            <div className={'flex flex-row justify-between'}>
              <h1 className={'text-base font-bold'}>
                {getDamageType(data.user_vehicle_damage.damage_type)}
              </h1>
              <div className={'flex flex-row items-center gap-2'}>
                <h1 className={'text-base font-bold'}>
                  ${paymentType === 'myself' ? data.user_payment.quote : '0'}
                </h1>
                <span className="relative flex size-4 items-center justify-center rounded-full bg-[var(--stepper-bg)]">
                  <CheckIcon aria-hidden="true" className="size-3 text-white" />
                </span>
              </div>
            </div>
            <div>
              <ul>
                {paymentType === 'myself' ? (
                  <>
                    <li>Just 30 minutes</li>
                    <li>Great value</li>
                    <li>Faster and cheaper than a replacement</li>
                    <li>Lifetime guarantee</li>
                  </>
                ) : (
                  <>
                    <li>Just 30 minutes</li>
                    <li>Great value</li>
                    <li>Faster and cheaper than a replacement</li>
                    <li>May be subject to excess</li>
                  </>
                )}
              </ul>
            </div>
          </section>
          {brandSearchParam === BRANDS.AAG && (
            <div
              className={`p-3 rounded-sm bg-[var(--issue-contact-bg)] `}
            >
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
                className="w-full"
                variant="confirm"
                disabled={isLoading}
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
