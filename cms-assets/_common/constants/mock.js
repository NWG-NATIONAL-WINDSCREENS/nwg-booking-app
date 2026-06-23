export const MockVehicleDetails = {
  vehicle: {
    identification: {
      plate: 'RBS07',
      state: 'VIC',
      vin: 'JMFLDHA3WCU000232',
    },
    details: {
      year: 2021,
      compliancePlate: '2021-06',
      make: 'Mitsubishi',
      model: 'i-MiEV',
      modelYear: 'MY12',
      series: 'GB',
      colour: 'RED',
      engineNumber: 'ENGRBS07',
      vehicleType: 'CAR / SMALL PASSENGER VEHICLE',
      bodyType: 'Hatchback',
      fuelType: 'Electric',
      transmission: 'Reduction Gear',
      driveType: 'Rear Wheel Drive',
      doors: 5,
      seats: 4,
    },
    specifications: {
      adaptiveSpeedLimiter: 'NOT_AVAILABLE',
      automaticHeadLamps: 'STANDARD',
      informationDisplayHeadUp: 'NOT_AVAILABLE',
      cruiseControlDistanceControl: 'NOT_AVAILABLE',
      cruiseControlLeadVehicleStartActiveAssist: 'NOT_AVAILABLE',
      cruiseControlLeadVehicleStartAlert: 'NOT_AVAILABLE',
      cruiseControlBrakeFunction: 'NOT_AVAILABLE',
      lowSpeedOffRoad: 'NOT_AVAILABLE',
      speedZoneReminder: 'NOT_AVAILABLE',
      blindSpotSensor: 'NOT_AVAILABLE',
      blindSpotActiveAssist: 'NOT_AVAILABLE',
      cameraFrontVision: 'NOT_AVAILABLE',
      cameraRearVision: 'NOT_AVAILABLE',
      cameraSideVision: 'NOT_AVAILABLE',
      collisionMitigationEmergencySteering: 'NOT_AVAILABLE',
      collisionMitigationForwardHighSpeed: 'NOT_AVAILABLE',
      collisionMitigationForwardLowSpeed: 'NOT_AVAILABLE',
      collisionMitigationPostCollision: 'NOT_AVAILABLE',
      collisionMitigationReverse: 'NOT_AVAILABLE',
      collisionMitigationVRU: 'NOT_AVAILABLE',
      collisionWarningForward: 'NOT_AVAILABLE',
      collisionWarningRearward: 'NOT_AVAILABLE',
      collisionWarningVRU: 'NOT_AVAILABLE',
      controlParkDistanceFront: 'NOT_AVAILABLE',
      controlParkDistanceRear: 'NOT_AVAILABLE',
      controlParkDistanceSide: 'NOT_AVAILABLE',
      controlPedestrianAvoidance: 'NOT_AVAILABLE',
      crossTrafficAlertFront: 'NOT_AVAILABLE',
      driverAttentionDetection: 'NOT_AVAILABLE',
      laneDeparturePassiveSteeringAssist: 'NOT_AVAILABLE',
      laneDepartureWarning: 'NOT_AVAILABLE',
      laneKeepActiveAssist: 'NOT_AVAILABLE',
      parkingAssistGraphicalDisplay: 'NOT_AVAILABLE',
      parkingAssistAutomatedSteering: 'NOT_AVAILABLE',
      parkingAssistFullyAutomated: 'NOT_AVAILABLE',
      parkingAssistTrailerReversing: 'NOT_AVAILABLE',
      sideDoorExitWarning: 'NOT_AVAILABLE',
      driverFatigueWarning: 'NOT_AVAILABLE',
      rainSensorAutoWipers: 'NOT_AVAILABLE',
      rearCrossTrafficReversingWarning: 'NOT_AVAILABLE',
      rearSeatOccupancyWarning: 'NOT_AVAILABLE',
      roadSignDisplayWarning: 'NOT_AVAILABLE',
      camerasADASOnly: 'NOT_AVAILABLE',
    },
  },
  status: 'SUCCESS',
};
export const MockPostalCodeDetails = {
  results: [
    {
      address_components: [
        {
          long_name: '3084',
          short_name: '3084',
          types: ['postal_code'],
        },
        {
          long_name: 'Banyule',
          short_name: 'Banyule',
          types: ['locality', 'political'],
        },
        {
          long_name: 'Banyule City',
          short_name: 'Banyule',
          types: ['administrative_area_level_2', 'political'],
        },
        {
          long_name: 'Victoria',
          short_name: 'VIC',
          types: ['administrative_area_level_1', 'political'],
        },
        {
          long_name: 'Australia',
          short_name: 'AU',
          types: ['country', 'political'],
        },
      ],
      formatted_address: 'Banyule VIC 3084, Australia',
      geometry: {
        bounds: {
          northeast: {
            lat: -37.7269902,
            lng: 145.108895,
          },
          southwest: {
            lat: -37.770467,
            lng: 145.0510189,
          },
        },
        location: {
          lat: -37.7436031,
          lng: 145.0769045,
        },
        location_type: 'APPROXIMATE',
        viewport: {
          northeast: {
            lat: -37.7269902,
            lng: 145.108895,
          },
          southwest: {
            lat: -37.770467,
            lng: 145.0510189,
          },
        },
      },
      place_id: 'ChIJyyLszdZF1moREDcuRnhWBBw',
      postcode_localities: [
        'Eaglemont',
        'Heidelberg',
        'Ivanhoe East',
        'Rosanna',
        'Viewbank',
      ],
      types: ['postal_code'],
    },
  ],
  status: 'OK',
};
export const MockPlacesAPISuburb = {
  predictions: [
    {
      description: 'Richmond VIC, Australia',
      matched_substrings: [
        {
          length: 8,
          offset: 0,
        },
      ],
      place_id: 'ChIJRbmNAVlC1moREOiMIXVWBAU',
      reference: 'ChIJRbmNAVlC1moREOiMIXVWBAU',
      structured_formatting: {
        main_text: 'Richmond',
        main_text_matched_substrings: [
          {
            length: 8,
            offset: 0,
          },
        ],
        secondary_text: 'VIC, Australia',
      },
      terms: [
        {
          offset: 0,
          value: 'Richmond',
        },
        {
          offset: 9,
          value: 'VIC',
        },
        {
          offset: 14,
          value: 'Australia',
        },
      ],
      types: ['locality', 'political', 'geocode'],
    },
    {
      description: 'Richmond NSW, Australia',
      matched_substrings: [
        {
          length: 8,
          offset: 0,
        },
      ],
      place_id: 'ChIJpb4cx2mdEmsRcMgyFmh9AQU',
      reference: 'ChIJpb4cx2mdEmsRcMgyFmh9AQU',
      structured_formatting: {
        main_text: 'Richmond',
        main_text_matched_substrings: [
          {
            length: 8,
            offset: 0,
          },
        ],
        secondary_text: 'NSW, Australia',
      },
      terms: [
        {
          offset: 0,
          value: 'Richmond',
        },
        {
          offset: 9,
          value: 'NSW',
        },
        {
          offset: 14,
          value: 'Australia',
        },
      ],
      types: ['political', 'geocode', 'locality'],
    },
    {
      description: 'Richmond TAS, Australia',
      matched_substrings: [
        {
          length: 8,
          offset: 0,
        },
      ],
      place_id: 'ChIJA_Id8dULbqoRcAve0E3JAwQ',
      reference: 'ChIJA_Id8dULbqoRcAve0E3JAwQ',
      structured_formatting: {
        main_text: 'Richmond',
        main_text_matched_substrings: [
          {
            length: 8,
            offset: 0,
          },
        ],
        secondary_text: 'TAS, Australia',
      },
      terms: [
        {
          offset: 0,
          value: 'Richmond',
        },
        {
          offset: 9,
          value: 'TAS',
        },
        {
          offset: 14,
          value: 'Australia',
        },
      ],
      types: ['geocode', 'locality', 'political'],
    },
    {
      description: 'Richmond SA, Australia',
      matched_substrings: [
        {
          length: 8,
          offset: 0,
        },
      ],
      place_id: 'ChIJ19k92IHPsGoRcL6OYlQ2AwU',
      reference: 'ChIJ19k92IHPsGoRcL6OYlQ2AwU',
      structured_formatting: {
        main_text: 'Richmond',
        main_text_matched_substrings: [
          {
            length: 8,
            offset: 0,
          },
        ],
        secondary_text: 'SA, Australia',
      },
      terms: [
        {
          offset: 0,
          value: 'Richmond',
        },
        {
          offset: 9,
          value: 'SA',
        },
        {
          offset: 13,
          value: 'Australia',
        },
      ],
      types: ['political', 'geocode', 'locality'],
    },
    {
      description: 'Richmond QLD, Australia',
      matched_substrings: [
        {
          length: 8,
          offset: 0,
        },
      ],
      place_id: 'ChIJc-0qD_20L2oRoGwgf_HuAAQ',
      reference: 'ChIJc-0qD_20L2oRoGwgf_HuAAQ',
      structured_formatting: {
        main_text: 'Richmond',
        main_text_matched_substrings: [
          {
            length: 8,
            offset: 0,
          },
        ],
        secondary_text: 'QLD, Australia',
      },
      terms: [
        {
          offset: 0,
          value: 'Richmond',
        },
        {
          offset: 9,
          value: 'QLD',
        },
        {
          offset: 14,
          value: 'Australia',
        },
      ],
      types: ['locality', 'political', 'geocode'],
    },
  ],
  status: 'OK',
};
export const MockLocationOptions = [
  {
    id: 0,
    value: 'Gladstone Park VIC',
  },
  {
    id: 1,
    value: 'Gowanbrae VIC',
  },
  {
    id: 2,
    value: 'Jacana VIC',
  },
  {
    id: 3,
    value: 'Tullamarine VIC',
  },
];
export const MockLocationOptions_2 = [
  {
    id: 0,
    value: 'Attwood VIC',
  },
  {
    id: 1,
    value: 'Broadmeadows VIC',
  },
  {
    id: 2,
    value: 'Westmeadows VIC',
  },
];
export const MockBranchesByPostcode = {
  status: 'SUCCESS',
  data: {
    branches: [
      {
        branch_id: '41270147519',
        repairer_id: 'f0d2f236d809178dddc5f9f1cc00809d',
        name: 'After Hours VIC Metro',
        operating_hours: {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null,
        },
        operating_hours_unavailable: true,
        address: null,
        google_address: '',
        bookings: {
          '17/04/2025': {},
          '18/04/2025': {},
          '19/04/2025': {},
          '20/04/2025': {},
          '21/04/2025': {},
          '22/04/2025': {},
          '23/04/2025': {},
          '24/04/2025': {},
          '25/04/2025': {},
          '26/04/2025': {},
          '27/04/2025': {},
          '28/04/2025': {},
          '29/04/2025': {},
          '30/04/2025': {},
          '01/05/2025': {},
          '02/05/2025': {},
          '03/05/2025': {},
          '04/05/2025': {},
          '05/05/2025': {},
          '06/05/2025': {},
          '07/05/2025': {},
          '08/05/2025': {},
          '09/05/2025': {},
          '10/05/2025': {},
          '11/05/2025': {},
          '12/05/2025': {},
          '13/05/2025': {},
          '14/05/2025': {},
          '15/05/2025': {},
          '16/05/2025': {},
          '17/05/2025': {},
          '18/05/2025': {},
          '19/05/2025': {},
          '20/05/2025': {},
          '21/05/2025': {},
          '22/05/2025': {},
          '23/05/2025': {},
          '24/05/2025': {},
        },
      },
      {
        branch_id: '40776607200',
        repairer_id: 'bca9be870ae90a16eb0ab0b8e70d8956',
        name: 'Essendon Fields',
        operating_hours: {
          monday: {
            start: '08:00',
            end: '17:00',
          },
          tuesday: {
            start: '08:00',
            end: '17:00',
          },
          wednesday: {
            start: '08:00',
            end: '17:00',
          },
          thursday: {
            start: '08:00',
            end: '17:00',
          },
          friday: {
            start: '08:00',
            end: '17:00',
          },
          saturday: null,
          sunday: null,
        },
        operating_hours_unavailable: false,
        address: '44/249 Wirraway Road, Essendon Fields Victoria 3041',
        google_address:
          '44/249 Wirraway Rd, Essendon Fields VIC 3041, Australia',
        bookings: {
          '17/04/2025': { '12:00': 5, '12:30': 3, '13:00': 1 },
          '18/04/2025': { '8:00': 1 },
          '19/04/2025': {},
          '20/04/2025': {},
          '21/04/2025': {},
          '22/04/2025': {},
          '23/04/2025': {},
          '24/04/2025': {},
          '25/04/2025': {},
          '26/04/2025': {},
          '27/04/2025': {},
          '28/04/2025': {},
          '29/04/2025': {},
          '30/04/2025': {},
          '01/05/2025': {},
          '02/05/2025': {},
          '03/05/2025': {},
          '04/05/2025': {},
          '05/05/2025': {},
          '06/05/2025': {},
          '07/05/2025': {},
          '08/05/2025': {},
          '09/05/2025': {},
          '10/05/2025': {},
          '11/05/2025': {},
          '12/05/2025': {},
          '13/05/2025': {},
          '14/05/2025': {},
          '15/05/2025': {},
          '16/05/2025': {},
          '17/05/2025': {},
          '18/05/2025': {},
          '19/05/2025': {},
          '20/05/2025': {},
          '21/05/2025': {},
          '22/05/2025': {},
          '23/05/2025': {},
          '24/05/2025': {},
        },
      },
    ],
  },
};
