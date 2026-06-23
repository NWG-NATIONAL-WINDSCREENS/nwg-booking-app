import 'whatwg-fetch';
import { configureStore } from '@reduxjs/toolkit';
import { formReducer } from '../../_slices/index.js';
import {
  incrementFormCurrentStep,
  setFormCurrentStep,
} from '../../_slices/form.slice.js';

describe('formSlice Reducer', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { form: formReducer },
    });
  });

  it('should initialize with the correct default state', () => {
    expect(store.getState().form.current_step).toBe(1);
  });

  it('should increment current_step when incrementFormCurrentStep is dispatched', () => {
    store.dispatch(incrementFormCurrentStep());
    expect(store.getState().form.current_step).toBe(2);
  });

  it('should set current_step to a specific value when setFormCurrentStep is dispatched', () => {
    store.dispatch(setFormCurrentStep(3));
    expect(store.getState().form.current_step).toBe(3);
  });
});
