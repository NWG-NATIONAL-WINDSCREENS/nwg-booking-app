import { useMemo } from 'react';
import { BRANDS, DEFAULT_BRAND, DEV_KEY } from '../_common/constants/index.js';

/**
 * Normalize a raw `?brand=` query value into a known brand.
 * Unknown, missing, or malformed values fall back to DEFAULT_BRAND.
 */
const resolveBrand = (rawBrand) => {
  if (!rawBrand) return DEFAULT_BRAND;
  const normalized = rawBrand.toLowerCase().trim();
  const allowed = Object.values(BRANDS);
  return allowed.includes(normalized) ? normalized : DEFAULT_BRAND;
};

export const useQueryParams = () => {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    return {
      registrationLocationSearchParam: params.get('location'),
      registrationPostcodeSearchParam: params.get('postcode'),
      registrationSearchParam: params.get('registration'),
      registrationStateSearchParam: params.get('state'),
      brandSearchParam: resolveBrand(params.get('brand')),
      devSearchParam: params.get('dev') === DEV_KEY,
      utk: params.get('utk'),
      trackingPhone: params.get('tracking_phone'),
      trackingPhoneFormatted: params.get('tracking_phone_formatted'),
      trackingPhone2: params.get('tracking_phone_2'),
      trackingPhoneFormatted2: params.get('tracking_phone_2_formatted'),
    };
  }, []);
};
