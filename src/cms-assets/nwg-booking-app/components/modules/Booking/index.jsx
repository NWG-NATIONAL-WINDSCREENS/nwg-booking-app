import React from 'react';
import { getSecret, Island } from '@hubspot/cms-components';
import BookingIsland from '../../islands/bookingIsland.jsx?island';

export const Component = ({ fieldValues }) => {
  const {
    header: header,
    subheader: subheader,
    invert_header_color: invertHeaderColor,
    manual_car_selection: manualCarSelection,
    preload_state: preloadState,
  } = fieldValues;
  // TODO: Add description
  const googleMapsAPIKey = getSecret('CLIENT_GOOGLE_API_KEY');
  const signingSecret = getSecret('SIGNING_SECRET');

  const secrets = {
    google_maps_api_key: googleMapsAPIKey,
    signing_secret: signingSecret,
  };
  return (
    <>
      <Island
        module={BookingIsland}
        clientOnly={true}
        header={header}
        subheader={subheader}
        invertHeaderColor={invertHeaderColor}
        manualCarSelection={manualCarSelection}
        preloadState={preloadState}
        secrets={secrets}
      />
    </>
  );
};
export { fields } from './fields.jsx';

export const meta = {
  label: `Booking V3`,
};
