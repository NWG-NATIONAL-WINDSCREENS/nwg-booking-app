/**
 * @jest-environment jsdom
 */

import 'whatwg-fetch';
import '@testing-library/jest-dom';
import React, { act } from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { renderWithProviders } from '../../_utils/test-utils.wrapper';
import { useDispatch, useSelector } from 'react-redux';
import { setupStore } from '../../_stores/store.js';
import { VehicleConfirmation } from '../../_forms/index.js';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('@uidotdev/usehooks', () => ({
  useDebounce: jest.fn((val) => val), // Mocked behavior
}));

jest.mock('../../assets/car.png', () => 'mocked-car.png');
jest.mock('../../assets/windshield.png', () => 'mocked-windshield.png');
jest.mock(
  '../../assets/windshield_impact.png',
  () => 'mocked-windshield_impact.png',
);

describe('VehicleConfirmation', () => {
  const mockDispatch = jest.fn();
  const initialState = {
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

  beforeEach(() => {
    useSelector.mockClear();
    useDispatch.mockClear();
    useSelector.mockReturnValue(initialState);
    useDispatch.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields with initial state', async () => {
    const store = setupStore();
    await act(() => {
      renderWithProviders(<VehicleConfirmation manualCarSelection={false} />);
    });
    expect(screen.getByText('Is this your car?')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('Mazda CX-9')).toBeInTheDocument();
    expect(screen.getByText('2017 Petrol')).toBeInTheDocument();
  });
  it('renders manual car selection link', async () => {
    const store = setupStore();
    await act(() => {
      renderWithProviders(<VehicleConfirmation manualCarSelection={true} />, {
        store: store,
      });
    });
    expect(screen.getByText('Manually')).toBeInTheDocument();
  });
  it('calls handleSubmit on clicking confirm button', async () => {
    const mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    const store = setupStore();
    renderWithProviders(<VehicleConfirmation manualCarSelection={false} />, {
      store,
    });
    const confirmationButton = screen.getByTestId('confirmation-confirm');
    await act(async () => {
      fireEvent.click(confirmationButton);
    });
    expect(mockDispatch).toHaveBeenCalled();
  });
  it('calls handleChange on clicking change button', async () => {
    const mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    const store = setupStore();
    renderWithProviders(<VehicleConfirmation manualCarSelection={false} />, {
      store,
    });
    const confirmationButton = screen.getByTestId('confirmation-change');
    await act(async () => {
      fireEvent.click(confirmationButton);
    });
    expect(mockDispatch).toHaveBeenCalled();
  });
});
