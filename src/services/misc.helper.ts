import fs from 'fs';

export function loadExampleFile(): Buffer {
  return fs.readFileSync('exampleFile.xml');
}


// function init(ipfsURL: string = 'http://localhost:5001/api/v0/', web3URL: string = 'http://localhost:8545') {

// }

export default module.exports;