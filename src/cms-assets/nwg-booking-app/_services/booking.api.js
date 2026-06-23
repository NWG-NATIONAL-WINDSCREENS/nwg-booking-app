import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { simulateLoading } from '../_utils/api-utils.js';
import { ServiceLocationOptions } from '../_common/constants/booking-options.js';

const baseURL = '/_hcms/api';

export const bookingAPI = createApi({
  reducerPath: 'api/booking',
  tagTypes: ['Booking'],
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
  }),
  endpoints: (build) => ({
    getServiceOptions: build.query({
      async queryFn() {
        await simulateLoading();
        return {
          data: ServiceLocationOptions,
        };
      },
    }),
    saveEnquiryProgress: build.mutation({
      query: (payload) => ({
        url: `/saveEnquiryProgress`,
        method: 'POST',
        body: payload,
      }),
    }),
    updateEnquiryProgress: build.mutation({
      query: (payload) => ({
        url: `/updateEnquiryProgress`,
        method: 'PUT',
        body: payload,
      }),
    }),
    getEnquiryProgress: build.query({
      query: (id) => ({
        url: `/getEnquiryProgress`,
        method: 'GET',
        params: {
          id: id,
        },
      }),
    }),
    uploadImage: build.mutation({
      query: (payload) => ({
        url: `/uploadFile`,
        method: 'POST',
        body: payload,
      }),
    }),
    updateDeal: build.mutation({
      query: (payload) => ({
        url: `/updateDeal`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});
export const { useGetServiceOptionsQuery } = bookingAPI;
