import React from 'react';
import Layout from '../layout.jsx';
import Booking from '../../_features/booking';

function VehicleLookupIsland({
  header = 'Need a Windscreen Repair or Replacement?',
  subheader = 'Let’s fix it fast — get a quote today and get back on the road.',
  overlay = false,
  invertHeaderColor,
  manualCarSelection,
  redirectTo,
  redirectToAag,
  secrets,
}) {
  return (
    <Layout signingSecret={secrets?.signing_secret}>
      <Booking
        header={header}
        subheader={subheader}
        invertHeaderColor={invertHeaderColor}
        manualCarSelection={manualCarSelection}
        secrets={secrets}
        redirectTo={redirectTo}
        redirectToAag={redirectToAag}
        overlay={overlay}
      ></Booking>
    </Layout>
  );
}

export default VehicleLookupIsland;
