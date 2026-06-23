/* eslint-disable */
import { store } from '../_stores/store.js';
import { enquiryAPIV2 } from '../_services/enquiry.api.js';

export const handleProgressStateChanges = async (
  dispatch,
  id,
  update = false,
  moveTo = null,
) => {
  const currentStore = store.getState();

  if (currentStore.booking.user_booking.has_booked) {
    return;
  }

  const { booking, form } = currentStore;

  const updatedBooking = { ...booking };
  const updatedForm = { ...form };

  updatedBooking.repairers_results = [];
  updatedBooking.from_saved_state = true;

  if (moveTo) {
    updatedForm.current_step = moveTo;
  }

  const enquiryId = updatedBooking.user_details.enquiry_id;
  const encryptedState = encodeToBase64({
    booking: updatedBooking,
    form: updatedForm,
  });

  const payload = {
    id,
    state: encryptedState,
  };

  if (enquiryId) {
    payload.enquiry_id = enquiryId;
  }

  const refThunk = update
    ? enquiryAPIV2.endpoints.updateEnquiryProgress
    : enquiryAPIV2.endpoints.saveEnquiryProgress;

  const thunk = refThunk.initiate(payload, {
    subscribe: false,
    forceRefetch: true,
  });

  try {
    await dispatch(thunk).unwrap();

    console.log(
      '*************************************************************',
    );
    console.log(
      `Successfully ${update ? 'updated' : 'created'} enquiry progress`,
    );
  } catch (e) {
    console.error(e);
  }
};

const encodeToBase64 = (obj) => {
  const json = JSON.stringify(obj);
  const utf8Bytes = new TextEncoder().encode(json);
  const chunkSize = 0x8000;
  let binaryString = '';

  for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
    const chunk = utf8Bytes.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binaryString);
};
