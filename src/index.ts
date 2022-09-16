import * as dotenv from 'dotenv';
import initialize from './initialize';
dotenv.config();

const main = async () => {
  initialize();
};


main().catch((error) => {
  console.error(error);
});
