import React from 'react';
import { getSecret, Island } from '@hubspot/cms-components';
import VehicleLookupIsland from '../../islands/vehicleLookupIsland.jsx?island';

export const Component = ({ fieldValues }) => {
  const {
    header: header,
    subheader: subheader,
    invert_header_color: invertHeaderColor,
    manual_car_selection: manualCarSelection,
    redirect_to: redirectTo,
    redirect_to_aag: redirectToAag,
  } = fieldValues;
  const googleMapsAPIKey = getSecret('GOOGLE_API_KEY');
  const signingSecret = getSecret('SIGNING_SECRET');
  const secrets = {
    google_maps_api_key: googleMapsAPIKey,
    signing_secret: signingSecret,
  };
  return (
    <>
      <Island
        module={VehicleLookupIsland}
        clientOnly={true}
        overlay={true}
        header={header}
        subheader={subheader}
        invertHeaderColor={invertHeaderColor}
        manualCarSelection={manualCarSelection}
        redirectTo={redirectTo}
        redirectToAag={redirectToAag}
        secrets={secrets}
      />
    </>
  );
};
export { fields } from './fields.jsx';

export const meta = {
  label: `Vehicle Lookup V3.1`,
};
