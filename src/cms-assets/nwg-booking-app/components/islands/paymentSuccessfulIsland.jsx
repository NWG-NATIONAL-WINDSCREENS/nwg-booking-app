import React, { useEffect } from 'react';
import Layout from '../layout.jsx';

function PaymentSuccessfulIsland({ header }) {
  useEffect(() => {
    // Primary signal: post directly to the opener (the booking-funnel iframe).
    // This page is a first-party top-level popup; the funnel is a partitioned
    // third-party iframe — so they sit in DIFFERENT storage partitions and a
    // BroadcastChannel never reaches it. postMessage over the opener handle is
    // not partitioned. targetOrigin === our own origin because the opener iframe
    // is served from the same host (bookings.nwg.com.au) as this success page.
    if (window.opener) {
      window.opener.postMessage(
        { type: 'paymentSuccess' },
        window.location.origin,
      );
    }

    // Fallback for same-partition contexts (older browsers / non-iframed funnel).
    const channel = new BroadcastChannel('nwg-payment');
    channel.postMessage({ type: 'paymentSuccess' });
    channel.close();

    setTimeout(() => {
      window.close();
    });
  }, []);

  return (
    <Layout>
      <h1>{header}</h1>
      <br />A confirmation email was sent to your email.
    </Layout>
  );
}

export default PaymentSuccessfulIsland;
