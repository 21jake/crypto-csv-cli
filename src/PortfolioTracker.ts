import dayjs from 'dayjs';
import { Api, Currency, IApi } from './apis';
import { ArgKeys, Args } from './config';
import portfolio from './data/portfolio.json';
import { IRecord, TxType } from './typings/record';

interface IPortfolioTracker {
  track: () => Promise<void>;
}
type TInspectionResult = { value: number; tokenCount: number };
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

      const { [ArgKeys.DATE]: date, [ArgKeys.TOKEN]: token } = this.args;

      if (date) {
        this.validateDate(date);
      }

      const dateTs = dayjs(date).unix();

      if (noArgs) {
        const totalValuePerTokens = await this.inspectSymbols();
        const sum = totalValuePerTokens.reduce((acc, { value }) => acc + value, 0);
        return console.log(`Latest portfolio value: $${sum}`);
      }

      if (date && token) {
        const { value, tokenCount } = await this.inspectSymbol(token, dateTs);
        return console.log(`Value of ${tokenCount} ${token} in the portfolio by ${date}: $${value}`);
      }

      if (token) {
        const { value, tokenCount } = await this.inspectSymbol(token);
        return console.log(`Current value of ${tokenCount} ${token} in the portfolio :$${value}`);
      }

      if (date) {
        const totalValuePerTokens = await this.inspectSymbols(dateTs);
        const sum = totalValuePerTokens.reduce((acc, { value }) => acc + value, 0);
        return console.log(`Total value the portfolio by ${date}: $${sum}`);
      }
    } catch (error) {
      throw `Error in tracking portfolio: ${error}`;
    }
  }

  private inspectSymbols = async (ts?: number): Promise<TInspectionResult[]> => {
    const uniqueSymbols = Array.from(new Set(portfolio.map((e) => e.token)));
    const promises = uniqueSymbols.map((symbol) => this.inspectSymbol(symbol, ts));
    const results = await Promise.all(promises);
    return results;
  };

  private inspectSymbol = async (symbol: string, ts?: number): Promise<TInspectionResult> => {
    try {
      // Filter out the token from portfolio. If a date is specified, exclude records that happened after the date
      const tokenRecords = portfolio.filter((e) => {
        const similarSymbol = e.token === symbol;
        const beforeChosenDate = e.timestamp <= Number(ts);
        return ts ? similarSymbol && beforeChosenDate : similarSymbol;
      });
      if (!tokenRecords.length) {
        const textIfDateSpecified = ts ? ` before ${dayjs.unix(ts).format('YYYY-MM-DD')}` : '';
        console.log(`No records found for the symbol: '${symbol}' ${textIfDateSpecified}`);
      }
      const tokenCount = this.countToken(tokenRecords);
      const price = await this.api.getSymbolPrice(symbol, ts);
      const value = price[symbol][Currency.USD] * tokenCount;
      return { value, tokenCount };
    } catch (error) {
      throw `Error in inspecting single token ${ts ? 'on given date ' : ''}: ${error}`;
    }
  };

  private countToken = (tokenRecords: IRecord[]) => {
    let tokenCount = tokenRecords.reduce((acc, { transaction_type, amount }) => {
      if (transaction_type === TxType.DEPOSIT) {
        return acc + Number(amount);
      }
      return acc - Number(amount);
    }, 0);

    // In case there are more withdrawals than deposits, set the token count to 0
    if (tokenCount <= 0) {
      tokenCount = 0;
    }
    return tokenCount;
  };

  private validateDate = (date: string) => {
    const formatted = dayjs(date);
    if (formatted.format('YYYY/MM/DD') !== date) {
      throw `Invalid date '${date}'. Use the <YYYY-MM-DD> format.`;
    }
  };
}
