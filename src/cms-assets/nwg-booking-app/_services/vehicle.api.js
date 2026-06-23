import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { simulateLoading, signedBaseQuery } from '../_utils/api-utils.js';
import {
  DamageOptions,
  ImpactLocationOptions,
  ImpactOptions,
  MockVehicleDetails,
} from '../_common/constants/index.js';
import {
  CauseOfDamageOptions,
  InsurerOptions,
  IssueContactOptions,
  PaymentTypeOptions,
  PreferredCallTimeOptions,
} from '../_common/constants/booking-options.js';

const baseURL = '/_hcms/api';
const baseURLV3 = '/hs/serverless/api/v3/vehicle/';
export const vehicleAPI = createApi({
  reducerPath: 'api/vehicles',
  tagTypes: ['Vehicle'],
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
  }),
  endpoints: (build) => ({
    findVehicle: build.mutation({
      /**
       * Fetches vehicle details
       */
      query: ({ state, plate }) => ({
        url: `/findVehicle`,
        method: 'GET',
        params: {
          state: state,
          plate: plate,
        },
      }),
    }),
    getMockedVehicleDetail: build.query({
      /**
       * Returns mocked vehicle details after simulating a delay.
       * Useful for testing or development environments.
       */
      // eslint-disable-next-line no-unused-vars
      async queryFn(payload) {
        await simulateLoading();
        return {
          data: MockVehicleDetails,
        };
      },
    }),
    getDamageOptions: build.query({
      /**
       * Retrieves a predefined list of damage options.
       */
      async queryFn() {
        await simulateLoading();
        return {
          data: DamageOptions,
        };
      },
    }),
    getImpactOptions: build.query({
      /**
       * Retrieves predefined impact options.
       */
      async queryFn() {
        await simulateLoading();
        return {
          data: ImpactOptions,
        };
      },
    }),
    getImpactLocationOptions: build.query({
      /**
       * Retrieves predefined impact location options.
       */
      async queryFn() {
        await simulateLoading();
        return {
          data: ImpactLocationOptions,
        };
      },
    }),
    getIssueContactOptions: build.query({
      /**
       * Retrieves predefined contact options for issues.
       */
      async queryFn() {
        await simulateLoading();
        return {
          data: IssueContactOptions,
        };
      },
    }),
    getPreferredCallTimeOptions: build.query({
      /**
       * Retrieves predefined contact options for issues.
       */
      async queryFn() {
        await simulateLoading();
        return {
          data: PreferredCallTimeOptions,
        };
      },
    }),
    getPaymentTypeOptions: build.query({
      async queryFn() {
        await simulateLoading();
        return {
          data: PaymentTypeOptions,
        };
      },
    }),
    getInsurerOptions: build.query({
      async queryFn() {
        await simulateLoading();
        return {
          data: InsurerOptions,
        };
      },
    }),
    getCauseOfDamageOptions: build.query({
      async queryFn() {
        await simulateLoading();
        return {
          data: CauseOfDamageOptions,
        };
      },
    }),
  }),
});
export const vehicleAPIV2 = createApi({
  reducerPath: 'api/v2/vehicles',
  tagTypes: ['VehicleV2'],
  baseQuery: signedBaseQuery({
    baseUrl: baseURLV3,
  }),
  endpoints: (build) => ({
    findVehicle: build.mutation({
      /**
       * Fetches vehicle details
       */
      query: ({ state, plate }) => ({
        url: `/findVehicle`,
        method: 'POST',
        body: {
          state: state,
          plate: plate,
        },
      }),
    }),
    getRepairers: build.mutation({
      query: ({ lat, long }) => ({
        url: `/getRepairers`,
        method: 'GET',
        params: {
          lat: lat,
          long: long,
        },
      }),
    }),
  }),
});

export const {
  useGetVehicleDetailMutation,
  useGetDamageOptionsQuery,
  useGetCauseOfDamageOptionsQuery,
  useGetImpactOptionsQuery,
  useGetImpactLocationOptionsQuery,
  useGetIssueContactOptionsQuery,
  useGetPreferredCallTimeOptionsQuery,
  useGetPaymentTypeOptionsQuery,
  useGetInsurerOptionsQuery,
} = vehicleAPI;

export const { useFindVehicleMutation } = vehicleAPIV2;

const baseURLV4 = '/hs/serverless/api/v4/';
export const vehicleAPIV3 = createApi({
  reducerPath: 'api/v4/vehicles',
  tagTypes: ['VehicleV3'],
  baseQuery: signedBaseQuery({
    baseUrl: baseURLV4,
  }),
  endpoints: (build) => ({
    findVehicle: build.mutation({
      query: ({ state, plate }) => ({
        url: `/findVehicle`,
        method: 'POST',
        body: {
          state: state,
          plate: plate,
        },
      }),
    }),
  }),
});

export const { useFindVehicleMutation: useFindVehicleV3Mutation } =
  vehicleAPIV3;

// Pricing options live in a separate nwg-pricing-tools project but are
// served from the same portal under /hs/serverless/api/v1/pricing/.
// Signed with the same HMAC scheme as vehicleAPIV2/V3 (shared SIGNING_SECRET).
const baseURLPricing = '/hs/serverless/api/v1/pricing/';
export const pricingAPI = createApi({
  reducerPath: 'api/v1/pricing',
  tagTypes: ['PricingOptions'],
  baseQuery: signedBaseQuery({
    baseUrl: baseURLPricing,
  }),
  endpoints: (build) => ({
    getActiveOptions: build.query({
      /**
       * Retrieves active pricing options for a brand, sorted by sequence.
       * Backs the damage-selection form's chip/crack option list.
       */
      query: ({ brand }) => ({
        url: 'options/active',
        method: 'GET',
        params: { brand },
      }),
      transformResponse: (response) => response?.options ?? [],
      providesTags: ['PricingOptions'],
    }),
  }),
});

export const { useGetActiveOptionsQuery } = pricingAPI;
