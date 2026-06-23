import { createSlice } from '@reduxjs/toolkit';
import {
  DamageAssessmentForm,
  PaymentForm,
  RegistrationForm,
  BookingForm,
  UserDetailsForm,
} from '../_common/constants/form.js';
import {
  calculateQuote,
  checkPatterns,
  getFieldValue,
  handleAddressFulfilled,
  handleAddressPending,
  handleAddressRejected,
  handleBranchesFulfilled,
  handleBranchesPending,
  handleBranchesRejected,
  handleCreateSessionFulfilled,
  handleCreateSessionPending,
  handleCreateSessionRejected,
  handleFindVehicleFulfilled,
  handleFindVehiclePending,
  handleFindVehicleRejected,
  handleGeolocationFulfilled,
  handleGeolocationPending,
  handleGeolocationRejected,
  handleLocationFulfilled,
  handleLocationPending,
  handleLocationRejected,
  handleSaveEnquiryProgressFulfilled,
  handleSaveEnquiryProgressPending,
  handleSaveEnquiryProgressRejected,
  isFieldEmpty,
  looksSuspiciousEmail,
  resetOtherContactField,
  setContactDetails,
  updateContactField,
  updateDamageAssessments,
  updateLocationSelection,
  updatePaymentSelection,
  validateDamageSelectedOptions,
  validatePattern,
} from './booking.actions.js';
import { mapAPI } from '../_services/index.js';
import { sessionAPI } from '../_services/session.api.js';
import { vehicleAPIV2 } from '../_services/vehicle.api.js';
import { enquiryAPIV2 } from '../_services/enquiry.api.js';

const name = 'booking';
const initialState = createInitialState();
const extraReducers = createExtraReducers();

const slice = createSlice({
  name,
  initialState,
  reducers: createReducers(),
  extraReducers: (builder) => {
    extraReducers(builder);
  },
});

export function createInitialState() {
  return {
    // Object for getting user vehicle details from Step 2
    user_vehicle_detail: {
      registration_number: '',
      state: '',
      year: null,
      make: null,
      model: null,
      variant: null,
      location: '',
      location_type: null,
    },
    user_vehicle_damage: {
      damage: '',
      damage_type: '',
      impact: '',
      impact_location: '',
      date_of_damage: '',
      cause_of_damage: '',
    },
    user_confirmed_vehicle_lookup: null,
    // Coming from InfoAgent API upon confirming vehicle details
    user_confirmed_vehicle_detail: {
      vin: null,
      engine_number: null,
      body_type: null,
      fuel_type: null,
      colour: null,
      year: null,
      make: null,
      model: null,
      vehicle_type: null,
    },
    user_details: {
      contact: '',
      contact_type: '',
      first_name: '',
      last_name: '',
      other_contact: '',
      other_contact_type: '',
      preferred_time: null,
      issue_contact: null,

      // Come to me - Address
      address_loading: false,
      address_results: [],

      home_address_valid: false,
      home_address_distance_from_repairer_in_km: null,

      home_location: '',
      home_address: '',
      home_street_address: '',
      home_suburb: '',
      home_state: '',
      home_postcode: '',
      home_place_id: '',

      home_longitude: '',
      home_latitude: '',

      // Postcode/Suburb locations
      location: '',
      location_address: '',
      location_place_id: '',
      location_street_address: '',
      location_suburb: '',
      location_state: '',
      location_postcode: '',

      location_latitude: '',
      location_longitude: '',

      terms: false,
      insurer: '',
      policy_number: '',
      claim_number: '',
      payment_type: 'myself',

      email: '',
      mobile: '',

      enquiry_id: '',
      utk: '',
    },
    user_payment: {
      quote: 0,
      // option_id -> price, mirrored from the live pricing API so calculateQuote
      // (which runs inside a reducer and cannot read the RTK Query cache) can
      // price the quote. See setOptionPrices.
      option_prices: {},
    },
    user_booking: {
      service_location: 'service_centre',
      service_appointment: null,
      service_appointment_date: null,
      service_appointment_date_time_branch_index: null,
      service_appointment_date_time_page_index: null,
      service_appointment_date_time_day_index: null,
      has_paid: false,
      has_booked: false,
    },

    search_results: null,

    location_loading: false,
    location_results: [],

    address_loading: false,
    address_results: [],

    enquiry_progress_loading: false,
    state_loading: true,

    session_loading: false,

    repairers_loading: false,
    repairers_results: [],
    repairer_displayed_data_key: 'paginated_date_options',

    address_validation_valid: false,
    address_validation_loading: false,

    // Sets form metadata (field, regex patterns, label, object_name)
    registration_search_form: RegistrationForm,
    damage_assessments_form: DamageAssessmentForm,
    payment_form: PaymentForm,
    booking_form: BookingForm,
    user_form: UserDetailsForm,

    dev: false,
    progress_uuid: '',
    appointment_overlay: false,
    address_autocomplete: true,
    skip_to_confirmation: false,
    disabled_geolocation: false,
    vehicle_lookup_param_redirect_to: false,
    vehicle_lookup_param_done: false,
    from_saved_state: false,
    overlay: false,
  };
}

function createReducers() {
  return {
    setPropValue: (state, action) => {
      const { value, field, form } = action.payload;

      const prop = field.id;
      const objectName = field.object_name;

      if (!objectName) {
        state[prop] = value;
        return;
      }

      if (prop in state[objectName]) {
        state[objectName][prop] = value;
      }

      if (
        (form === 'registration_search_form' && prop === 'location') ||
        (form === 'user_form' && prop === 'home_address')
      ) {
        updateLocationSelection(state, form, prop, value);
      }

      if (form === 'damage_assessments_form') {
        updateDamageAssessments(state, prop, value);
      }

      if (form === 'user_form' && prop === 'payment_type') {
        updatePaymentSelection(state, value);
      }

      if (form === 'booking_form' && prop === 'service_location') {
        // Clear selected appointment
        state.user_booking.service_appointment = {};

        if (value === 'at_home') {
          const autocompleteEnabled = state.address_autocomplete;
          state.user_form.fields.home_street_address.required =
            !autocompleteEnabled;
          state.user_form.fields.home_state.required = !autocompleteEnabled;
          state.user_form.fields.home_suburb.required = !autocompleteEnabled;
          state.user_form.fields.home_postcode.required = !autocompleteEnabled;
        }
      }

      if (form === 'booking_form' && prop === 'location') {
        // Clear selected appointment
        state.user_booking.service_appointment = {};
      }

      if (
        form === 'user_form' &&
        [
          'home_street_address',
          'home_suburb',
          'home_state',
          'home_postcode',
        ].includes(prop)
      ) {
        state.user_details.home_address_valid = false;

        // Clear the form if prop changes within the form
        state[form].errors.form = '';
      }
    },
    validatePropValue: (state, action) => {
      const { field, form } = action.payload;

      if (form) {
        const fields = state[form].fields;
        let allRequiredValid = true;
        const updatedErrors = { ...state[form].errors };
        const updatedWarnings = { ...state[form].warnings };

        Object.entries(fields).forEach(([name, currField]) => {
          let errorMessage = '';
          let warningMessage = '';

          const { object_name, patterns, required, id } = currField;
          const value = getFieldValue(state, object_name, name);
          const hasNoValue = isFieldEmpty(value);
          const hasPatterns = checkPatterns(patterns);

          // if (form === 'user_form') {
          //   allRequiredValid = state.user_details.home_address_valid;
          // }

          // Location specific validation
          if (
            (id === 'location' && form === 'registration_search_form') ||
            (id === 'home_address' && form === 'user_form')
          ) {
            const options = state[form].fields[id].options;
            if (!hasNoValue && options) {
              allRequiredValid = options.some(
                (option) => option.value === value,
              );
            }

            // NOT A GOOD IDEA TO VALIDATE IN REAL TIME CHANGES
            if (id === 'home_address' && form === 'user_form' && hasNoValue) {
              updatedErrors['form'] = '';
            }
          }

          if (id === 'service_appointment' && value) {
            // ITS EMPTY
            allRequiredValid = !(Object.keys(value).length === 0);
          }

          // Required field validation
          if (required && hasNoValue) {
            allRequiredValid = false;
            if (hasPatterns) {
              state[form].fields[name].validated = false;
            }
          }
          // Checks whether the current field is FALSE and is required
          else if (required && value === false) {
            allRequiredValid = false;
          }
          // Regex pattern field validation
          else if (hasPatterns && !hasNoValue) {
            const { isValid, matchedPatternKey } = validatePattern(
              patterns,
              value,
            );

            if (!isValid && id !== 'registration_number') {
              allRequiredValid = false;
              errorMessage =
                state[form].fields[name].validation_message ?? 'Invalid Format';
            }

            if (
              isValid &&
              (currField.id === 'contact' || currField.id === 'email')
            ) {
              const isSuspiciousEmail = looksSuspiciousEmail(value);
              if (isSuspiciousEmail) {
                warningMessage =
                  'This email looks unusual. Please double-check before continuing';
              }
            }

            // Contact field validation which ensures if value matches pattern for email | mobile
            if (
              (currField.id === 'contact' ||
                currField.id === 'other_contact' ||
                currField.id === 'email' ||
                currField.id === 'mobile') &&
              matchedPatternKey
            ) {
              updateContactField(
                state,
                form,
                currField,
                value,
                matchedPatternKey,
              );
              setContactDetails(state, form, value, matchedPatternKey, isValid);
            }

            state[form].fields[name].validated = isValid;
          }

          if (hasPatterns && field.id === 'contact') {
            const currentFieldHasNoValue = isFieldEmpty(
              state.user_details.contact,
            );

            if (currentFieldHasNoValue) {
              resetOtherContactField(state);
            }
          }

          if (form === 'registration_search_form') {
            if (id === 'registration_number' && field.id === name) {
              const requireError =
                'Let’s start with your vehicle registration — pop it in so we can help you get your vehicle back to its best.';

              const { isValid: validPattern } = validatePattern(
                patterns,
                value,
              );

              if (hasNoValue && required) {
                updatedErrors.form = requireError;
              } else if (!hasNoValue && !validPattern) {
                updatedErrors.form =
                  'That vehicle registration doesn’t seem right. Please check and try again';
              } else {
                updatedErrors.form = '';
              }
            }
          }

          // Update errors only for the relevant field
          if (field.id === name) {
            updatedErrors[name] = errorMessage;
            updatedWarnings[name] = warningMessage;
          }
        });

        // Assign updated errors and validity status
        state[form].errors = updatedErrors;
        state[form].warnings = updatedWarnings;
        state[form].is_valid = allRequiredValid;

        if (form === 'damage_assessments_form') {
          // Flag to render the Quote Confirmation or Confirmation page
          state.skip_to_confirmation = validateDamageSelectedOptions(state);
          // Calculated quotation
          state.user_payment.quote = calculateQuote(state);
        }
      }
    },
    setOptionPrices: (state, action) => {
      // Live brand prices arrive from the pricing API after mount. Store them so
      // calculateQuote can read state.user_payment.option_prices, and recompute
      // immediately so a restored/persisted quote reflects current pricing.
      state.user_payment.option_prices = action.payload ?? {};
      state.user_payment.quote = calculateQuote(state);
    },
    setSearchResults: (state, action) => {
      state.search_results = action.payload;
    },
    clearLocationResults: (state) => {
      state.location_results = [];
      state.address_results = [];
    },
    clearAddressResults: (state) => {
      state.address_results = [];
    },
    clearSearchResults: (state) => {
      state.search_results = null;
    },
    confirmVehicleDetails: (state, action) => {
      const req = action.payload;

      if (req.status !== 'SUCCESS') {
        console.error('Error getting vehicle details');
        return;
      }

      const vehicle = req.vehicle;
      if (!vehicle) {
        console.error('No vehicle details provided');
        return;
      }

      const details = vehicle.details;
      const identification = vehicle.identification;

      if (!details || !identification) {
        console.error('No vehicle details and/or identification provided');
        return;
      }

      state.user_confirmed_vehicle_lookup = vehicle;

      state.user_confirmed_vehicle_detail = {
        vin: identification.vin,
        engine_number: details.engineNumber,
        body_type: details.bodyType,
        fuel_type: details.fuelType,
        colour: details.colour,
        year: details.year,
        make: details.make,
        model: details.model,
        vehicle_type: details.vehicleType,
      };
    },
    setEnquiryId: (state, action) => {
      state.user_details.enquiry_id = action.payload;
    },
    setUTK: (state, action) => {
      state.user_details.utk = action.payload;
    },
    setPaymentReceived: (state) => {
      state.user_booking.has_paid = true;
    },
    setBookingCreated: (state) => {
      state.user_booking.has_booked = true;
    },
    setVehicleParamLookupRedirect: (state, action) => {
      state.vehicle_lookup_param_redirect_to = action.payload;
    },
    setVehicleParamLookup: (state, action) => {
      state.user_vehicle_detail.registration_number =
        action.payload.registration;
      state.user_vehicle_detail.state = action.payload.registration_state;
      state.user_details.location = action.payload.location;
      state.user_details.location_postcode = action.payload.postcode;
    },
    setVehicleParamLookupDone: (state) => {
      state.vehicle_lookup_param_done = true;
    },
    setSelectedHomeAddress: (state, action) => {
      const {
        location,
        street_address,
        suburb,
        state: location_state,
        postcode,
        place_id,
        latitude,
        longitude,
      } = action.payload;

      state.user_details.home_address = location;
      state.user_details.home_street_address = street_address;
      state.user_details.home_suburb = suburb;
      state.user_details.home_state = location_state;
      state.user_details.home_postcode = postcode;
      state.user_details.home_place_id = place_id;
      state.user_details.home_longitude = longitude;
      state.user_details.home_latitude = latitude;
    },
    clearLocationGeocode: (state) => {
      state.user_details.location_postcode = '';
      state.user_details.location_place_id = '';
      state.user_details.location_latitude = '';
      state.user_details.location_longitude = '';
      state.user_details.location_suburb = '';
      state.user_details.location_state = '';
    },
    setDisableGeolocation: (state, action) => {
      state.disable_geolocation = action.payload.disable;
    },
    setSelectedAppointmentDate: (state, action) => {
      state.user_booking.service_appointment_date = action.payload
        ? action.payload.toLocaleString()
        : action.payload;
    },
    setSelectedAppointmentDateTime: (state, action) => {
      const {
        service_appointment_date,
        service_appointment_date_time_branch_index,
        service_appointment_date_time_page_index,
        service_appointment_date_time_day_index,
      } = action.payload;

      state.user_booking.service_appointment_date = service_appointment_date;
      state.user_booking.service_appointment_date_time_branch_index =
        service_appointment_date_time_branch_index;
      state.user_booking.service_appointment_date_time_page_index =
        service_appointment_date_time_page_index;
      state.user_booking.service_appointment_date_time_day_index =
        service_appointment_date_time_day_index;
    },
    toggleAppointmentOverlay: (state, action) => {
      state.appointment_overlay = action.payload;
    },
    setHomeAddressRequired: (state, action) => {
      state.user_form.fields.home_address.required = action.payload;
    },
    toggleAddressAutocomplete: (state, action) => {
      const autocompleteEnabled = action.payload;

      // If toggled, make the home_address invalid
      state.user_details.home_address_valid = false;

      // Clear autocomplete field;
      state.user_details.home_address = '';
      state.user_details.home_street_address = '';
      state.user_details.home_location = '';
      state.user_details.home_place_id = '';
      state.user_details.home_suburb = '';
      state.user_details.home_state = '';
      state.user_details.home_postcode = '';
      state.user_details.home_longitude = null;
      state.user_details.home_latitude = null;

      // Set global config for home address location field
      state.address_autocomplete = action.payload;

      // If autocomplete = true, make autocomplete field required
      state.user_form.fields.home_address.required = autocompleteEnabled;

      // If autocomplete = false, make manual fields required
      state.user_form.fields.home_street_address.required =
        !autocompleteEnabled;
      state.user_form.fields.home_state.required = !autocompleteEnabled;
      state.user_form.fields.home_suburb.required = !autocompleteEnabled;
      state.user_form.fields.home_postcode.required = !autocompleteEnabled;
    },
    setRepairerDisplayedDataKey: (state, action) => {
      state.repairer_displayed_data_key = action.payload;
    },
    setProgressIdentifier: (state, action) => {
      state.progress_uuid = action.payload;
    },
    setStateLoading: (state, action) => {
      state.state_loading = action.payload;
    },
    setOverlayConfiguration: (state, action) => {
      state.overlay = action.payload;
    },
  };
}

function createExtraReducers() {
  return (builder) => {
    // region Find Vehicle
    builder.addMatcher(
      vehicleAPIV2.endpoints.findVehicle.matchPending,
      handleFindVehiclePending,
    );
    builder.addMatcher(
      vehicleAPIV2.endpoints.findVehicle.matchFulfilled,
      handleFindVehicleFulfilled,
    );
    builder.addMatcher(
      vehicleAPIV2.endpoints.findVehicle.matchRejected,
      handleFindVehicleRejected,
    );
    // endregion
    // region Get Suburbs By Postcode
    builder.addMatcher(
      mapAPI.endpoints.getSuburbsByPostcode.matchPending,
      handleLocationPending,
    );
    builder.addMatcher(
      mapAPI.endpoints.getSuburbsByPostcode.matchFulfilled,
      handleLocationFulfilled,
    );
    builder.addMatcher(
      mapAPI.endpoints.getSuburbsByPostcode.matchRejected,
      handleLocationRejected,
    );
    // endregion
    // region Get Suburbs
    builder.addMatcher(
      mapAPI.endpoints.getSuburbs.matchPending,
      handleLocationPending,
    );
    builder.addMatcher(
      mapAPI.endpoints.getSuburbs.matchFulfilled,
      handleLocationFulfilled,
    );
    builder.addMatcher(
      mapAPI.endpoints.getSuburbs.matchRejected,
      handleLocationRejected,
    );
    // endregion
    // region Get Suburb By Coordinates
    builder.addMatcher(
      mapAPI.endpoints.getSuburbByCoordinates.matchPending,
      handleGeolocationPending,
    );
    builder.addMatcher(
      mapAPI.endpoints.getSuburbByCoordinates.matchFulfilled,
      handleGeolocationFulfilled,
    );
    builder.addMatcher(
      mapAPI.endpoints.getSuburbByCoordinates.matchRejected,
      handleGeolocationRejected,
    );
    // endregion
    // region Get Address
    builder.addMatcher(
      mapAPI.endpoints.getAddress.matchPending,
      handleAddressPending,
    );
    builder.addMatcher(
      mapAPI.endpoints.getAddress.matchFulfilled,
      handleAddressFulfilled,
    );
    builder.addMatcher(
      mapAPI.endpoints.getAddress.matchRejected,
      handleAddressRejected,
    );
    // endregion
    // region Get Geocode
    builder.addMatcher(
      mapAPI.endpoints.getGeocode.matchPending,
      handleGeolocationPending,
    );
    builder.addMatcher(
      mapAPI.endpoints.getGeocode.matchFulfilled,
      handleGeolocationFulfilled,
    );
    builder.addMatcher(
      mapAPI.endpoints.getGeocode.matchRejected,
      handleGeolocationRejected,
    );
    // endregion
    // region Get Repairers
    builder.addMatcher(
      vehicleAPIV2.endpoints.getRepairers.matchPending,
      handleBranchesPending,
    );
    builder.addMatcher(
      vehicleAPIV2.endpoints.getRepairers.matchFulfilled,
      handleBranchesFulfilled,
    );
    builder.addMatcher(
      vehicleAPIV2.endpoints.getRepairers.matchRejected,
      handleBranchesRejected,
    );
    // endregion
    // region SaveEnquiryProgress
    builder.addMatcher(
      enquiryAPIV2.endpoints.updateEnquiryProgress.matchPending,
      handleSaveEnquiryProgressPending,
    );
    builder.addMatcher(
      enquiryAPIV2.endpoints.updateEnquiryProgress.matchFulfilled,
      handleSaveEnquiryProgressFulfilled,
    );
    builder.addMatcher(
      enquiryAPIV2.endpoints.updateEnquiryProgress.matchRejected,
      handleSaveEnquiryProgressRejected,
    );
    builder.addMatcher(
      enquiryAPIV2.endpoints.saveEnquiryProgress.matchPending,
      handleSaveEnquiryProgressPending,
    );
    builder.addMatcher(
      enquiryAPIV2.endpoints.saveEnquiryProgress.matchFulfilled,
      handleSaveEnquiryProgressFulfilled,
    );
    builder.addMatcher(
      enquiryAPIV2.endpoints.saveEnquiryProgress.matchRejected,
      handleSaveEnquiryProgressRejected,
    );
    // endregion
    // region CreateSession
    builder.addMatcher(
      sessionAPI.endpoints.createSession.matchPending,
      handleCreateSessionPending,
    );
    builder.addMatcher(
      sessionAPI.endpoints.createSession.matchFulfilled,
      handleCreateSessionFulfilled,
    );
    builder.addMatcher(
      sessionAPI.endpoints.createSession.matchRejected,
      handleCreateSessionRejected,
    );
  };
}

export const bookingReducer = slice.reducer;
export const {
  setPropValue,
  validatePropValue,
  setOptionPrices,
  setSearchResults,
  clearLocationResults,
  clearSearchResults,
  confirmVehicleDetails,
  setEnquiryId,
  setUTK,
  setPaymentReceived,
  setVehicleParamLookupRedirect,
  setVehicleParamLookup,
  setVehicleParamLookupDone,
  setDisableGeolocation,
  setSelectedAppointmentDateTime,
  toggleAppointmentOverlay,
  setBookingCreated,
  setRepairerDisplayedDataKey,
  setSelectedAppointmentDate,
  toggleAddressAutocomplete,
  setSelectedHomeAddress,
  setHomeAddressRequired,
  setProgressIdentifier,
  setStateLoading,
  setOverlayConfiguration,
} = slice.actions;
