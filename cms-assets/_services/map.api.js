import { createApi } from '@reduxjs/toolkit/query/react';
import { simulateLoading, signedBaseQuery } from '../_utils/api-utils.js';
import { StateOptions } from '../_common/constants/index.js';

const hubspotBaseURL = '/hs/serverless/api/v3/map/';
/**
 * Map API to retrieve States and search Location by either postcode or suburb
 */
export const mapAPI = createApi({
  reducerPath: 'api/maps',
  tagTypes: ['Maps'],
  baseQuery: signedBaseQuery({ baseUrl: hubspotBaseURL }),
  endpoints: (build) => ({
    getStatesOptions: build.query({
      /**
       * Retrieves predefined state options
       */
      async queryFn() {
        await simulateLoading();
        return {
          data: StateOptions,
        };
      },
    }),
    getSuburbs: build.query({
      query: (input) => ({
        url: `/getSuburbs`,
        method: 'GET',
        params: {
          input: input,
        },
      }),
    }),
    getSuburbsByPostcode: build.query({
      query: (input) => ({
        url: `/getSuburbsByPostcode`,
        method: 'GET',
        params: {
          input: input,
        },
      }),
    }),
    getSuburbByCoordinates: build.query({
      query: (params) => ({
        url: `/getSuburbByCoordinates`,
        method: 'GET',
        params: {
          lat: params.lat,
          long: params.long,
        },
      }),
    }),
    getGeocode: build.query({
      query: (params) => ({
        url: `/getGeocode`,
        method: 'GET',
        params: {
          latlng: params.latlng,
          place_id: params.place_id,
          suburb: params.suburb,
          state: params.state,
          postcode: params.postcode,
          validate_suburb: params.validate_suburb,
        },
      }),
    }),
    getAddress: build.query({
      query: (input) => ({
        url: '/getAddress',
        method: 'GET',
        params: { input },
      }),
    }),
  }),
});

export const { useGetStatesOptionsQuery } = mapAPI;
