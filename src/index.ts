import * as dotenv from 'dotenv';
import { Cli } from './Cli';
import initialize from './initialize';

dotenv.config();

const main = async () => {
  initialize();
  const cli = new Cli();
  cli.greet();
  cli.read();
};

main().catch((error) => {
  console.error(error);
});
