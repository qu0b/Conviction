import * as fs from 'fs';
import { read } from 'fs-extra';
const solc = require('solc');


function readContract() {
  const contract = fs.readFileSync('/Users/stefan/Documents/Semester 4/Master arbeit/Implementation/Conviction/contracts/simple_storage.sol', 'utf-8');
  return contract;
}

function compileContract() {

}

function test() {
  const input = readContract();
  const output = solc.compile(input, 1);
  console.log(output);
}

test();