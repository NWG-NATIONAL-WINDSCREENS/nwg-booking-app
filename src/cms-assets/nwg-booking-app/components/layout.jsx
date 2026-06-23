import React, { useEffect } from 'react';
import '../styles/output.css';

import StoreWrapper from '../_utils/store.wrapper';
import { useQueryParams } from '../_hooks/query-params.hook.js';

function Layout({ children, preloadState = false, signingSecret }) {
  const { brandSearchParam } = useQueryParams();

  useEffect(() => {
    document.documentElement.dataset.brand = brandSearchParam;
  }, [brandSearchParam]);

  return (
    <StoreWrapper preloadState={preloadState} signingSecret={signingSecret}>{children}</StoreWrapper>
  );
}

export default Layout;
