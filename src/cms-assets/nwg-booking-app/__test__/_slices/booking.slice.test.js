import 'whatwg-fetch';
import { configureStore } from '@reduxjs/toolkit';
import {
  bookingReducer,
  clearSearchResults,
  confirmVehicleDetails,
  setPropValue,
  setSearchResults,
} from '../../_slices/booking.slice.js';
import { setupStore } from '../../_stores/store.js';

describe('Booking Reducer', () => {
  let store;
  const searchResults = {
    timestamp: 1637980655111,
    responseCode: 'SUCCESS',
    description: '1 vehicle found',
    error: {
      errorCode: 500,
      errorMessage: 'Failed to query external data provide',
      errorType: 'SYSTEM_ERROR',
    },
    vehicle: {
      identification: {
        plate: 'ABC123',
        state: 'NSW',
        vin: '7A8GF0B0797022619',
        chassis: 'BC5-022619',
      },
      details: {
        year: 2017,
        compliancePlate: '2017-03',
        make: 'Mazda',
        model: 'CX-9',
        colour: 'BLACK',
        vehicleType: 'Passenger Car/Van',
        bodyType: 'Wagon',
        fuelType: 'Petrol',
        ccRating: '2488',
        engineNumber: 'ENGINE123456',
      },
    },
  };
  const initialState = {
    // Object for getting user vehicle details from Step 2
    user_vehicle_detail: {
      registration_number: '1CI1OP',
      state: 'VIC',
      year: null,
      make: null,
      model: null,
      variant: null,
    },
    user_vehicle_damage: {
      damage: 'windscreen',
      chips: 'crack',
      impact: 'bigger_than_2_coin',
      impact_location: 'green_area',
    },
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
    search_results: null,
    contact: 'john.doe@gmail.com',
    is_phone: false,
    is_email: false,

    location: '',
    is_postcode: false,
    is_suburb: false,
  };
  beforeEach(() => {
    store = setupStore();
  });

  it('should initialize with the correct default state', () => {
    expect(store.getState().booking).toEqual(initialState);
  });
  it('should update a property value when setPropValue is dispatched', () => {
    store.dispatch(
      setPropValue({
        prop: 'registration_number',
        value: 'ABC123',
        formName: 'user_vehicle_detail',
      }),
    );

    expect(
      store.getState().booking.user_vehicle_detail.registration_number,
    ).toBe('ABC123');
  });
  it('should update a property value when setPropValue without formName is dispatched', () => {
    const prevState = store.getState().booking;

    store.dispatch(
      setPropValue({
        prop: 'location',
        value: 'Ivanhoe',
      }),
    );
    expect(store.getState().booking.location).toBe('Ivanhoe');
  });
  it('should not update a non-existent property', () => {
    const prevState = store.getState().booking;

    store.dispatch(
      setPropValue({
        prop: 'non_existent_prop',
        value: 'test',
        formName: 'user_vehicle_detail',
      }),
    );

    expect(store.getState().booking).toEqual(prevState);
  });
  it('should set search results', () => {
    store.dispatch(setSearchResults(searchResults));
    expect(store.getState().booking.search_results).not.toBeNull();
  });
  it('should clear search results', () => {
    store.dispatch(setSearchResults(searchResults));
    expect(store.getState().booking.search_results).not.toBeNull();
    store.dispatch(clearSearchResults());
    expect(store.getState().booking.search_results).toBeNull();
  });
  it('should confirm vehicle details when response is SUCCESS', () => {
    const mockVehicleData = {
      responseCode: 'SUCCESS',
      vehicle: {
        details: {
          engineNumber: 'ABC12345',
          bodyType: 'Sedan',
          fuelType: 'Petrol',
          colour: 'Blue',
          year: 2022,
          make: 'Honda',
          model: 'Civic',
          vehicleType: 'Car',
        },
        identification: {
          vin: '1HGCM82633A123456',
        },
      },
    };

    store.dispatch(confirmVehicleDetails(mockVehicleData));

    expect(store.getState().booking.user_confirmed_vehicle_detail).toEqual({
      vin: '1HGCM82633A123456',
      engine_number: 'ABC12345',
      body_type: 'Sedan',
      fuel_type: 'Petrol',
      colour: 'Blue',
      year: 2022,
      make: 'Honda',
      model: 'Civic',
      vehicle_type: 'Car',
    });
  });
  it('should not update state if responseCode is not SUCCESS', () => {
    const prevState = store.getState().booking.user_confirmed_vehicle_detail;
    store.dispatch(confirmVehicleDetails({ responseCode: 'ERROR' }));
    expect(store.getState().booking.user_confirmed_vehicle_detail).toEqual(
      prevState,
    );
  });
  it('should log an error if vehicle details are missing', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    store.dispatch(
      confirmVehicleDetails({ responseCode: 'SUCCESS', vehicle: null }),
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith('No vehicle details provided');

    consoleErrorSpy.mockRestore();
  });

  it('should log an error if details or identification are missing', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    store.dispatch(
      confirmVehicleDetails({
        responseCode: 'SUCCESS',
        vehicle: { details: null, identification: null },
      }),
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'No vehicle details and/or identification provided',
    );

    consoleErrorSpy.mockRestore();
  });
});
