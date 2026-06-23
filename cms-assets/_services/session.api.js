import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { signedBaseQuery } from '../_utils/api-utils.js';

const baseURLV3 = '/hs/serverless/api/v3/session';

export const sessionAPI = createApi({
  reducerPath: 'api/v3/session',
  tagTypes: ['Session'],
  baseQuery: signedBaseQuery({
    baseUrl: baseURLV3,
  }),
  endpoints: (build) => ({
    createSession: build.mutation({
      query: (sessionId) => ({
        url: `/create`,
        method: 'POST',
        body: {
          session_id: sessionId,
        },
      }),
    }),
    refreshSession: build.query({
      query: () => ({
        url: `/refresh`,
        method: 'GET',
      }),
    }),
  }),
});
