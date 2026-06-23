import { StateOptions } from './state';
import {
  DamageOptions,
  ImpactOptions,
  ImpactLocationOptions,
} from './booking-options.js';
import { MockVehicleDetails, MockPostalCodeDetails } from './mock.js';

export const DEV_KEY = '57346c670b932a473cc922d33d06ed28';

// Test-mode HubSpot payment link. Used in place of the live per-option
// payment_link_url when the funnel is opened with `?dev=<DEV_KEY>` so payments
// can be exercised end-to-end without taking real money.
export const TEST_PAYMENT_LINK =
  'https://payments-ap1.hubspot.com/payments/FnVMNWtzt9QwM?referrer=PAYMENT_LINK';

export const BRANDS = Object.freeze({
  NWG: 'nwg',
  AAG: 'aag',
});

export const DEFAULT_BRAND = BRANDS.NWG;

// Human-readable brand labels sent to HubSpot as the `brand_group`
// custom property value. Keys must match BRANDS values.
export const BRAND_GROUP_LABELS = Object.freeze({
  [BRANDS.NWG]: 'National Windscreens Group',
  [BRANDS.AAG]: 'Action Auto Glass',
});

// Resolves a brand code ('nwg' | 'aag') to its HubSpot `brand_group` label.
// Contract: caller should pass a value from BRANDS. Unknown/undefined falls
// back to DEFAULT_BRAND's label so a malformed input never blocks submission.
export const resolveBrandGroup = (brand) => {
  return BRAND_GROUP_LABELS[brand] || BRAND_GROUP_LABELS[DEFAULT_BRAND];
};

export {
  StateOptions,
  DamageOptions,
  ImpactOptions,
  ImpactLocationOptions,
  MockVehicleDetails,
  MockPostalCodeDetails,
};
