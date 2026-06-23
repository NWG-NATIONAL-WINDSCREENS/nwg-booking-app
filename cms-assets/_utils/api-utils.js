import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { signRequest, buildParamsString } from './crypto-utils.js';

/**
 * Simulates loading
 * @returns {Promise<unknown>}
 */
export function simulateLoading() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates a base query that automatically signs requests with HMAC-SHA256.
 * Wraps RTK Query's fetchBaseQuery, injecting a single _auth query param
 * containing signature.timestamp.nonce.
 * Note: HubSpot serverless strips custom headers, so signing data goes via params.
 */
export const signedBaseQuery = (baseQueryOptions) => {
  const baseQuery = fetchBaseQuery(baseQueryOptions);
  return async (args, api, extraOptions) => {
    const request = typeof args === 'string' ? { url: args } : args;

    let bodyForSigning;
    if (request.body) {
      bodyForSigning = JSON.stringify(request.body);
    } else if (request.params) {
      bodyForSigning = buildParamsString(request.params);
    } else {
      bodyForSigning = '';
    }

    const signingSecret = api.getState().secret.secrets.signing_secret;
    const { signature, timestamp, nonce } = await signRequest(signingSecret, bodyForSigning);

    return baseQuery(
      {
        ...request,
        params: {
          ...request.params,
          _auth: `${signature}.${timestamp}.${nonce}`,
        },
      },
      api,
      extraOptions,
    );
  };
};

/**
 * Attaches authorization and content type headers to API requests.
 * Retrieves the token from Redux state and includes it if available.
 */
export const prepareHeaders = (headers, { getState }) => {
  const token = getState().secret.token;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');
  return headers;
};
