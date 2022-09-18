import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';
const { CC_API_KEY } = process.env;

export enum Currency {
  USD = 'USD',
}
interface IParams {
  fsym: string;
  tsyms: Currency.USD;
  ts: number;
}

export interface IApi {
  getSymbolPrice: (token: string, ts?: number) => Promise<IGetPriceResp>;
}
export interface IGetPriceResp {
  [key: string]: {
    [Currency.USD]: number;
  };
}

export class Api implements IApi {
  instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://min-api.cryptocompare.com/data',
      timeout: 5000,
      headers: {
        authorization: `Apikey ${CC_API_KEY}`,
      },
    });
  }

  public getSymbolPrice = async (token: string, ts: number = dayjs().unix()): Promise<IGetPriceResp> => {
    // If no ts is provided, get current price
    const params: IParams = {
      fsym: token,
      ts,
      tsyms: Currency.USD,
    };

    const { data } = await this.instance.get<IGetPriceResp>('pricehistorical', { params });
    return data
  }

}
