/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useFormValidation } from '../../_hooks/form-validation.hook';
import { setPropValue } from '../../_slices/booking.slice';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../_slices/booking.slice', () => ({
  setPropValue: jest.fn(),
}));

describe('useFormValidation Hook', () => {
  let dispatchMock;

  beforeEach(() => {
    dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with an empty errors object', () => {
    const { result } = renderHook(() => useFormValidation());
    expect(result.current.errors).toEqual({});
  });

  it('should set error for a required field when empty', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.handleEvent({ target: { value: '' } }, 'email', true);
    });

    expect(result.current.errors).toEqual({ email: 'This field is required.' });
  });

  it('should clear error when a valid value is provided', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.handleEvent({ target: { value: '' } }, 'email', true);
    });
    act(() => {
      result.current.handleEvent(
        { target: { value: 'test@example.com' } },
        'email',
        true,
      );
    });

    expect(result.current.errors).toEqual({ email: '' });
  });

  it('should not update errors for non-required fields', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.handleEvent({ target: { value: '' } }, 'username', false);
    });

    expect(result.current.errors).toEqual({});
  });

  it('should dispatch setPropValue with correct arguments', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.handleEvent(
        { target: { value: 'John Doe' } },
        'name',
        true,
      );
    });

    expect(dispatchMock).toHaveBeenCalledWith(
      setPropValue({ prop: 'name', value: 'John Doe' }),
    );
  });

  it('should validate multiple fields correctly', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.validateAllFields([
        { prop: 'email', value: '', required: true },
        { prop: 'password', value: '123456', required: true },
      ]);
    });

    expect(result.current.errors).toEqual({ email: 'This field is required.' });
  });

  it('should return true when all fields are valid', () => {
    const { result } = renderHook(() => useFormValidation());

    let isValid;
    act(() => {
      isValid = result.current.validateAllFields([
        { prop: 'email', value: 'test@example.com', required: true },
        { prop: 'password', value: '123456', required: true },
      ]);
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('should return false when at least one field is invalid', () => {
    const { result } = renderHook(() => useFormValidation());

    let isValid;
    act(() => {
      isValid = result.current.validateAllFields([
        { prop: 'email', value: '', required: true },
        { prop: 'password', value: '', required: true },
      ]);
    });

    expect(isValid).toBe(false);
    expect(result.current.errors).toEqual({
      email: 'This field is required.',
      password: 'This field is required.',
    });
  });
});
