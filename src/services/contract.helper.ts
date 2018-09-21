import Web3 from 'web3';
import fs from 'fs';
import solc from 'solc';
// import net from 'net';

export function connectToWeb3Provider(providerUrl: string = `http://${process.env.HOSTNAME_ETH_NODE || 'localhost'}:8545`): Web3 {
  
  const provider = new Web3.providers.HttpProvider(providerUrl);
  //const provider = new Web3.providers.IpcProvider('/var/folders/z9/72tzgdss7sxcj8_bc1snpzmr0000gn/T/geth.ipc', net);
  return new Web3(provider);
}

export function readSolFile(path: string = './contracts/simple_storage.sol') {
  if (!path.endsWith('.sol')) throw Error("The path specified refers to the wrong file type. Use the .sol extension.");
  const contract = fs.readFileSync(path, 'utf-8');
  return contract.toString();
}

export function compileSolContract(input, contractName) {
  const output = solc.compile(input, 1);
  if(!output) throw Error('The solc compiler returned an empty output');

  const contract = output.contracts[':' + contractName];
  if(!contract) throw Error("The contract with the specificed name " + contractName + "Could not be found");

  return contract;
}

export function getByteCode(contract) {
  if(!contract.bytecode) throw Error('bytecode is undefined');
  return '0x' + contract.bytecode;
}

export function getJsonInteface(contract) {
  if(!contract.interface) throw Error('jsonInterface is undefined')
  return JSON.parse(contract.interface);
}
  
export function prepareContract(filePath = 'contracts/negotiation.sol', contractName = 'Negotiation') {
  const input = readSolFile(filePath);
  const contract = compileSolContract(input, contractName);
  const bytecode = getByteCode(contract);
  const jsonInterface = getJsonInteface(contract);
  return { jsonInterface, bytecode, gas: contract.gasEstimates && contract.gasEstimates.creation };
}

export default module.exports;