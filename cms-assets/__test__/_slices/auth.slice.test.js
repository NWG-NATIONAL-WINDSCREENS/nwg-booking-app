import { configureStore } from '@reduxjs/toolkit';
import {
  secretReducer,
  clearToken,
  setToken,
} from '../../_slices/secret.slice.js';

describe('authSlice Reducer', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: secretReducer },
    });
  });

  it('should initialize with the correct default state', () => {
    expect(store.getState().auth).toEqual({
      token: null,
    });
  });

  it('should update a property value when setToken is dispatched', () => {
    store.dispatch(setToken('aaa'));

    expect(store.getState().auth.token).toBe('aaa');
  });
  it('should clear the token when clearToken is dispatched', () => {
    store.dispatch(clearToken());
    expect(store.getState().auth.token).toBe(null);
  });
});
