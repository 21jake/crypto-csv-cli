import { expect } from 'chai';
import dayjs from 'dayjs';
import { ArgKeys, Args } from '../config';
import initialize from '../initialize';
import { PortfolioTracker } from '../PortfolioTracker';
import { inspectMany, inspectSingle } from './testUtils';

describe('Portfolio inspection suite', () => {
  before(() => {
    initialize();
  });

  it('If no argument specified, latest portfolio value shall be inspected', async () => {
    const args: Args = {};
    const tracker = new PortfolioTracker(args);
    const expected = await inspectMany();
    const expectedSum = expected.reduce((acc, { value }) => acc + value, 0);
    const actualSum = await tracker.track();

    expect(Math.abs(actualSum - expectedSum)).to.not.greaterThan(0.01 * actualSum);

    /**
     * 1663485660 is the timestamp at the time of writing this test
     * Since the API returns inconsistent price result for current TS, allow a 0.01% difference between the `actualySum` and `expectedSum`
        /data/pricehistorical?fsym=ETH&ts=1663485660&tsyms=USD
        { ETH: { USD: 1455.41 } } result.data
        ------------------------
        /data/pricehistorical?fsym=BTC&ts=1663485660&tsyms=USD
        { BTC: { USD: 20068.2 } } result.data
        ------------------------
        /data/pricehistorical?fsym=BTC&ts=1663485660&tsyms=USD
        { BTC: { USD: 20076.42 } } result.data
        ------------------------
        /data/pricehistorical?fsym=ETH&ts=1663485660&tsyms=USD
        { ETH: { USD: 1454.9 } } result.data
     */
  });

  it('If only date is specified, portfolio value at that date shall be inspected', async () => {
    const specifiedDate = '2022/06/05';
    const args: Args = {
      [ArgKeys.DATE]: specifiedDate,
    };
    const tracker = new PortfolioTracker(args);
    const specifiedDateTs = dayjs(specifiedDate).unix();
    const expected = await inspectMany(specifiedDateTs);
    const expectedSum = expected.reduce((acc, { value }) => acc + value, 0);
    const actual = await tracker.track();
    expect(expectedSum).to.equal(actual);
  });

  it('If both date and symbol is specified, portfolio value at that date of that currency shall be inspected', async () => {
    const specifiedDate = '2022/06/05';
    const specifiedSymbol = 'BTC';
    const args: Args = {
      [ArgKeys.DATE]: specifiedDate,
      [ArgKeys.TOKEN]: specifiedSymbol,
    };
    const tracker = new PortfolioTracker(args);
    const specifiedDateTs = dayjs(specifiedDate).unix();
    const expected = await inspectSingle(specifiedSymbol, specifiedDateTs);
    const actual = await tracker.track();
    expect(expected.value).to.equal(actual);
  });

  it('If only symbol is specified, latest portfolio value of that currency shall be inspected', async () => {
    const specifiedSymbol = 'BTC';
    const args: Args = {
      [ArgKeys.TOKEN]: specifiedSymbol,
    };
    const tracker = new PortfolioTracker(args);
    const actual = await tracker.track();
    const expected = await inspectSingle(specifiedSymbol);
    expect(Math.abs(actual - expected.value)).to.not.greaterThan(0.01 * actual);
  });
});
