import { mapAPI } from '../_services/index.js';
import { getSucceedingDate, parseDate } from './date-util.js';
import { setSelectedAppointmentDateTime } from '../_slices/booking.slice.js';
import { vehicleAPIV2 } from '../_services/vehicle.api.js';

export const handleLocationChange = async (
  dispatch,
  getGeocodePayload,
  getRepairer = true,
  locationType = 'repairer',
) => {
  const geocodeThunk = mapAPI.endpoints.getGeocode.initiate(
    {
      ...getGeocodePayload,
      locationType,
    },
    {
      subscribe: false,
      forceRefetch: true,
    },
  );

  const {
    location,
    latitude: lat,
    longitude: long,
  } = await dispatch(geocodeThunk).unwrap();

  if (getRepairer) {
    const repairerThunk = vehicleAPIV2.endpoints.getRepairers.initiate({
      lat,
      long,
    });
    await dispatch(repairerThunk);
  }

  return location;
};

export const handleMapEventChange = async (
  dispatch,
  handleEventV2,
  displayed_data_key,
  service_location,
  field,
  options,
  repairer_id,
) => {
  const currentBranchIndex = options.findIndex(
    (option) => option.repairer_id === repairer_id,
  );
  let pageIndex = 0;
  const date = getSucceedingDate();
  let detail = options[currentBranchIndex][displayed_data_key][pageIndex];
  let dayIndex = detail.week.findIndex((day) => day.date === date);

  // If it can't find date on current page, increment another page
  if (dayIndex === -1) {
    pageIndex++;
    detail = options[currentBranchIndex][displayed_data_key][pageIndex];
    dayIndex = detail.week.findIndex((day) => day.date === date);
  }

  const currentSelectedAppointment = options[currentBranchIndex][
    displayed_data_key
  ][pageIndex].week[dayIndex].options.find(
    (option) => option.service_location === service_location,
  );

  const parsedDate = parseDate(currentSelectedAppointment.value);

  dispatch(
    setSelectedAppointmentDateTime({
      service_appointment_date: parsedDate,
      service_appointment_date_time_branch_index: currentBranchIndex,
      service_appointment_date_time_page_index: pageIndex,
      service_appointment_date_time_day_index: dayIndex,
    }),
  );

  if (handleEventV2) {
    handleEventV2({
      event: currentSelectedAppointment,
      field,
      form: 'booking_form',
    });
  }
};
