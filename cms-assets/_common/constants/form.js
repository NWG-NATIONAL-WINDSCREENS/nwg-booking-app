export const RegistrationForm = {
  warnings: {},
  errors: {},
  fields: {
    registration_number: {
      required: true,
      label: 'Registration Number',
      id: 'registration_number',
      object_name: 'user_vehicle_detail',
      patterns: {
        registration:
          '^([A-Z]{3}-\\d{3}|\\d{3}-[A-Z]{3}|[A-Z0-9]{1,7}|T\\d{5}|\\d{5}T)$',
      },
      validated: false,
      validation_message:
        'That vehicle registration doesn’t seem right. Please check and try again.',
    },
    state: {
      required: true,
      label: 'State',
      id: 'state',
      object_name: 'user_vehicle_detail',
    },
    location: {
      required: false,
      label: 'Postcode or Suburb',
      id: 'location',
      object_name: 'user_details',
      options: [],
      // Flag for option selected value
      has_selected_value: false,
      validation_message: '',
    },
  },
};
export const DamageAssessmentForm = {
  warnings: {},
  errors: {},
  fields: {
    damage: {
      required: true,
      id: 'damage',
      label: 'Where is the damage?',
      object_name: 'user_vehicle_damage',
    },
    date_of_damage: {
      required: false,
      id: 'date_of_damage',
      label: 'Estimated Date of Damage:',
      object_name: 'user_vehicle_damage',
    },
    cause_of_damage: {
      required: false,
      id: 'cause_of_damage',
      label: 'Estimated Cause of Damage:',
      object_name: 'user_vehicle_damage',
    },
    damage_type: {
      required: false,
      id: 'damage_type',
      label: 'What is the damage?',
      object_name: 'user_vehicle_damage',
    },
    impact: {
      required: false,
      id: 'impact',
      label: 'How big is the damage?',
      object_name: 'user_vehicle_damage',
    },
    impact_location: {
      required: false,
      id: 'impact_location',
      label: 'Where is the chip?',
      description:
        'If the chip is in the green area, we should be able to repair it. Otherwise the windscreen will need to be replaced.',
      object_name: 'user_vehicle_damage',
    },
    issue_contact: {
      required: false,
      id: 'issue_contact',
      label: `Have an issue? Let's talk!`,
      object_name: 'user_details',
    },
    contact: {
      required: true,
      label: 'Please enter your email',
      id: 'contact',
      has_validation: false,
      patterns: {
        email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      validated: false,
      validation_message:
        'That email address looks incorrect, please check and try again',
      object_name: 'user_details',
    },
    first_name: {
      required: false,
      id: 'first_name',
      label: 'First name:',
      object_name: 'user_details',
    },
    last_name: {
      required: false,
      id: 'last_name',
      label: 'Last name:',
      object_name: 'user_details',
    },
    other_contact: {
      required: false,
      id: 'other_contact',
      label: 'Phone number:',
      patterns: {
        mobile: '^(?:\\+61[ ]?|0)(?:4\\d{8}|2\\d{8}|3\\d{8}|7\\d{8}|8\\d{8})$',
      },
      validated: false,
      validation_message: 'Invalid format. Please enter a valid phone number',
      object_name: 'user_details',
    },
    preferred_time: {
      required: false,
      id: 'preferred_time',
      label: 'Select preferred time',
      object_name: 'user_details',
    },
  },
};
export const PaymentForm = {
  warnings: {},
  errors: {},
  fields: {
    payment_type: {
      required: false,
      id: 'payment_type',
      label: `How will you be paying?`,
      object_name: 'user_details',
    },
  },
};
export const BookingForm = {
  warnings: {},
  errors: {},
  fields: {
    location: {
      required: true,
      label: 'Postcode or Suburb',
      id: 'location',
      object_name: 'user_details',
      options: [],
      // Flag for option selected value
      has_selected_value: false,
      validation_message: '',
    },
    service_location: {
      required: false,
      id: 'service_location',
      label: `Service Location`,
      object_name: 'user_booking',
    },
    service_appointment_date: {
      required: false,
      id: 'service_appointment_date',
      object_name: 'user_booking',
    },
    service_appointment: {
      required: true,
      id: 'service_appointment',
      object_name: 'user_booking',
    },
  },
};
export const UserDetailsForm = {
  warnings: {},
  errors: {},
  fields: {
    payment_type: {
      required: false,
      id: 'payment_type',
      label: `How will you be paying?`,
      object_name: 'user_details',
    },
    first_name: {
      required: true,
      id: 'first_name',
      label: 'First name:',
      object_name: 'user_details',
    },
    last_name: {
      required: true,
      id: 'last_name',
      label: 'Last name:',
      object_name: 'user_details',
    },
    home_address: {
      required: false,
      label: 'Address',
      id: 'home_address',
      object_name: 'user_details',
      options: [],
      // Flag for option selected value
      has_selected_value: false,
      validation_message: '',
    },
    home_street_address: {
      required: false,
      id: 'home_street_address',
      label: 'Street Address:',
      object_name: 'user_details',
    },
    home_suburb: {
      required: false,
      id: 'home_suburb',
      label: 'Suburb:',
      object_name: 'user_details',
    },
    home_state: {
      required: false,
      id: 'home_state',
      label: 'State:',
      object_name: 'user_details',
    },
    home_postcode: {
      required: false,
      id: 'home_postcode',
      label: 'Postcode:',
      object_name: 'user_details',
      patterns: {
        home_postcode: '^[0-9]{4}$',
      },
      validation_message: 'Invalid postcode. Please check and try again.',
    },
    email: {
      required: true,
      label: 'Email:',
      id: 'email',
      has_validation: false,
      patterns: {
        email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      validated: true,
      validation_message: 'Invalid format. Please enter a valid email address',
      object_name: 'user_details',
    },
    mobile: {
      required: true,
      id: 'mobile',
      label: 'Phone:',
      patterns: {
        mobile: '^(?:\\+61[ ]?|0)(?:4\\d{8}|2\\d{8}|3\\d{8}|7\\d{8}|8\\d{8})$',
      },
      validated: false,
      validation_message:
        'Invalid format. Please enter a valid mobile phone number',
      object_name: 'user_details',
    },

    insurer: {
      required: false,
      label: 'Select your insurer:',
      id: 'insurer',
      object_name: 'user_details',
    },
    policy_number: {
      required: false,
      label: 'Policy number:',
      id: 'policy_number',
      object_name: 'user_details',
      patterns: {
        policy: '^[a-zA-Z0-9]+$',
      },
      validation_message: 'Invalid format. Please enter a valid policy number',
    },
    claim_number: {
      required: false,
      label: 'Claim number:',
      id: 'claim_number',
      object_name: 'user_details',
      patterns: {
        claim: '^[a-zA-Z0-9]+$',
      },
      validation_message: 'Invalid format. Please enter a valid claim number',
    },
    terms: {
      id: 'terms',
      required: true,
      label:
        'By proceeding, you confirm you have accepted our Terms and Conditions and Privacy Policy.',
      object_name: 'user_details',
    },
  },
};
