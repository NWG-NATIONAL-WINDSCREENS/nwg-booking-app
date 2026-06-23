import {
  DamageOptions,
  ImpactLocationOptions,
  ImpactOptions,
  resolveBrandGroup,
} from '../_common/constants/index.js';
import { setEnquiryId } from '../_slices/booking.slice.js';
import { store } from '../_stores/store.js';
import { prepareAppointmentPayload } from './appointment-util.js';
import { sessionAPI } from '../_services/session.api.js';

export const prepareEnquiryPayload = (data, brand) => {
  const currentStore = store.getState();

  const {
    user_details,
    user_vehicle_damage,
    user_vehicle_detail,
    user_confirmed_vehicle_lookup,
    user_booking,
    user_payment,
  } = data;
  const {
    first_name,
    last_name,
    email,
    mobile,
    insurer,
    claim_number,
    policy_number,
    enquiry_id,
    location_street_address,
    location_suburb,
    location_state,
    location_postcode,
    preferred_time,
    utk,
  } = user_details;
  const { registration_number, state } = user_vehicle_detail;
  const { damage, damage_type, impact, impact_location } = user_vehicle_damage;
  const { service_location, service_appointment } = user_booking;

  const selectedDamage = DamageOptions.find((opt) => opt.id === damage);
  const selectedImpactValue = ImpactOptions.find((opt) => opt.id === impact);
  const selectedImpactLocationValue = ImpactLocationOptions.find(
    (opt) => opt.id === impact_location,
  );
  const payload = {
    contact: {
      firstname: first_name,
      lastname: last_name,
      email: email,
      phone: mobile ? '+61' + mobile.slice(1) : '',
      preferred_call_time: preferred_time,
      zip: location_postcode,
      brand_group: resolveBrandGroup(brand),
    },
    vehicle: {
      registration_state: state,
      registration: registration_number,

      // Fixed
      what_is_the_damage: setChipPayload(damage_type),

      // Fixed
      damage_area: selectedImpactLocationValue
        ? selectedImpactLocationValue.value
        : null,

      // Fixed
      damaged_window: selectedDamage ? setDamagePayload(selectedDamage) : null,

      // Fixed
      impact_size: selectedImpactValue ? selectedImpactValue.value : null,
      vehicle_payload: JSON.stringify(user_confirmed_vehicle_lookup),
      insurer,
      claim_number,
      policy_number,
    },
  };

  // If enquiry_id exists, include on form submission for reference
  if (enquiry_id) {
    payload.contact.uuid = enquiry_id;
  } else {
    console.log('Generating Enquiry ID');
    payload.contact.uuid = generateEnquiryId();
  }

  // If utk exists, include on form submission for HubSpot tracking cookie on submission
  if (utk) {
    payload.hutk = utk;
  }

  if (service_location === 'at_home') {
    payload.contact.address = location_street_address;
    payload.contact.suburb = location_suburb;
    payload.contact.state = location_state;
  }

  // Once we got the service_appointment details, return all details
  // https://ideascience.atlassian.net/browse/NW458-442
  const allDetails = {
    // If enquiry_id is null, return the generated contact.uuid from generateEnquiryId()
    enquiry_id: enquiry_id || payload.contact.uuid,
    brand_group: resolveBrandGroup(brand),
    contact: payload.contact,
    vehicle: payload.vehicle,
    quote: user_payment?.quote ?? 0,
    form: currentStore.form,
  };

  if (service_appointment) {
    const serviceDetail = prepareAppointmentPayload(data);
    allDetails.repairer = {
      repairer_id: service_appointment.repairer_id,
      company_id: service_appointment.company_id,
    };
    allDetails.appointment = serviceDetail.appointment;
  }
  payload.contact.booking_form_payload = JSON.stringify(allDetails);

  return payload;
};

const setDamagePayload = (option) => {
  if (option.id === 'windscreen') {
    return 'Windscreen';
  } else if (option.id === 'right_side_window') {
    return 'Right Side Window';
  } else if (option.id === 'left_side_window') {
    return 'Left Side Window';
  } else if (option.id === 'rear_window') {
    return 'Rear Window';
  } else if (option.id === 'other') {
    return 'Other';
  }
};

const setChipPayload = (damageType) => {
  switch (damageType) {
    case 'crack':
      return 'Crack';
    case 'chip':
      return 'Chip';
    case '2_chips':
      return '2 Chips';
    case '3_chips':
      return '3 Chips';
    case 'more_than_4_chips':
      return '4+ Chips';
    default:
      return null;
  }
};

export const handleEnquirySubmission = async (
  dispatch,
  data,
  submitForm,
  brand,
) => {
  try {
    const payload = prepareEnquiryPayload(data, brand);
    const res = await submitForm(payload).unwrap();

    if (res.error) {
      console.error('Error submitting enquiry:', res.error);
      return;
    }

    if (res.status === 'SUCCESS') {
      dispatch(setEnquiryId(res.enquiryId));
    }

    return res;
  } catch (error) {
    console.error('Error submitting enquiry:', error);
  }
};

const generateEnquiryId = () => {
  const today = new Date();
  const datePart = today.toISOString().slice(2, 10).replace(/-/g, '');

  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  // E.g E240321A7F2
  return `E${datePart}${randomPart}`;
};

export const createSession = async (dispatch, sessionId) => {
  const thunk = sessionAPI.endpoints.createSession.initiate(sessionId);
  try {
    await dispatch(thunk).unwrap();
    console.log('Session cookie set');
  } catch (e) {
    console.error(e);
  }
};
