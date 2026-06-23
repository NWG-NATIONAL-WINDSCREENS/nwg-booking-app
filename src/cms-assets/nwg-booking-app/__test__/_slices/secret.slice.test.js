import 'whatwg-fetch';
import { configureStore } from '@reduxjs/toolkit';
import { secretReducer } from '../../_slices/index.js';
import {
  clearToken,
  setSecrets,
  setToken,
} from '../../_slices/secret.slice.js';

describe('secretSlice Reducer', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { secret: secretReducer },
    });
  });

  it('should initialize with the correct default state', () => {
    expect(store.getState().secret).toEqual({
      token: null,
      secrets: {
        client_id: null,
        client_secret: null,
        grant_type: null,
        google_maps_api_key: null,
      },
    });
  });

  it('should update secrets when setSecrets is dispatched', () => {
    const secrets = {
      client_id: '12345',
      client_secret: 'abcde',
      grant_type: 'authorization_code',
      google_maps_api_key: 'xyz123',
    };
    store.dispatch(setSecrets(secrets));
    expect(store.getState().secret.secrets).toEqual(secrets);
  });

  it('should update the token when setToken is dispatched', () => {
    store.dispatch(setToken('my_secure_token'));
    expect(store.getState().secret.token).toBe('my_secure_token');
  });

  it('should clear the token when clearToken is dispatched', () => {
    store.dispatch(setToken('temporary_token'));
    store.dispatch(clearToken());
    expect(store.getState().secret.token).toBeNull();
  });
});
