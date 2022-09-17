import axios, { Axios, AxiosInstance } from 'axios';
import dayjs from 'dayjs';
const { CC_API_KEY } = process.env;

export enum Currency {
  USD = 'USD',
}
interface IParams {
  fsym?: string;
  tsyms: Currency.USD;
  ts?: number;
  fsyms?: string;
}

export interface IApi {
  getSingleHistoricalPrice: (token: string, ts: number) => Promise<IGetPriceResp>;
  getMultipleCurrentPrice: (tokens: string[]) => Promise<IGetPriceResp>;
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
  public getSingleHistoricalPrice = async (token: string, ts: number) => {
    const params: IParams = {
      fsym: token,
      ts,
      tsyms: Currency.USD,
    };
    
    const { data } = await this.instance.get<IGetPriceResp>('pricehistorical', { params });

    return data;
  };

  public getMultipleCurrentPrice = async (tokens: string[]) => {
    const params: IParams = {
      fsyms: tokens.join(',').trim(),
      tsyms: Currency.USD,
    };

    const { data } = await this.instance.get<IGetPriceResp>('pricemulti', { params });

    return data;
  };
}
