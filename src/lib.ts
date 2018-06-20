import Web3 from 'web3';
import { Offer, IpfsAddResponse } from 'model';
import * as fs from 'fs';
import fetch from 'cross-fetch';
import FormData from 'form-data';
import * as solc from 'solc';

interface Conviction {
  web3: Web3
  deployAccount?: string;
  [name: string]: any
}

function connectToWeb3Provider(providerUrl: string = 'http://localhost:8545'): Web3 {
  // if (!this.web3) {
  const httpProvider = new Web3.providers.HttpProvider(providerUrl);
  return new Web3(httpProvider);
  // } else {
  // return this.web3;
  // }
}

function readContract(filePath: string = './contracts/simple_storage.sol') {
  if (!filePath.endsWith('.sol')) throw Error("The path specified referes to the wrong file type. Use the .sol extension.");
  const contract = fs.readFileSync(filePath, 'utf-8');
  return contract;
}

function createContract(this: Conviction, jsonInterface: any[]) {
  if (!(this && this.web3)) throw new Error('No web3 client specified, bind it to the function');
  return new this.web3.eth.Contract(jsonInterface, '', {
    from: this.deployAccount, // default from address
    gasPrice: 10000000000, // default gas price in wei, 20 gwei in this case
  });
}

function deployContract(this: Conviction, contract, bytecode) {
  return new Promise((resolve, reject) => {
    contract
      .deploy({
        data: bytecode,
        arguments: [5],
      })
      .send({
        from: this.deployAccount,
        gas: 1500000,
        gasPrice: '10000000000',
      })
      .then((newContractInstance: any) => {
        resolve(newContractInstance.options.address);
      })
      .catch((err) => reject(err));
  });
}

function loadExampleFile(): Buffer {
  return fs.readFileSync('./exampleFile.xml');
}

function writeXMLToIPFS(xml: Buffer, baseURL: string = 'http://localhost:5001/api/v0/'): Promise<IpfsAddResponse> {
  const data: any = new FormData();
  data.append('agreement', xml);
  return fetch(`${baseURL}add`, {
    method: 'POST',
    body: data,
  })
    .then((res) => res.json())
    .catch((err) => err);
}

function readXMLFromIPFS(hash: string, baseURL, string = 'http://localhost:5001/api/v0/'): Promise<string> {
  return fetch(`${baseURL}cat?arg=${hash}`, {
    method: 'GET',
  })
    .then((res) => res.text())
    .catch((err) => err);
}

async function store(this: Conviction, offer: Offer): Promise<string> {
  try {
    const response = await this.ipfs.write(offer.document, this.ipfs.baseURL);
    if (typeof response.Hash === 'string') {
      return response.Hash;
    } else {
      return '';
    }
  } catch (err) {
    console.log('could not write file to IPFS', err);
    return '';
  }
}
async function retrieve(this: Conviction, hash: string = '') {
  try {
    const response = await this.ipfs.read(hash, this.ipfs.baseURL);
    return response;
  } catch (err) {
    console.log('could not read file from IPFS', err);
    return '';
  }
}
function loadContract(contractPath: string = '') {
  const input = readContract(contractPath);
  const output = solc.compile(input.toString(), 1);
  const contracts: Array<{ jsonInterface: any[]; bytecode: string }> = [];

  for (const contractName in output.contracts) {
    const jsonInterface = JSON.parse(output.contracts[contractName].interface);
    const bytecode = '0x' + output.contracts[contractName].bytecode;
    contracts.push({ jsonInterface, bytecode });
  }
  return contracts;
}

async function pushContract(this: Conviction, contract: { jsonInterface: any[]; bytecode: string; }) {
  const contractInstance = this.create(contract.jsonInterface);
  const address = await this.deploy(contractInstance, contract.bytecode);
  return address;
}

function createConviction(ipfsURL: string = 'http://localhost:5001/api/v0/', web3URL: string = 'http://localhost:8545') {
  const conviction = {
    web3: connectToWeb3Provider(web3URL),
    deployAccount: '0x00D6B14Ff6A34B539FF59f1fFD297525bbcA42b7',
    push: pushContract,
    deploy: deployContract,
    create: createContract,
    load: loadContract,
    ipfs: {
      baseURL: ipfsURL,
      read: readXMLFromIPFS,
      write: writeXMLToIPFS
    },
    retrieve,
    store,
    connectToWeb3Provider,
    loadExampleFile
  };
  return conviction;
}


export default createConviction;
