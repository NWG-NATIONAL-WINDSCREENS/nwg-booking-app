import { simulateLoading } from '../../_utils/api-utils.js';

jest.useFakeTimers();

describe('simulateLoading', () => {
  it('should resolve after 500ms', async () => {
    const promise = simulateLoading();

    jest.advanceTimersByTime(500);

    await expect(promise).resolves.toBeUndefined();
  });
});
