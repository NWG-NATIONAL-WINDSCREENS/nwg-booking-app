import React from 'react';
import { Spin } from 'antd';

export default function Loader({ children, label }) {
  return (
    <div className="custom-spinner">
      <Spin tip={label} size="large">
        <div className="spinner-content">{children}</div>
      </Spin>
    </div>
  );
}
