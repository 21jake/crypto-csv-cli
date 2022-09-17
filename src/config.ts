export enum Commands {
  INSPECT = 'inspect',
  EXIT = 'exit',
  HELP = 'help',
}
export enum ArgKeys {
  INSPECT = '-isp',
  DATE = '-d',
  TOKEN = '-t',
  EMPTY = '<empty>',
}
export type Args = {
  [keys in ArgKeys | string]: string;
};

type ICommandsHierachy = {
  [keys in Commands]: {
    description: string;
    args: Args | null;
  };
};

export const commandsHierachy: ICommandsHierachy = {
  [Commands.EXIT]: {
    description: 'Exit the CLI',
    args: null,
  },
  [Commands.HELP]: {
    description: 'Display this help panel',
    args: null,
  },

  [Commands.INSPECT]: {
    description: "Inspect the portfolio. See below for available arguments key. Key and value must be separated by a space",
    args: {
      [ArgKeys.DATE]: 'Filter by date. Format: <YYYY/MM/DD>',
      [ArgKeys.TOKEN]: 'The token to inspect. If not provided, all tokens will be inspected',
      [ArgKeys.EMPTY]: 'If no arguments are provided, the portfolios latest state will be displayed',
    },
  },
};


// timestamp	transaction_type	token	amount


// 1600362000	DEPOSIT	BTC	3          10945.14
// 1615136400	WITHDRAWAL	BTC 1      50964.18
// 1651683600	DEPOSIT	BTC	3          39680.21
// 1654621200	WITHDRAWAL	BTC	4      31111.75
// ================
// 1652806800	DEPOSIT	ETH	4             2089.29
// 1662570000	WITHDRAWAL	ETH	3         1630
// 1662570000	WITHDRAWAL	ETH	3         1630
// 1655485200	DEPOSIT	ETH	2             1085.21


// Current State: BTC 1 19843.58, ETH 1 1429.45; Total: 21273.03
// If no token left or negative, just return 0
// If positive, token * current price
