import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
} from '@reduxjs/toolkit';
import { authAPI, mapAPI, vehicleAPI } from '../_services/index';
import {
  secretReducer,
  bookingReducer,
  formReducer,
} from '../_slices/index.js';
import { validatePropValue } from '../_slices/booking.slice.js';
import { enquiryAPI, enquiryAPIV2 } from '../_services/enquiry.api.js';
import { bookingAPI } from '../_services/booking.api.js';
import { handleProgressStateChanges } from '../_utils/progress-utils.js';
import { uploadAPI } from '../_services/upload.api.js';
import { sessionAPI } from '../_services/session.api.js';
import {
  vehicleAPIV2,
  vehicleAPIV3,
  pricingAPI,
} from '../_services/vehicle.api.js';

// Add this middleware to trigger change event rather than calling useEffect
const listenerMiddleWare = createListenerMiddleware();

const rootReducer = combineReducers({
  booking: bookingReducer,
  secret: secretReducer,
  form: formReducer,
  [vehicleAPI.reducerPath]: vehicleAPI.reducer,
  [vehicleAPIV2.reducerPath]: vehicleAPIV2.reducer,
  [vehicleAPIV3.reducerPath]: vehicleAPIV3.reducer,
  [mapAPI.reducerPath]: mapAPI.reducer,
  [authAPI.reducerPath]: authAPI.reducer,
  [enquiryAPI.reducerPath]: enquiryAPI.reducer,
  [enquiryAPIV2.reducerPath]: enquiryAPIV2.reducer,
  [bookingAPI.reducerPath]: bookingAPI.reducer,
  [uploadAPI.reducerPath]: uploadAPI.reducer,
  [sessionAPI.reducerPath]: sessionAPI.reducer,
  [pricingAPI.reducerPath]: pricingAPI.reducer,
});

export const setupStore = (preloadedState) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      })
        .concat(
          vehicleAPI.middleware,
          vehicleAPIV2.middleware,
          vehicleAPIV3.middleware,
          mapAPI.middleware,
          authAPI.middleware,
          enquiryAPI.middleware,
          enquiryAPIV2.middleware,
          bookingAPI.middleware,
          uploadAPI.middleware,
          sessionAPI.middleware,
          pricingAPI.middleware,
        )
        .prepend(listenerMiddleWare.middleware),
    preloadedState,
    devTools: {
      name: 'DEV - BOOKING',
    },
  });
};

export let store = setupStore();

export const initialiseStore = (preloadedState) => {
  store = setupStore(preloadedState);
  return store;
};

listenerMiddleWare.startListening({
  predicate: (action, currentState, previousState) => {
    if (!action.payload) {
      return;
    }

    const { field, form } = action.payload;

    if (!(field && form)) {
      return;
    }

    return (
      currentState.booking[field.object_name]?.[field.id] !==
      previousState.booking[field.object_name]?.[field.id]
    );
  },
  effect: async (action, listenerApi) => {
    const { value, field, form } = action.payload;

    listenerApi.cancelActiveListeners();
    await listenerApi.delay(500);

    const state = listenerApi.getState();

    listenerApi.dispatch(validatePropValue({ value, field, form }));

    if (state.booking.progress_uuid && state.form.current_step !== 1) {
      await handleProgressStateChanges(
        listenerApi.dispatch,
        state.booking.progress_uuid,
        true,
      );
    }
  },
});
