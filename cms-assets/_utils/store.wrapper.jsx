import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store, initialiseStore } from '../_stores/store.js';
import { createInitialState } from '../_slices/booking.slice.js';
import { v4 as uuidv4 } from 'uuid';
import { signRequest, buildParamsString } from './crypto-utils.js';

const decodeFromBase64 = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
};

const getFallbackStore = () => {
  const initialBookingState = {
    ...createInitialState(),
    state_loading: false,
  };

  return initialiseStore({
    booking: initialBookingState,
    form: undefined,
    secret: undefined,
  });
};

export default function StoreWrapper({ children, preloadState = false, signingSecret }) {
  const [localStore, setLocalStore] = useState(store);

  const resetState = async (err) => {
    setLocalStore(getFallbackStore());
    localStorage.removeItem('nwg_eq_uuid');
    await createSession();
    console.error('Failed to load enquiry progress', err);
  };

  const getEnquiryProgress = async (id) => {
    try {
      const params = { id };
      const bodyForSigning = buildParamsString(params);
      const { signature, timestamp, nonce } = await signRequest(signingSecret, bodyForSigning);
      const _auth = `${signature}.${timestamp}.${nonce}`;

      const res = await fetch(
        `/hs/serverless/api/v3/enquiry/getEnquiryProgress?id=${id}&_auth=${_auth}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const { status, state: encryptedState } = await res.json();

      if (status === 'SUCCESS') {
        const parsedState = decodeFromBase64(encryptedState);

        setTimeout(() => {
          parsedState.booking.state_loading = false;
          // Ensures that upon setting saved state the continue button is clickable
          // https://ideascience.atlassian.net/browse/NW458-441
          parsedState.booking.enquiry_progress_loading = false;
          parsedState.booking.vehicle_lookup_param_redirect_to = '';

          const savedState = {
            booking: parsedState.booking,
          };

          // We only set form state if we want to preload and redirect to current form step
          // https://ideascience.atlassian.net/browse/NW458-441
          if (preloadState) {
            savedState.form = parsedState.form;
          }

          setLocalStore(initialiseStore(savedState));
        }, 1000);
      } else {
        resetState(status);
      }
    } catch (error) {
      resetState(error);
    }
  };

  const createSession = async () => {
    const requestBody = JSON.stringify({ session_id: uuidv4() });
    const { signature, timestamp, nonce } = await signRequest(signingSecret, requestBody);
    const _auth = `${signature}.${timestamp}.${nonce}`;

    await fetch(`/hs/serverless/api/v3/session/create?_auth=${_auth}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
  };

  useEffect(() => {
    const loadInitialState = async () => {
      const id = localStorage.getItem('nwg_eq_uuid');

      if (id) {
        await getEnquiryProgress(id);
        return;
      }

      await createSession();
      setLocalStore(getFallbackStore());
    };

    void loadInitialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Provider store={localStore}>{children}</Provider>;
}
