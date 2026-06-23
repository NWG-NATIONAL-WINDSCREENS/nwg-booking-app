import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonField, LinkField } from '../../_common/ui/index.js';
import car from '../../assets/car.png';
import {
  clearSearchResults,
  confirmVehicleDetails,
} from '../../_slices/booking.slice.js';
import {
  incrementFormCurrentStep,
  setFormCurrentStep,
} from '../../_slices/form.slice.js';
import { handleProgressStateChanges } from '../../_utils/progress-utils.js';

export default function VehicleConfirmation({
  manualCarSelection = false,
  enablePreview = false,
  showHeader = true,
  isSidebar = false,
  isNavbar = false,
  optionalClassName,
}) {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.booking);
  const { search_results, progress_uuid } = data;
  const { has_paid, has_booked } = data.user_booking;
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(confirmVehicleDetails(search_results));
    await dispatch(incrementFormCurrentStep());
    void handleProgressStateChanges(dispatch, progress_uuid, true);
  };

  const handleChange = async (e) => {
    e.preventDefault();

    // TODO: Add validation if manual selection has been made or through registration lookup
    dispatch(setFormCurrentStep(1));
    dispatch(clearSearchResults());
  };

  const buttonGroup = !(isSidebar || isNavbar) ? (
    <div className={'flex flex-row gap-3 basis-full w-full'}>
      <ButtonField
        dataTestID={'confirmation-change'}
        className="w-full"
        variant="change"
        disabled={has_paid || has_booked}
        insideContainer={true}
        onClick={handleChange}
      >
        Change
      </ButtonField>
      <ButtonField
        dataTestID={'confirmation-confirm'}
        className="w-full"
        variant="confirm"
        insideContainer={true}
        onClick={handleSubmit}
      >
        Confirm
      </ButtonField>
    </div>
  ) : null;

  const vehicleDetails = search_results ? (
    <div className={'flex flex-col gap-4'}>
      <h1
        className={`${isNavbar ? 'text-base' : 'text-3xl'} font-bold leading-[38px] max-w-xs`}
      >
        {search_results.vehicle.identification.plate}
      </h1>
      <div
        className={`${isSidebar || isNavbar ? 'text-base flex' : 'text-sm/6'}`}
      >
        <div className={'flex flex-col text-wrap gap-1'}>
          <span>
            {search_results.vehicle.details.make +
              ' ' +
              search_results.vehicle.details.model}
          </span>
          <div className={'flex flex-wrap text-wrap'}>
            <span>
              {search_results.vehicle.details.year +
                ' ' +
                search_results.vehicle.details.fuelType +
                ' ' +
                search_results.vehicle.details.transmission}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const navbarButton = isNavbar ? (
    <div
      className={
        'flex flex-grow min-w-[130px] [@media(min-width:465px)]:justify-end justify-end items-center'
      }
    >
      <ButtonField
        dataTestID={'confirmation-change'}
        className="text-sm h-[32px]! px-3"
        variant="change"
        onClick={handleChange}
        insideContainer={true}
      >
        Change Vehicle
      </ButtonField>
    </div>
  ) : null;

  const sidebarButton = isSidebar ? (
    <div className={'flex flex-grow justify-center items-center min-w-[130px]'}>
      <ButtonField
        dataTestID={'confirmation-change'}
        className="text-sm h-[32px]! px-3"
        variant="change"
        insideContainer={true}
        onClick={handleChange}
      >
        Change Vehicle
      </ButtonField>
    </div>
  ) : null;

  return (
    <div className={`flex flex-col gap-6 ${optionalClassName}`}>
      {showHeader && (
        <h1 className={`text-3xl font-bold leading-[38px] text-center`}>
          Is this your car?
        </h1>
      )}

      {search_results && (
        <>
          <section className={'flex w-full flex-col gap-3'}>
            <div
              className={
                'flex gap-6 flex-col w-full items-center justify-center bg-white p-6'
              }
            >
              <div className={'flex flex-col w-full justify-center  '}>
                <div className={'flex flex-row gap-6 '}>
                  {enablePreview && (
                    <div className={'flex items-center justify-center'}>
                      <img src={car} width={160} height={58} alt="logo" />
                    </div>
                  )}
                  <div className={'flex flex-col gap-3 w-full'}>
                    <div
                      className={`flex gap-4  ${isNavbar ? 'flex-row' : 'flex-col'}`}
                    >
                      <div
                        className={`flex flex-col flex-grow ${isNavbar ? 'basis-60' : ''} ${isSidebar || isNavbar ? ' ' : 'gap-3'}`}
                      >
                        {vehicleDetails}
                      </div>

                      {navbarButton}
                      {sidebarButton}
                    </div>
                  </div>
                </div>
              </div>

              {buttonGroup}
            </div>
          </section>

          {manualCarSelection ? (
            <div className={'flex mx-auto font-semibold'}>
              or search again&nbsp;
              <LinkField className={''}> Manually</LinkField>
            </div>
          ) : (
            ''
          )}
        </>
      )}
    </div>
  );
}
