export enum TxType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
  }
  export interface IRecord {
    transaction_type: TxType;
    amount: string;
    token: string;
    timestamp: string;
  }
  