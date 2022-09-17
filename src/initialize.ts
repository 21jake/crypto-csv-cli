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
  const json = JSON.stringify(parsed, null, 2);
  fs.writeFileSync('src/data/portfolio.json', json);
};

const initialize = () => {
  try {
    console.log('Initializing...');
    const stream = read();

    parse(stream, {
      header: true,
      dynamicTyping: true,      
      complete: function (results: ParseResult<IRecord>) {
        if (results.errors.length > 0) throw results.errors;
        write(results.data);
      },
    });

    console.log('Initialization done!');
  } catch (error) {
    throw `Error in initializing portfolio: ${error}`;
  }
};

export default initialize;
