import dayjs from 'dayjs';
import { Api, Currency, IApi } from './apis';
import { ArgKeys, Args } from './config';
import portfolio from './data/portfolio.json';
import { IRecord, TxType } from './typings/record';

interface IPortfolioTracker {
  track: () => Promise<any>;
}
export class PortfolioTracker implements IPortfolioTracker {
  args: Args;
  api: IApi;

  constructor(args: Args) {
    this.args = args;
    this.api = new Api();
  }

  public async track() {
    try {
      const noArgs = Object.keys(this.args).length === 0;
      if (noArgs) {
        const totalValuePerTokens = await this.inspectAll();
        const sum = totalValuePerTokens.reduce((acc, { value }) => acc + value, 0);
        return console.log(`Latest portfolio value: $${sum}`);
      }
      const { [ArgKeys.DATE]: date, [ArgKeys.TOKEN]: token } = this.args;

      this.validateDate(date);
      
      const dateTs = dayjs(date).unix();

      if (date && token) {
        const { value, tokenCount } = await this.inspectSingleByDate(token, dateTs);
        return console.log(`Value of ${tokenCount} ${token} in the portfolio by ${date}: $${value}`);
      }

      if (token) {
        const { value, tokenCount } = await this.inspectSingle(token);
        return console.log(`Current value of ${tokenCount} ${token} in the portfolio :$${value}`);
      }

      if (date) {
        const totalValuePerTokens = await this.inspectAllByDate(dateTs);
        const sum = totalValuePerTokens.reduce((acc, { value }) => acc + value, 0);
        return console.log(`Total value the portfolio by ${date}: $${sum}`);
      }
    } catch (error) {
      throw `Error in tracking portfolio: ${error}`;
    }
  }

  private inspectAllByDate = async (ts: number): Promise<{ value: number; tokenCount: number }[]> => {
    const uniqueSymbols = Array.from(new Set(portfolio.map((e) => e.token)));
    const promises = uniqueSymbols.map((symbol) => this.inspectSingleByDate(symbol, ts));
    const results = await Promise.all(promises);
    return results;
  };

  private inspectAll = async (): Promise<{ value: number; tokenCount: number }[]> => {
    const uniqueSymbols = Array.from(new Set(portfolio.map((e) => e.token)));
    const promises = uniqueSymbols.map((symbol) => this.inspectSingle(symbol));
    const results = await Promise.all(promises);
    return results;
  };

  private inspectSingleByDate = async (symbol: string, ts: number): Promise<{ value: number; tokenCount: number }> => {
    try {
      // Filter out the token from portfolio. Also exclude records that happened after the given date
      const tokenRecords = portfolio.filter(({ token, timestamp }: IRecord) => token === symbol && timestamp <= ts);
      if (!tokenRecords.length) {
        console.log(`No records found for the symbol: '${symbol}' before ${dayjs.unix(ts).format('YYYY/MM/DD')}`);
      }
      const tokenCount = this.countToken(tokenRecords);
      const price = await this.api.getSingleHistoricalPrice(symbol, ts);
      const value = price[symbol][Currency.USD] * tokenCount;
      return { value, tokenCount };
    } catch (error) {
      throw `Error in inspecting single token on given date: ${error}`;
    }
  };

  private inspectSingle = async (symbol: string): Promise<{ value: number; tokenCount: number }> => {
    try {
      const tokenRecords: IRecord[] = portfolio.filter(({ token }) => token === symbol);
      if (!tokenRecords.length) {
        console.log(`No records found for the symbol: '${symbol}' `);
      }
      const tokenCount = this.countToken(tokenRecords);
      const price = await this.api.getMultipleCurrentPrice([symbol]);
      const value = price[symbol][Currency.USD] * tokenCount;
      return { value, tokenCount };
    } catch (error) {
      throw `Error in inspecting single token: ${error}`;
    }
  };

  private countToken = (tokenRecords: IRecord[]) => {
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

  private validateDate = (date: string) => {
    const formatted = dayjs(date);
    if (formatted.format('YYYY/MM/DD') !== date) {
      throw `Invalid date '${date}'. Use YYYY-MM-DD format.`;
    }
  }
}
