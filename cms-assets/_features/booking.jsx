import React, { useEffect } from 'react';
import {
  VehicleConfirmation,
  VehicleSearchForm,
  DamageSelectionForm,
  PaymentForm,
  BookingForm,
  UserDetailsForm,
  ConfirmationForm,
} from '../_forms/index.js';
import { useDispatch, useSelector } from 'react-redux';
import { setSecrets } from '../_slices/secret.slice.js';
import {
  Loader,
  Stepper,
  StepperHeader,
  StepperWidget,
} from '../_common/ui/index.js';
import {
  incrementFormCurrentStep,
  setFormCurrentStep,
} from '../_slices/form.slice.js';
import { SidebarFormLayout } from '../_common/layout/index.js';
import {
  setUTK,
  setVehicleParamLookupRedirect,
  setOverlayConfiguration,
} from '../_slices/booking.slice.js';
import { initIframeHeightListener } from '../_utils/iframe-utils.js';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useQueryParams } from '../_hooks/query-params.hook.js';
import { BRANDS } from '../_common/constants/index.js';
/**
 * The `Booking` component handles the multistep vehicle booking process.
 * - Uses Redux to manage the current form step and booking state.
 * - Dispatches secrets data on mount.
 * - Renders different form components based on the current step.
 */
function Booking({
  secrets,
  header,
  subheader,
  invertHeaderColor,
  manualCarSelection,
  redirectTo,
  redirectToAag,
  overlay,
}) {
  const dispatch = useDispatch();
  const { devSearchParam, utk, brandSearchParam } = useQueryParams();
  const effectiveRedirect =
    brandSearchParam === BRANDS.AAG ? redirectToAag : redirectTo;

  // region Redux States
  const form = useSelector((state) => state.form);
  const data = useSelector((state) => state.booking);

  const {
    search_results: vehicleResult,
    from_saved_state,
    state_loading,
  } = data;
  const { google_maps_api_key } = secrets;
  // endregion
  // region Event Handlers
  const handleStepperChange = (step) => {
    if (form.current_step > step.id) {
      dispatch(setFormCurrentStep(step.id));
    }
  };
  // endregion
  // region Hook - Use Effects
  useEffect(() => {}, [from_saved_state]);
  useEffect(() => {
    if (effectiveRedirect) {
      dispatch(setVehicleParamLookupRedirect(effectiveRedirect));
    }
    dispatch(setSecrets(secrets));
  }, [secrets, dispatch, effectiveRedirect]);
  useEffect(() => {
    if (form.current_step === 0) {
      dispatch(incrementFormCurrentStep());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);
  useEffect(() => {
    if (utk) {
      dispatch(setUTK(utk));
    }
  }, [utk, dispatch]);
  useEffect(() => {
    dispatch(setOverlayConfiguration(overlay));
  }, [overlay, dispatch]);
  useEffect(() => {
    const cleanup = initIframeHeightListener();
    return () => {
      cleanup();
    };
  }, []);
  // endregion
  return (
    <APIProvider apiKey={google_maps_api_key}>
      {!overlay && state_loading && <Loader></Loader>}
      <div
        className={`${form.current_step >= 3 && form.current_step < 7 ? 'md:block lg:hidden' : 'hidden'}`}
      >
        <StepperWidget isNavbar={true} />
      </div>
      <div
        className={`flex justify-center ${form.current_step === 1 ? 'items-center' : ''}  ${form.current_step === 2 ? 'justify-center pt-24' : 'lg:justify-start'} ${form.current_step >= 3 ? 'xs:py-6 md:py-16 py-6' : ''}  ${!overlay ? 'min-h-[600px]' : ''} ${devSearchParam ? 'bg-[var(--booking-body-bg)] p-6 [@media(max-width:500px)]:px-1' : ''} `}
      >
        {form.current_step === 1 && (
          <div
            className={`vehicle-search ${!overlay ? 'lg:ml-80 max-w-[392px] sm:max-w-[550px]' : ''} flex flex-col gap-6 flex-grow ${form.current_step === 2 ? 'max-w-full' : ''}`}
          >
            <VehicleSearchForm
              header={header}
              subheader={subheader}
              invertHeaderColor={invertHeaderColor}
              manualCarSelection={manualCarSelection}
            />
          </div>
        )}
        {form.current_step === 2 && vehicleResult && (
          <div
            className={`flex flex-col gap-6 flex-grow max-w-[392px] sm:max-w-[550px] ${form.current_step === 2 ? 'max-w-full' : ''}`}
          >
            <VehicleConfirmation manualCarSelection={manualCarSelection} />
          </div>
        )}
        {form.current_step >= 3 && (
          <>
            <div className={'flex flex-col gap-6 flex-grow'}>
              <StepperHeader />
              <Stepper steps={form.steps} onClick={handleStepperChange} />

              {form.steps.map((step) => {
                if (step.status === 'complete') {
                  if (step.id === 7) {
                    return (
                      <div
                        key={step.id}
                        className={'flex flex-row gap-6 justify-center'}
                      >
                        <div
                          className={
                            'flex flex-col gap-6 md:max-w-[690px] w-full flex-grow'
                          }
                        >
                          <ConfirmationForm />
                        </div>
                      </div>
                    );
                  }
                }
                if (step.status === 'current') {
                  if (step.id === 3) {
                    return (
                      <SidebarFormLayout
                        key={step.id}
                        header={`Book your appointment in minutes`}
                        form={<DamageSelectionForm />}
                      />
                    );
                  } else if (step.id === 4) {
                    return (
                      <SidebarFormLayout
                        key={step.id}
                        header={`Book your appointment in minutes`}
                        form={<PaymentForm />}
                      />
                    );
                  } else if (step.id === 5) {
                    return (
                      <SidebarFormLayout
                        key={step.id}
                        showMap={true}
                        header={`Book your appointment in minutes`}
                        form={<BookingForm />}
                      />
                    );
                  } else if (step.id === 6) {
                    return (
                      <SidebarFormLayout
                        key={step.id}
                        header={`Book your appointment in minutes`}
                        form={<UserDetailsForm />}
                      />
                    );
                  }
                }
              })}
            </div>
          </>
        )}
      </div>
    </APIProvider>
  );
}

export default Booking;
