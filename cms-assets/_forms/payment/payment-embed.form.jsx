import React, { useEffect, useRef, useState } from 'react';

export default function PaymentEmbedForm() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const scriptId = 'HubSpotPaymentsEmbedScript';
    if (document.getElementById(scriptId)) {
      setLoaded(true);
      return;
    }

    const js = document.createElement('script');
    js.id = scriptId;
    js.src =
      'https://static.hsappstatic.net/payments-embed/ex/PaymentsEmbedCode.js';
    js.async = true;
    js.onload = () => {
      setLoaded(true);
    };
    document.getElementsByTagName('head')[0].appendChild(js);

    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        document.getElementsByTagName('head')[0].removeChild(script);
      }
    };
  }, []);

  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== new URL('https://app-ap1.hubspot.com').origin)
        return;

      if (event.data?.type === 'paymentSuccess') {
        alert('Hey yo');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    // Event listener for messages sent from the embedded payment form
    const handlePaymentMessage = (event) => {
      // Ensure the message is from a trusted source
      if (event.origin !== 'https://payments.hubspot.com') return;

      // Check the message type for the completion of payment
      if (event.data === 'paymentCompleted') {
        // Handle payment completion event
        console.log('Payment Completed!');
        // You can call any additional function here after payment completion
      }
    };

    // Attach event listener
    window.addEventListener('message', handlePaymentMessage);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('message', handlePaymentMessage);
    };
  }, []);

  return (
    <>
      {loaded && (
        <>
          <iframe
            ref={iframeRef}
            className="payments-iframe-container"
            style={{ width: '100%', height: '100vh', border: 'none' }}
            src="https://app-ap1.hubspot.com/payments/FnVMNWtzt9QwM?referrer=PAYMENT_LINK_EMBED&layout=embed-full"
            sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation"
          />

          {/*<object*/}
          {/*  type="text/html"*/}
          {/*  className="payments-iframe-container"*/}
          {/*  style={{ width: '100%', height: '100vh', border: 'none' }}*/}
          {/*  data="https://app-ap1.hubspot.com/payments/FnVMNWtzt9QwM?referrer=PAYMENT_LINK_EMBED&layout=embed-full"*/}
          {/*/>*/}
        </>
      )}
    </>
  );
}
