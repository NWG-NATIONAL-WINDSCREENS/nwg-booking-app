import { useSelector } from 'react-redux';
import { useGetActiveOptionsQuery } from '../_services/vehicle.api.js';
import { useQueryParams } from './query-params.hook.js';
import { BRANDS } from '../_common/constants/index.js';

/**
 * Live brand pricing options for the session's `?brand=`.
 *
 * Skips the request until the signing secret is in the store. On a hard refresh
 * the secret slice is hydrated asynchronously by the store wrapper, while this
 * query auto-fires on mount. If it fires first, signedBaseQuery signs with a
 * null secret and the API rejects the (wrongly-signed) request with 403.
 * Skipping until the secret lands guarantees the request is signed with the
 * real key.
 *
 * @returns RTK Query result for getActiveOptions ({ data, isFetching, ... }).
 */
export const useActivePricingOptions = () => {
  const { brandSearchParam } = useQueryParams();
  const signingSecret = useSelector(
    (state) => state.secret?.secrets?.signing_secret,
  );
  const brand = brandSearchParam === BRANDS.AAG ? BRANDS.AAG : BRANDS.NWG;
  return useGetActiveOptionsQuery({ brand }, { skip: !signingSecret });
};
