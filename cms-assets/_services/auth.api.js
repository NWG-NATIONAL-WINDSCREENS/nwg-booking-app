import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setToken } from '../_slices/secret.slice.js';

const baseURL = 'https://api.dev.infoagent.com.au';

export const authAPI = createApi({
  reducerPath: 'api/auth',
  tagTypes: ['Vehicle'],
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
  }),
  endpoints: (build) => ({
    /**
     * Retrieves auth token for InfoAgent API
     */
    getAuthToken: build.mutation({
      query: (payload) => ({
        url: `/auth/v1/token/oauth`,
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.access_token));
        } catch (error) {
          console.error('Token fetch failed:', error);
        }
      },
    }),
  }),
});

export const { useGetAuthTokenMutation } = authAPI;
