import { ParseResult, parse } from 'papaparse';
import fs from 'fs';
import { IRecord } from './typings/record';

const read = () => {
  try {
    console.log('Attemping to read the CSV portfolio');
    const csvPath = 'src/data/portfolio.csv';
    const dirCheck = fs.existsSync(csvPath);
    if (!dirCheck) throw 'No portfolio found. Place a portfolio.csv file in the root/src/data folder.';
    return fs.createReadStream(csvPath);
  } catch (error) {
    throw `Error in reading CSV File: ${error}`;
  }
};

const write = (parsed: IRecord[]) => {
  const sorted = parsed.sort((a, b) => a.timestamp - b.timestamp);
  const json = JSON.stringify(sorted, null, 2);

  fs.writeFileSync('src/data/portfolio.json', json);
};

const initialize = () => {
  try {
    console.log('Initializing...');
    const stream = read();

    parse(stream, {
      header: true,
      dynamicTyping: true,
      complete: (results: ParseResult<IRecord>) => {
        if (results.errors.length > 0) {
          console.log(`Error in parsing file. Please check the CSV file: ${JSON.stringify(results.errors)}`);
          throw new Error('Error in parsing file. Please check the CSV file');
        }
        write(results.data);
      },
    });

    console.log('Initialization done!');
  } catch (error) {
    throw `Error in initializing portfolio: ${error}`;
  }
};

export default initialize;
