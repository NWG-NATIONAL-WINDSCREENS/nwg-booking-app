export const prepareAppointmentPayload = (data) => {
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
    service_location === 'at_home' ? home_address : service_appointment.address;

  const suburbStatePostcodeAddress =
    suburb && state && postcode ? `${suburb} ${state}, ${postcode}` : '';

  return {
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
      address: address ? address : `${suburbStatePostcodeAddress}`,
    },
  };
};
