import React from 'react';
import Layout from '../layout.jsx';
import Booking from '../../_features/booking';

function BookingIsland({
  header = 'Vehicles Back To Their Best',
  subheader = 'Let’s fix it fast — get a quote today and get back on the road.',
  invertHeaderColor,
  manualCarSelection,
  secrets,
  preloadState,
}) {
  return (
    <Layout preloadState={preloadState} signingSecret={secrets?.signing_secret}>
      <Booking
        clientOnly={true}
        header={header}
        subheader={subheader}
        invertHeaderColor={invertHeaderColor}
        manualCarSelection={manualCarSelection}
        secrets={secrets}
      ></Booking>
    </Layout>
  );
}

export default BookingIsland;
