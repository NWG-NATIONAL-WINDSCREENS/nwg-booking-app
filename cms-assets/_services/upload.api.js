import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const uploadAPI = createApi({
  reducerPath: 'api/upload', // Unique path
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.hubapi.com', // Different base URL for upload
  }),
  endpoints: (build) => ({
    uploadImageV2: build.mutation({
      query: ({ token, payload }) => ({
        url: `/files/v3/files`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      }),
    }),
  }),
});

export const { useUploadImageV2Mutation } = uploadAPI;
