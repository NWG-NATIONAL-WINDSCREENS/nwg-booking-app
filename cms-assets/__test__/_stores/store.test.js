import { authAPI, mapAPI, vehicleAPI } from '../../_services/index.js';
import { setupStore } from '../../_stores/store.js';

describe('Redux Store', () => {
  let store;

  beforeEach(() => {
    store = setupStore();
  });

  it('should initialize with the correct reducers', () => {
    const expectedReducers = [
      'booking',
      'secret',
      'form',
      authAPI.reducerPath,
      mapAPI.reducerPath,
      vehicleAPI.reducerPath,
    ];

    // Check if reducers exist in the store
    expectedReducers.forEach((reducer) => {
      expect(store.getState()).toHaveProperty(reducer);
    });
  });
});
