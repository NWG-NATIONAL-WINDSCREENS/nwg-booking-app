import React from 'react';
import { Island } from '@hubspot/cms-components';
import PaymentSuccessfulIsland from '../../islands/paymentSuccessfulIsland.jsx?island';

export const Component = ({ fieldValues }) => {
  const { header: header } = fieldValues;
  return (
    <>
      <Island
        module={PaymentSuccessfulIsland}
        clientOnly={true}
        header={header}
      />
    </>
  );
};
export { fields } from './fields.jsx';

export const meta = {
  label: `Payment Success - Redirect V3`,
};
