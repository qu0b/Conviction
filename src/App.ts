import Web3 from 'web3';
import { Offer, IpfsAddResponse } from 'model';
import * as fs from 'fs';
import fetch from 'cross-fetch';
import FormData from 'form-data';
import { read } from 'fs-extra';
const solc = require('solc');

const consumerAddr = '0x0010BAabF441741D621e3Aa7de565E0Dd7453555';
const providerAddr = '0x0062d2F9500295b6Bb0A0E4C3Be28523B11f0d9A';
const testAcc = '0x006635837021Ca02cD930380329D5991A223de0b';


function connectToWeb3Provider(providerUrl: string = 'http://localhost:8545' ): Web3 {
  //TODO: check if connection already exists (cache web3 instance)
  const httpProvider = new Web3.providers.HttpProvider(providerUrl);
  return new Web3(httpProvider);
}

function checkWeb3Connection() {
  const web3 = connectToWeb3Provider();
  web3.eth.net.isListening().then(console.log);
}

function readContract() {
  const contract = fs.readFileSync('/Users/stefan/Documents/Semester 4/Master arbeit/Implementation/Conviction/contracts/simple_storage.sol', 'utf-8');
  return contract;
}

function createContract(web3: any, jsonInterface: string) {
   return new web3.eth.Contract(jsonInterface, '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
    from: testAcc, // default from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
  });
}

function callContract() {

}

function addAgreement(contractAddress: string, agreementHash: string) {

}

function loadExampleFile(): Buffer {
  return fs.readFileSync('./exampleFile.xml');
}

function writeXMLToIPFS(xml: Buffer): any {
  let data: any = new FormData();
  data.append('agreement', xml);
  return fetch("http://localhost:5001/api/v0/add", {
    method: "POST",
    body: data
  })
  .then(res => res.json())
  .catch(err => err);
  
}

function readXMLFromIPFS(hash: string): Promise<string> {
  return fetch(`http://localhost:5001/api/v0/cat?arg=${hash}`, {
    method: "GET"
  })
  .then(res => res.text())
  .catch(err => err);
}


function store(offer: Offer = {}) {

}

function retrieve(hash: string = "") {

}

async function main() {
  try {
    // const xml = loadExampleFile();
    // const writeResponse: IpfsAddResponse = await writeXMLToIPFS(xml);
    // console.log(writeResponse);
    // const readResponse = await readXMLFromIPFS(writeResponse.Hash);
    // console.log(readResponse);
    const web3 = connectToWeb3Provider();
    const input = readContract();
    const output = solc.compile(input, 1);
    let jsonInterface= '';
    let bytecode = '0x';
    for(const contractName in output.contracts) {
      jsonInterface = output.contracts[contractName].interface
      bytecode += output.contracts[contractName].bytecode
    }
    const contract = createContract(web3, JSON.parse(jsonInterface));
    contract.deploy({
      data: bytecode,
      arguments: [5]
    }).send({
      from: testAcc,
      gas: 1000000,
      gasPrice: '20000000000'

    }).then((newContractInstance: any) => {
      console.log(newContractInstance.options.address) // instance with the new contract address
  }).catch(err => console.log(err));

  } catch(err) {
    console.log(err);
  }
}

main();
