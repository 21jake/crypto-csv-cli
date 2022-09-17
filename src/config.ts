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
      [ArgKeys.DATE]: 'Filter by date. Format: DD/MM/YYYY',
      [ArgKeys.TOKEN]: 'The token to inspect. If not provided, all tokens will be inspected',
      [ArgKeys.EMPTY]: 'If no arguments are provided, the portfolios latest state will be displayed',
    },
  },
};
