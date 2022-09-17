export enum TxType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
  }
  export interface IRecord {
    transaction_type: TxType | string;
    amount: number;
    token: string;
    timestamp: number;
  }
  