import Parser from 'papaparse';
import fs from 'fs';


const initialize = () => {
  console.log('Initializing...');
  console.log('Attemping to read the CSV portfolio');

  const csvPath = 'data/portfolio.csv'

  const dirCheck = fs.existsSync(csvPath);
  if (!dirCheck) return console.log('No CSV file found. Please create a portfolio.csv file in the data folder.');
  
  const stream = fs.createReadStream(csvPath);

  Parser.parse(stream, {
    header: true,
    complete: function (results) {
      const data = JSON.stringify(results['data'], null, 2);
      fs.writeFileSync('data/portfolio.json', data);
    },
  });

  console.log('Done!');
};

export default initialize;