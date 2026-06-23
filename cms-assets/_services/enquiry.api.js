import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { signedBaseQuery } from '../_utils/api-utils.js';

const baseURL = '/_hcms/api';
const baseURLV3 = '/hs/serverless/api/v3/enquiry';

export const enquiryAPI = createApi({
  reducerPath: 'api/enquiry',
  tagTypes: ['Enquiry'],
  credentials: 'same-origin',
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
  }),
  endpoints: (build) => ({
    submitForm: build.mutation({
      query: (payload) => ({
        url: `/submitFormV3`,
        method: 'POST',
        body: payload,
      }),
    }),
    createAppointment: build.mutation({
      query: (payload) => ({
        url: `/createAppointment`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});
export const enquiryAPIV2 = createApi({
  reducerPath: 'api/v2/enquiry',
  tagTypes: ['EnquiryV2'],
  baseQuery: signedBaseQuery({
    baseUrl: baseURLV3,
  }),
  endpoints: (build) => ({
    submitForm: build.mutation({
      query: (payload) => ({
        url: `/submitForm`,
        method: 'POST',
        body: payload,
      }),
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
        method: 'POST',
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
    updateDeal: build.mutation({
      query: (payload) => ({
        url: `/updateDeal`,
        method: 'POST',
        body: payload,
      }),
    }),
    uploadImage: build.mutation({
      query: (payload) => ({
        url: `/uploadFile`,
        method: 'POST',
        body: payload,
      }),
    }),
    createAppointment: build.mutation({
      query: (payload) => ({
        url: `/createAppointment`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useCreateAppointmentMutation,
  useUpdateDealMutation,
  useUploadImageMutation,
  useSubmitFormMutation,
} = enquiryAPIV2;
