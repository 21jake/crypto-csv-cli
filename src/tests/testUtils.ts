import { Api, Currency } from '../Apis';
import portfolio from '../data/portfolio.json';
import { TInspectionResult } from '../PortfolioTracker';
import { IRecord, TxType } from '../typings/record';

const countToken = (tokenRecords: IRecord[]) => {
  let tokenCount = tokenRecords.reduce((acc, { transaction_type, amount }) => {
    if (transaction_type === TxType.DEPOSIT) {
      return acc + Number(amount);
    }
    return acc - Number(amount);
  }, 0);

  if (tokenCount <= 0) {
    tokenCount = 0;
  }
  return tokenCount;
};

export const inspectSingle = async (symbol: string, ts?: number): Promise<TInspectionResult> => {
  const api = new Api();

  const tokenRecords = portfolio.filter(({ token, timestamp }) => {
    const similarSymbol = token === symbol;
    const beforeChosenDate = timestamp <= Number(ts);
    return ts ? similarSymbol && beforeChosenDate : similarSymbol;
  });

  const tokenCount = countToken(tokenRecords);
  const price = await api.getSymbolPrice(symbol, ts);
  const value = price[symbol][Currency.USD] * tokenCount;
  return { value, tokenCount };
};

export const inspectMany = async (ts?: number): Promise<TInspectionResult[]> => {
  const uniqueSymbols = Array.from(new Set(portfolio.map(({ token }) => token)));
  const promises = uniqueSymbols.map((symbol) => inspectSingle(symbol, ts));
  const results = await Promise.all(promises);
  return results;
};
