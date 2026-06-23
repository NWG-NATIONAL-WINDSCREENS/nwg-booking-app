import { EMAIL_REGEX, MOBILE_REGEX } from '../_common/constants/patterns.js';
import {
  findMostCommonTimes,
  formatDate,
  getDateObjectFromDateString,
  getDayOfWeekFromDate,
  parseCustomDate,
  generateOperatingHourOptions,
} from '../_utils/date-util.js';

// region Reducers - Validate Property
/**
 * Checks if the selected location exists in the available options and updates the state accordingly.
 * @param {object} state - The current state object.
 * @param form
 * @param prop
 * @param {string} value - The selected location value.
 */
export const updateLocationSelection = (state, form, prop, value) => {
  const options =
    form === 'user_form' ? state.address_results : state.location_results;

  if (options.length > 0) {
    state[form].fields[prop].has_selected_value = options.some(
      (option) => option.value === value,
    );
  } else {
    state[form].fields[prop].has_selected_value = false;
  }
};

/**
 * Updates the state for damage assessments based on the selected field and value.
 * @param {object} state - The current state object.
 * @param {string} prop - The field being updated (e.g., 'damage_type', 'damage', 'impact').
 * @param {any} value - The new value for the field.
 */
export const updateDamageAssessments = (state, prop, value) => {
  if (['damage_type'].includes(prop)) {
    updateDamageTypeRequirement(state, value);
  }

  if (['impact'].includes(prop)) {
    updateImpactRequirement(state, value);
  }

  if (['impact_location'].includes(prop)) {
    updateImpactLocationRequirement(state, value);
  }

  if (['issue_contact'].includes(prop)) {
    updateIssueContactRequirement(state, value);
  }

  if (
    [
      'damage',
      'damage_type',
      'impact',
      'impact_location',
      'contact',
      'issue_contact',
    ].includes(prop)
  ) {
    updateCallbackRequirements(state, prop, value);
  }

  if (prop === 'damage') {
    updateDamageRequirement(state, value);
  }

  if (prop === 'issue_contact' || prop === 'impact') {
    const required = value === 'callback' || value === 'bigger_than_2_coin';
    updateContactRequirements(state, required);
  }
};
/**
 * Updates the issue contact requirement based on selected damage properties.
 * Determines if contact details are required based on the selected values.
 *
 * @param {object} state - The current state object.
 * @param {string} prop - The field being updated (e.g., 'damage_type', 'damage', 'impact').
 * @param {any} value - The new value for the field.
 */
export const updateCallbackRequirements = (state, prop, value) => {
  const currentDamageType = state.user_vehicle_damage.damage_type;
  const currentDamage = state.user_vehicle_damage.damage;
  const currentImpact = state.user_vehicle_damage.impact;
  const currentImpactLocation = state.user_vehicle_damage.impact_location;

  const damageTypeValues = ['more_than_4_chips', 'crack'];
  const damageValues = [
    'right_side_window',
    'left_side_window',
    'rear_window',
    'other',
  ];
  const impactValues = ['bigger_than_2_coin'];
  const impactLocationValues = ['white_area'];

  const damageTypeMatched = damageTypeValues.includes(currentDamageType);
  const damageMatched = damageValues.includes(currentDamage);
  const impactMatched = impactValues.includes(currentImpact);
  const impactLocationMatched = impactLocationValues.includes(
    currentImpactLocation,
  );

  // Check if the newly set property requires an issue contact
  const isRequired =
    (prop === 'damage' && damageValues.includes(value)) ||
    (prop === 'damage_type' && damageTypeValues.includes(value)) ||
    (prop === 'impact' && impactValues.includes(value)) ||
    (prop === 'impact_location' && impactLocationValues.includes(value));

  if (isRequired) {
    state.user_details.issue_contact = 'callback';
  }

  const { user_details } = state;
  const { issue_contact, contact, contact_type } = user_details;
  const {
    first_name: first_name_field,
    last_name: last_name_field,
    other_contact: other_contact_field,
  } = state.damage_assessments_form.fields;

  const isContactCallback = issue_contact === 'callback';
  const mobileContactProvided = contact_type === 'mobile' && contact;

  // Validation to check whether the contact = email and issue_contact = call_nwg;
  const otherContactNotProvided =
    contact_type === 'email' && issue_contact === 'call_nwg';

  // Determine if contact details are required based on conditions
  const shouldRequireContact =
    (isRequired ||
      damageTypeMatched ||
      damageMatched ||
      impactMatched ||
      impactLocationMatched) &&
    isContactCallback;

  const otherContactRequired =
    shouldRequireContact && !mobileContactProvided && !otherContactNotProvided;

  first_name_field.required = shouldRequireContact;
  last_name_field.required = shouldRequireContact;
  other_contact_field.required = otherContactRequired;
};

/**
 * Updates damage-related requirements based on the selected damage type.
 *
 * @param {object} state - The current state object.
 * @param {string} value - The selected damage type.
 */
export const updateDamageRequirement = (state, value) => {
  const { user_vehicle_damage, damage_assessments_form } = state;

  const values = [
    'right_side_window',
    'left_side_window',
    'rear_window',
    'other',
  ];

  const clear = values.includes(value);

  if (clear) {
    user_vehicle_damage.damage_type = '';

    damage_assessments_form.fields.impact.required = false;
    damage_assessments_form.fields.impact_location.required = false;

    clearDamageAssessmentValues(state);
  }

  damage_assessments_form.fields.damage_type.required = ['windscreen'].includes(
    value,
  );
};

/**
 * Updates field requirements based on damage type field changes.
 *
 * @param {object} state - The current state object.
 * @param {string} value - The selected damage type.
 */
export const updateDamageTypeRequirement = (state, value) => {
  const { user_vehicle_damage, damage_assessments_form, user_details } = state;
  const repairable = ['chip', '2_chips', '3_chips'].includes(value);
  if (repairable) {
    user_details.issue_contact = '';
    damage_assessments_form.fields.impact.required = repairable;

    clearDamageAssessmentValues(state);
    clearContactDetails(state);
  }

  const callback = ['crack', 'more_than_4_chips'].includes(value);
  if (callback) {
    user_vehicle_damage.impact = '';
    user_vehicle_damage.impact_location = '';

    damage_assessments_form.fields.impact.required = false;
    damage_assessments_form.fields.impact_location.required = false;
    clearDamageAssessmentValues(state);
  }
};

/**
 * Updates impact requirement based on damage type.
 *
 * @param {object} state - The current state object.
 * @param {string} value - The selected damage type.
 */
export const updateImpactRequirement = (state, value) => {
  const { user_vehicle_damage, user_details, damage_assessments_form } = state;
  const values = ['smaller_than_2_coin'];
  const impactLocationRequired = values.includes(value);

  // Always clear if Impact is changed
  user_vehicle_damage.impact_location = '';
  user_details.issue_contact = '';
  damage_assessments_form.fields.impact_location.required =
    impactLocationRequired;

  clearContactDetails(state);
};

/**
 * Updates impact location requirement based on impact type.
 *
 * @param {object} state - The current state object.
 * @param {string} value - The selected damage type.
 */
export const updateImpactLocationRequirement = (state, value) => {
  const { user_details } = state;
  const values = ['green_area'];
  const matched = values.includes(value);
  if (matched) {
    user_details.issue_contact = '';
    clearContactDetails(state);
  }
};

/**
 * Updates contact field requirements based on whether contact details are needed.
 *
 * @param {object} state - The current state object.
 * @param {boolean} required - Whether the contact details should be required.
 */
export const updateContactRequirements = (state, required) => {
  const fields = state.damage_assessments_form.fields;
  fields.first_name.required = required;
  fields.last_name.required = required;
  fields.other_contact.required = required;
};

/**
 * Clear contact detail values
 *
 * @param {object} state - The current state object.
 * @param value
 */
export const updateIssueContactRequirement = (state, value) => {
  if (['call_nwg'].includes(value)) {
    clearContactDetails(state);
  }
};

/**
 * Clear damage assessment values
 *
 * @param {object} state - The current state object.
 */
export const clearDamageAssessmentValues = (state) => {
  const { user_vehicle_damage } = state;
  user_vehicle_damage.impact = '';
  user_vehicle_damage.impact_location = '';
};

/**
 * Clear contact detail values
 *
 * @param {object} state - The current state object.
 */
export const clearContactDetails = (state) => {
  const { user_details } = state;
  user_details.first_name = '';
  user_details.last_name = '';
  user_details.other_contact = '';
  user_details.preferred_time = '';
};

/**
 * Clear service appointment date time values
 *
 * @param {object} state - The current state object.
 */
export const clearServiceAppointmentDateTime = (state) => {
  state.user_booking.service_appointment = {};
};

/**
 * Retrieves the value of a field from the given state.
 *
 * @param {object} state - The current state object.
 * @param {string} objectName - The object name containing the field.
 * @param {string} name - The name of the field to retrieve.
 * @returns {any} - The value of the field.
 */
export const getFieldValue = (state, objectName, name) => {
  return objectName ? state[objectName]?.[name] : state[name];
};

/**
 * Checks if an object contains patterns.
 *
 * @param {object} patterns - The patterns object to check.
 * @returns {boolean} - Whether the patterns object is valid.
 */
export const checkPatterns = (patterns) =>
  patterns &&
  typeof patterns === 'object' &&
  Object.values(patterns).length > 0;

/**
 * Checks if a field value is empty.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - Whether the value is empty.
 */
export const isFieldEmpty = (value) =>
  value === null || value === undefined || value === '';

const looksLikeComTypo = (tld) => {
  // Normalize
  const normalized = tld.toLowerCase();

  // Exact match is fine
  if (normalized === 'com') return false;

  // 3–4 char TLDs that are "close" to com
  if (normalized.length >= 3 && normalized.length <= 4) {
    const comVariants = ['coom', 'cim', 'cmo', 'comm', 'con'];

    // Direct match
    if (comVariants.includes(normalized)) return true;

    // Generic pattern-based fallback
    if (
      normalized.startsWith('c') &&
      normalized.endsWith('m') &&
      normalized !== 'cam' && // avoid false positives
      normalized !== 'cum'
    ) {
      return true;
    }
  }

  return false;
};

export const looksSuspiciousEmail = (email) => {
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].toLowerCase();
  const domainParts = domain.split('.');

  if (domainParts.length < 2) return true;

  const tld = domainParts[domainParts.length - 1];

  // Very long TLDs (likely typo)
  if (tld.length > 6) return true;

  // Repeated characters (cooom, gmaill)
  if (/(.)\1{2,}/.test(tld)) return true;

  // Numeric-only TLDs are almost never valid
  if (/^\d+$/.test(tld)) return true;

  // Suspicious double dots or hyphens
  if (/(\.\.|--)/.test(domain)) return true;

  if (looksLikeComTypo(tld)) return true;

  return false;
};

/**
 * Validates a value against a set of patterns.
 *
 * @param {object} patterns - The patterns object.
 * @param {string} value - The value to validate.
 * @returns {object} - An object containing `isValid` and `matchedPatternKey`.
 */
export const validatePattern = (patterns, value) => {
  let matchedPatternKey = null;

  const isValid = Object.entries(patterns).some(([key, pattern]) => {
    if (new RegExp(pattern).test(value)) {
      matchedPatternKey = key;
      return true;
    }
    return false;
  });

  return { isValid, matchedPatternKey };
};

/**
 * Updates contact details on the payment details page for damage assessment forms
 *
 * @param {object} state - The current state object.
 * @param {string} form - The form identifier.
 * @param {any} value - The new value for the field.
 * @param {string} matchedPatternKey - The matched pattern key (e.g., 'email', 'mobile').
 * @param {boolean} isValid - The flag which indicates if the value is valid
 */
export const setContactDetails = (
  state,
  form,
  value,
  matchedPatternKey,
  isValid,
) => {
  const isEmail = matchedPatternKey === 'email';
  const contactField = isEmail ? 'email' : 'mobile';

  if (form === 'damage_assessments_form') {
    state.user_form.fields[contactField].validated = isValid;
    state.user_details[contactField] = isValid ? value : '';
    return;
  }

  if (form === 'payment_form') {
    const { contact, other_contact } = state.damage_assessments_form.fields;
    const { contact_type, other_contact_type } = state.user_details;

    if (contact_type === matchedPatternKey) {
      state.user_details.contact = isValid ? value : '';
      contact.validated = isValid;
    } else if (other_contact_type === matchedPatternKey) {
      state.user_details.other_contact = isValid ? value : '';
      other_contact.validated = isValid;
    }
  }
};

/**
 * Handles form reset upon changes on the contact field
 *
 * @param {object} state - The current state object.
 */
export const resetOtherContactField = (state) => {
  const { user_details, damage_assessments_form } = state;
  const { other_contact, other_contact_type, contact } = user_details;

  const isOtherContactEmail = other_contact && other_contact === 'email';
  const isOtherContactPhone = contact && other_contact_type === 'mobile';
  if (
    (isOtherContactEmail || isOtherContactPhone) &&
    isFieldEmpty(state.user_details.contact)
  ) {
    user_details.other_contact = null;
  }

  Object.assign(damage_assessments_form.fields.other_contact, {
    label: 'Phone number',
    validation_message:
      'Invalid format. Please enter a valid mobile phone number.',
    patterns: { mobile: MOBILE_REGEX },
  });
};

/**
 * Updates the contact field label and validation messages based on matched pattern.
 *
 * @param {object} state - The current state object.
 * @param {string} form - The form identifier.
 * @param {object} field - The field metadata
 * @param {any} value - The new value for the field.
 * @param {string} matchedPatternKey - The matched pattern key (e.g., 'email', 'mobile').
 */
export const updateContactField = (
  state,
  form,
  field,
  value,
  matchedPatternKey,
) => {
  const isEmail = matchedPatternKey === 'email';
  const { user_details } = state;
  user_details[`${field.id}_type`] = matchedPatternKey;

  if (field.id === 'contact') {
    const { contact_type, other_contact_type, issue_contact } = user_details;

    const hasSameContactType =
      (contact_type === 'email' && other_contact_type === 'email') ||
      (contact_type === 'mobile' && other_contact_type === 'mobile');

    if (hasSameContactType) {
      user_details.other_contact = null;
    }
    user_details.other_contact_type = isEmail ? 'mobile' : 'email';

    state[form].errors.other_contact = '';
    user_details[isEmail ? 'mobile' : 'email'] = '';

    // Validation to check whether the contact = email and issue_contact = call_nwg;
    const otherContactRequired =
      issue_contact === 'callback' && contact_type === 'email';

    Object.assign(state[form].fields.other_contact, {
      label: isEmail ? 'Phone number' : 'Email address',
      validation_message: isEmail
        ? 'Invalid format. Please enter a valid mobile phone number.'
        : 'Invalid format. Please enter a valid email address.',
      patterns: isEmail ? { mobile: MOBILE_REGEX } : { email: EMAIL_REGEX },
      required: otherContactRequired,
    });
  }

  if (field.id === 'other_contact') {
    user_details.contact_type = isEmail ? 'mobile' : 'email';
  }
};
/**
 * Updates the state for payment forms based on the selected field and value.
 *
 * @param {object} state - The current state object.
 * @param {any} value - The new value for the field.
 */
export const updatePaymentSelection = (state, value) => {
  const isRequired = value === 'insurance';
  const { insurer } = state.user_form.fields;
  insurer.required = isRequired;

  if (!isRequired) {
    state.user_details.claim_number = null;
    state.user_details.insurer = null;
    state.user_details.policy_number = null;
  }
};

/**
 * Validates selected options on Damage Assessment form
 *
 * @param {object} state - The current state object.
 * @returns {boolean} - Flag for rendering Quote Confirmation or Confirmation page
 */
export const validateDamageSelectedOptions = (state) => {
  const { issue_contact } = state.user_details;
  return ['call_nwg', 'callback'].includes(issue_contact);
};

/**
 * Calculates the quote based on Damage Assessment form selection
 *
 * @param {object} state - The current state object.
 * @returns {number} - The calculated quote
 */
export const calculateQuote = (state) => {
  const { damage, damage_type, impact, impact_location } =
    state.user_vehicle_damage;

  const damageMatched = 'windscreen' === damage;
  const damageTypeMatched = ['chip', '2_chips', '3_chips'].includes(
    damage_type,
  );
  const impactMatched = 'smaller_than_2_coin' === impact;
  const impactLocationMatched = 'green_area' === impact_location;

  // https://ideascience.atlassian.net/browse/NW458-205
  // Live brand-specific price, mirrored into booking state from the pricing API
  // (see setOptionPrices). Read from state because calculateQuote runs inside a
  // reducer, where store.getState() is illegal.
  const quote = state.user_payment.option_prices?.[damage_type] ?? 0;

  if (
    damageMatched &&
    damageTypeMatched &&
    impactMatched &&
    impactLocationMatched
  ) {
    return quote;
  } else {
    return 0;
  }
};
// endregion
// region Reducers - Find Vehicle
export const handleFindVehiclePending = (state) => {
  state.registration_search_form.errors.form = '';
};
export const handleFindVehicleFulfilled = (state, action) => {
  const { status } = action.payload;

  if (status === 'NO_MATCH') {
    state.registration_search_form.errors.form =
      "We couldn't find a match for that registration number. Please check and try again.";
  } else {
    state.registration_search_form.errors.registration_number = '';
  }
};
export const handleFindVehicleRejected = (state) => {
  state.registration_search_form.errors.form =
    "We couldn't find a match for that registration number. Please check and try again.";
};
// endregion
// region Reducers - Location - Suburb/Postcode
export const handleLocationPending = (state) => {
  state.location_loading = true;
  state.location_results = [];
  state.registration_search_form.fields.location.options = [];
  state.booking_form.fields.location.options = [];
};
export const handleLocationFulfilled = (state, action) => {
  state.location_loading = false;

  const { status, options = [] } = action.payload;

  if (status === 'ERROR') {
    const message = `That postcode doesn’t seem right. Please check and let’s keep rolling.`;

    state.registration_search_form.errors.location = message;
    state.booking_form.errors.location = message;

    state.repairers_results = [];
  } else {
    state.registration_search_form.errors.location =
      'Click the postcode field, and pick your suburb from the list so we can tailor the search to you';
    state.booking_form.errors.location = '';

    state.location_results = options;
    state.registration_search_form.fields.location.options = options;
    state.booking_form.fields.location.options = options;
  }
};
export const handleLocationRejected = (state) => {
  state.location_loading = false;
  state.location_results = [];
  state.registration_search_form.fields.location.options = [];
  state.booking_form.fields.location.options = [];

  const message = `That postcode doesn’t seem right. Please check and let’s keep rolling.`;
  state.registration_search_form.errors.location = message;
  state.booking_form.errors.location = message;

  state.repairers_results = [];
};
// endregion
// region Reducers - Home Address
export const handleAddressPending = (state) => {
  state.address_loading = true;
  state.address_results = [];
  state.user_form.fields.home_address.options = [];
};
export const handleAddressFulfilled = (state, action) => {
  state.address_loading = false;

  const { status, options = [] } = action.payload;

  if (status === 'ERROR') {
    state.user_form.errors.form =
      'That address’s puzzling us. Double-check it and let’s keep rolling.';
  } else {
    state.address_results = options;
    state.user_form.fields.home_address.options = options;
    // state.user_form.errors.form = '';
  }
};
export const handleAddressRejected = (state) => {
  state.address_loading = false;
  state.address_results = [];
  state.user_form.fields.home_address.options = [];

  state.user_form.errors.form =
    'That address’s puzzling us. Double-check it and let’s keep rolling.';
};

// endregion
// region Reducers - Geolocation - Coordinates
export const handleGeolocationPending = (state, action) => {
  state.location_loading = true;

  const locationType =
    action.meta?.arg?.originalArgs?.locationType || 'customer';

  if (locationType === 'repairer') {
    state.user_details.location = '';
    state.user_details.location_place_id = '';
    state.user_details.location_address = '';
    state.user_details.location_street_address = '';
    state.user_details.location_latitude = null;
    state.user_details.location_longitude = null;
    state.user_details.location_postcode = '';
    state.user_details.location_state = '';
    state.user_details.location_suburb = '';
  }

  if (locationType === 'customer') {
    state.user_details.home_street_address = '';
    state.user_details.home_location = '';
    state.user_details.home_place_id = '';
    state.user_details.home_suburb = '';
    state.user_details.home_state = '';
    state.user_details.home_postcode = '';
    state.user_details.home_longitude = null;
    state.user_details.home_latitude = null;
  }
};
export const handleGeolocationFulfilled = (state, action) => {
  state.location_loading = false;

  const {
    status,
    location,
    place_id,
    address,
    street_address,
    suburb,
    state: location_state,
    postcode,
    latitude,
    longitude,
    error,
  } = action.payload;

  const locationType =
    action.meta?.arg?.originalArgs.locationType || 'customer';

  if (status === 'ERROR') {
    state.user_form.errors.form = error;
    return;
  }

  if (locationType === 'repairer') {
    state.user_details.location = location;
    state.user_details.location_place_id = place_id;
    state.user_details.location_address = address;
    state.user_details.location_street_address = street_address;
    state.user_details.location_latitude = latitude;
    state.user_details.location_longitude = longitude;
    state.user_details.location_postcode = postcode;
    state.user_details.location_state = location_state;
    state.user_details.location_suburb = suburb;

    state.registration_search_form.errors.location = '';
    state.booking_form.errors.location = '';

    if (state.user_booking.service_appointment && !state.from_saved_state) {
      state.user_booking.service_appointment = {};
    }

    // Clear to avoid issues with location states
    state.from_saved_state = false;
  }

  if (['customer', 'customer_manual'].includes(locationType)) {
    if (locationType === 'customer') {
      state.user_details.home_street_address = street_address;
    }

    state.user_details.home_location = location;
    state.user_details.home_place_id = place_id;
    state.user_details.home_suburb = suburb;
    state.user_details.home_state = location_state;
    state.user_details.home_postcode = postcode;
    state.user_details.home_longitude = longitude;
    state.user_details.home_latitude = latitude;

    if (state.user_booking.service_appointment) {
      const distance = getDistanceKm(
        latitude,
        longitude,
        state.user_booking.service_appointment.latitude,
        state.user_booking.service_appointment.longitude,
      );

      const is_valid = distance <= 50;
      state.user_details.home_address_distance_from_repairer_in_km = distance;
      state.user_details.home_address_valid = is_valid;

      // Clear form error if valid distance
      state.user_form.errors.form = is_valid
        ? ''
        : ` You're just outside our mobile service range — but we've got you covered. We recommend booking at your nearest service centre, where the same great care is ready and waiting`;
    }
  }
};
export const handleGeolocationRejected = (state) => {
  state.location_loading = false;
  state.user_details.location = '';
  state.user_details.location_latitude = '';
  state.user_details.location_longitude = '';

  state.user_form.errors.form = `We had trouble finding your location. Mind checking your address and giving it another go?`;
};
// endregion
// region Reducers - Repairers
export const handleBranchesPending = (state) => {
  state.repairers_loading = true;
  state.repairers_results = [];
};
export const handleBranchesFulfilled = (state, action) => {
  state.repairers_loading = false;

  const { status, branches = [], min_date, max_date, error } = action.payload;

  if (status === 'ERROR') {
    state.booking_form.errors.service_appointment = error;
  } else {
    state.booking_form.errors.service_appointment = '';
    state.repairers_results = setOptions(branches, min_date, max_date);
  }
};
export const handleBranchesRejected = (state) => {
  state.repairers_loading = false;
  state.repairers_results = [];
  state.booking_form.errors.service_appointment = 'No branches found';
};
// endregion
// region Reducers - Repairers
export const handleSaveEnquiryProgressPending = (state) => {
  state.enquiry_progress_loading = true;
};
export const handleSaveEnquiryProgressFulfilled = (state) => {
  state.enquiry_progress_loading = false;
};
export const handleSaveEnquiryProgressRejected = (state) => {
  state.enquiry_progress_loading = false;
};
// endregion
// region Reducers - Create Session
export const handleCreateSessionPending = (state) => {
  state.session_loading = true;
};
export const handleCreateSessionFulfilled = (state) => {
  state.session_loading = false;
};
export const handleCreateSessionRejected = (state) => {
  state.session_loading = false;
};
// endregion
// region Functions - Appointment Datetime Option Generation
const setOptions = (branches, min_date, max_date) => {
  if (branches.length === 0) {
    return {
      branches,
    };
  }

  const initialBookingDates = createInitialBookingDateObject(max_date);
  const destinations = [];

  branches.map((branch, index) => {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    branch.name = `${index + 1} ${branch.name}`;

    destinations.push({
      coordinates: `${branch.latitude},${branch.longitude}`,
      place_id: branch.place_id,
      name: branch.name,
      address: branch.address,
      travel_distance: branch.travel_distance,
      distance_text: branch.distance_text,
      repairer_id: branch.repairer_id,
    });

    const dateOptions = [];

    if (!branch.operating_hours_unavailable) {
      Object.keys(initialBookingDates).forEach((date) => {
        const bookingDates = { ...initialBookingDates, ...branch.bookings };

        const dayOfWeek = getDayOfWeekFromDate(date);

        const day = days[dayOfWeek];
        const dayHours = branch.operating_hours?.[day];

        const { mostCommonStart, mostCommonEnd } = findMostCommonTimes(
          branch.operating_hours,
        );

        const minDate = getDateObjectFromDateString(min_date);

        const isDisabled = dayHours === null;
        const { start, end } = dayHours || {};

        const formattedDate = formatDate(date);
        const options = generateOperatingHourOptions({
          minDate,
          branch,
          startTime: start ?? mostCommonStart,
          endTime: end ?? mostCommonEnd,
          date: formattedDate,
          bookings: bookingDates[date],
          disabled: isDisabled,
        });

        dateOptions.push({
          day,
          date: date,
          label: parseCustomDate(date),
          options,
        });
      });
    }
    branch.paginated_date_options = paginate(dateOptions, 6);
    branch.paginated_date_options_sm = paginate(dateOptions, 4);
    branch.at_home_paginated_date_options = paginate(dateOptions, 3);
    branch.at_home_paginated_date_options_sm = paginate(dateOptions, 2);
  });

  return {
    branches,
    destinations,
    min_date,
    max_date,
  };
};
const createInitialBookingDateObject = (maxDate) => {
  // eslint-disable-next-line no-undef
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const bookings_by_date_empty = {};

  const now = new Date();

  // Offset into Sydney timezone
  const [day, month, year] = formatter.format(now).split('/');
  let current = new Date(`${year}-${month}-${day}T00:00:00+10:00`);

  current.setDate(current.getDate() + 1); // Move one day ahead

  const dayOfWeek = current.getDay();

  let startDate = new Date(current);

  if (dayOfWeek >= 2 && dayOfWeek <= 6) {
    // Tuesday-Saturday: go back to previous Monday
    const daysBackToMonday = dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysBackToMonday);
  } else if (dayOfWeek === 0) {
    // Sunday: go forward to next Monday
    startDate.setDate(startDate.getDate() + 1);
  }
  // Monday: no adjustment

  const workingDate = new Date(startDate);

  // Parse maxDate in dd/mm/yyyy format into a Date object
  const maxDateObj = getDateObjectFromDateString(maxDate);

  while (workingDate <= maxDateObj) {
    if (workingDate.getDay() !== 0) {
      // Skip Sundays
      const formatted = formatter.format(workingDate);
      bookings_by_date_empty[formatted] = {};
    }

    workingDate.setDate(workingDate.getDate() + 1);
  }

  return bookings_by_date_empty;
};
const paginate = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    const week = array.slice(i, i + size);
    const service_centre_options_disabled = week.every((day) =>
      day.options
        .filter((opt) => opt.service_location === 'service_centre')
        .every((opt) => opt.disabled),
    );
    const home_options_disabled = week.every((day) =>
      day.options
        .filter((opt) => opt.service_location === 'at_home')
        .every((opt) => opt.disabled),
    );

    result.push({
      week,
      service_centre_options_disabled,
      home_options_disabled,
    });
  }
  return result;
};
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
// endregion
