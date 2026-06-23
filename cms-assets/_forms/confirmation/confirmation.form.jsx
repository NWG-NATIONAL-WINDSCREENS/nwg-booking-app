import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QuoteCheckIcon } from '../../_common/ui/icons.jsx';
import { UploadField } from '../../_common/ui/index.js';
import { setFormCurrentStep } from '../../_slices/form.slice.js';
import { MapPinIcon } from '@heroicons/react/20/solid/index.js';
import calendar from '../../assets/calendar.svg';
import { formatDateLong } from '../../_utils/date-util.js';
import { useQueryParams } from '../../_hooks/query-params.hook.js';

export default function ConfirmationForm() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.booking);
  const { trackingPhone2, trackingPhoneFormatted2, brandSearchParam } =
    useQueryParams();
  const isAag = brandSearchParam === 'aag';
  const fallbackPhone = isAag ? '1300291103' : '1300011584';
  const fallbackPhoneFormatted = isAag ? '1300 291 103' : '1300 011 584';
  const { user_booking, skip_to_confirmation, user_details } = data;
  const { issue_contact, enquiry_id } = user_details;
  const { value: date, label: time } = user_booking.service_appointment || {};

  // eslint-disable-next-line no-unused-vars
  const handleRedirect = async (e) => {
    e.preventDefault();
    dispatch(setFormCurrentStep(6));
    // window.location.replace('https://staging.nwg.com.au/');
  };

  const renderDescription = (header, description) => {
    return (
      <>
        <h1 className={`text-3xl font-bold`} id="confirmation-message">
          {header}
        </h1>
        <p>{description}</p>
      </>
    );
  };

  const renderThanks = (
    <>
      <section className="flex flex-col  justify-center items-center">
        <div className="flex flex-col gap-3  p-12 text-center border-b border-gray-300">
          {issue_contact === 'call_nwg'
            ? renderDescription(
                'Thank you for getting in touch',
                <>
                  We understand that sometimes it’s just easier to have a quick
                  chat at the right time for you.. When you’re ready, give us a
                  call on{' '}
                  <a
                    href={`tel:${trackingPhone2 || fallbackPhone}`}
                    className="font-bold text-[var(--text-green)] hover:underline"
                  >
                    {trackingPhoneFormatted2 || fallbackPhoneFormatted}
                  </a>
                  .
                </>,
              )
            : renderDescription(
                'Thank you for getting in touch',
                'You should receive your callback shortly. You’re in safe hands — we’ll help get you back on the road quickly and easily.',
              )}
          <p>
            Enquiry Reference No: <b>{enquiry_id ? enquiry_id : '0000000'}</b>
          </p>
        </div>
      </section>
    </>
  );

  const renderServiceLocationDetails = (
    <section className="flex flex-col  w-full border-t border-gray-300 ">
      <div className="flex flex-col gap-3 p-6 border-b border-gray-300">
        <div className="flex flex-row gap-1">
          <MapPinIcon aria-hidden="true" className="size-5 black" />
          <h3 className={'font-bold'}>Service Location</h3>
        </div>
        <div className="flex flex-col gap-1">
          <span className={'text-sm font-bold'}>
            {user_booking.service_location === 'at_home'
              ? [user_details.home_location].filter(Boolean).join(', ')
              : user_booking?.service_appointment?.display_name}
          </span>
          <span className={'text-sm'}>
            {user_booking.service_location === 'at_home'
              ? [
                  user_details.home_street_address,
                  user_details.home_suburb,
                  user_details.home_state,
                  user_details.home_postcode,
                ]
                  .filter(Boolean)
                  .join(', ')
              : user_booking?.service_appointment?.address}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-6 border-b border-gray-300">
        <div className="flex flex-row gap-1">
          <img
            src={calendar}
            alt="Calendar"
            className={`size-6 transition-opacity duration-300 ease-in-out`}
          />
          <h3 className={'font-bold'}>Service date & time</h3>
        </div>
        <div className="flex flex-col gap-1">
          <span className={'text-sm'}>
            Monday <b>{formatDateLong(date, true)}</b> at <b>{time}</b>
          </span>
        </div>
      </div>
    </section>
  );

  const renderBookingConfirmation = (
    <section className="flex flex-col gap-6 justify-center items-center text-center p-12">
      <QuoteCheckIcon className="size-12 text-[var(--brand-primary)] transition-opacity duration-300 ease-in-out" />
      <h1 className={`text-3xl font-bold`} id="confirmation-message">
        Quote Confirmation
      </h1>
      <p>
        Thank you — your quote is locked in! We’re excited to meet you. If we
        need to clarify anything, we’ll be in touch.
      </p>
      <p>
        Quote Reference No:{' '}
        <b>
          {data.user_details.enquiry_id
            ? data.user_details.enquiry_id
            : '0000000'}
        </b>
      </p>
    </section>
  );

  return (
    <>
      {data && (
        <>
          <div>
            <section className={'w-full bg-white '}>
              <div className={''}>
                {!skip_to_confirmation && (
                  <>
                    {renderBookingConfirmation}
                    {renderServiceLocationDetails}
                  </>
                )}
                {skip_to_confirmation && renderThanks}
              </div>
            </section>
            {!skip_to_confirmation && (
              <section className={'w-full'}>
                <UploadField />
              </section>
            )}
          </div>
        </>
      )}
    </>
  );
}
