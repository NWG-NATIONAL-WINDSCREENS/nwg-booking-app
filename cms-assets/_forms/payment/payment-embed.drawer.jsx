import React from 'react';
import { Drawer, Button, Space } from 'antd';

const PaymentEmbedDrawer = ({ open, onClose }) => {
  const paymentUrl =
    'https://app-ap1.hubspot.com/payments/FnVMNWtzt9QwM?referrer=PAYMENT_LINK_EMBED&layout=embed-full';

  return (
    <Drawer
      title="Payment"
      placement="bottom"
      closable={false}
      onClose={onClose}
      open={open}
      height="90vh"
      key="bottom"
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
        </Space>
      }
    >
      <iframe
        src={paymentUrl}
        title="HubSpot Payment"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        allow="payment"
      />
    </Drawer>
  );
};

export default PaymentEmbedDrawer;
