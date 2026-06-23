import { setSearchResults } from '../_slices/booking.slice.js';
import { setFormCurrentStep } from '../_slices/form.slice.js';
import { handleProgressStateChanges } from './progress-utils.js';

export const handleVehicleLookup = async (
  data,
  dispatch,
  fields,
  getVehicleDetail,
  { progressId, isExistingSession },
) => {
  try {
    const { registration_number, state } = fields;
    const currentStep = 2;
    const payload = {
      plate: data[registration_number.object_name][registration_number.id],
      state: data[state.object_name][state.id],
    };

    const res = await getVehicleDetail(payload).unwrap();

    if (res.status === 'NO_MATCH') {
      console.warn('No vehicle found', res);
      return;
    }

    dispatch(setSearchResults(res));

    await handleProgressStateChanges(
      dispatch,
      progressId,
      isExistingSession,
      currentStep,
    );

    if (res) {
      if (data.vehicle_lookup_param_redirect_to) {
        handleRedirect(data);
      } else {
        dispatch(setFormCurrentStep(currentStep));
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const handleRedirect = (data) => {
  const { registration_number: registration, state: registration_state } =
    data.user_vehicle_detail;
  const { location, postcode } = data.user_details;
  window.parent.postMessage(
    {
      type: 'setRegistrationData',
      vehicle: {
        registration_number: registration,
        state: registration_state,
        location: location,
        postcode: postcode,
      },
    },
    '*',
  );
  console.log('getVehicleDetails - postMessage sent for lookup details');
  window.top.location.replace(`${data.vehicle_lookup_param_redirect_to}`);
};
