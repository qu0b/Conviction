import Web3 from 'web3';
import fs from 'fs';
import solc from 'solc';

export function connectToWeb3Provider(providerUrl: string = 'http://localhost:8545'): Web3 {
  const httpProvider = new Web3.providers.HttpProvider(providerUrl);
  return new Web3(httpProvider);
}

export function readContract(filePath: string = './contracts/simple_storage.sol') {
  if (!filePath.endsWith('.sol')) throw Error("The path specified refers to the wrong file type. Use the .sol extension.");
  const contract = fs.readFileSync(filePath, 'utf-8');
  return contract;
}

// compiles and returns the first contract in the specified file.
export function compile(contractPath: string = '') {
  const input = readContract(contractPath);
  const output = solc.compile(input.toString(), 1);
  const contracts: Array<any> = Object.values(output.contracts);
  if(!contracts.length) throw Error('The file path you provided contains no contracts');
  const contract = contracts[0];
  const jsonInterface = JSON.parse(contract.interface);
  const bytecode = '0x' + contract.bytecode;
  return { jsonInterface, bytecode, address: '' };
}

export default module.exports;