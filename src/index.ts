import { writeBuffer } from './services/ipfs.helper';
import { loadExampleFile } from './services/misc.helper';
import { connectToWeb3Provider, prepareContract } from './services/contract.helper';
import NegotiationAgent from './agents/negotiation.agent';
import moment from 'moment';

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

const currentTestContract = '0xa6ab5ddF87fcc0ae350B6e234D84f9e22F968DFC';

async function callDatabase(method: (db) => void) {
  try {
    const client =  await MongoClient.connect(url);
    const db = client.db('Conviction');
    await method(db);
    client.close();
  } catch(err) {
    console.log(err);
  }
}

const initiator = '0x00D6B14Ff6A34B539FF59f1fFD297525bbcA42b7';
const responder = '0xa63c2558080a784b1cffc9ef345b1c8f967dc71d';
const ipfsURL: string = 'http://localhost:5001/api/v0/';
const providerURL: string = 'http://localhost:8545';
const agreementContractPath = 'contracts/agreement.sol';
const negotiationContractPath = 'contracts/negotiation2.sol';
const agent = setup();

// const address = '0x91E8263CE5aA842c6C841aCc714ECD5970F8E2D4';
// const address = '0xD7eBd04081923e01D64A5F318303235BF2cd0c5f';

async function ipfsExample() {
  const example = loadExampleFile();
  const { Hash, Name, Size } = await writeBuffer(example, ipfsURL);
  return Hash;
}

function setup() {
  const web3 = connectToWeb3Provider(providerURL);
  return new NegotiationAgent(web3, initiator);
}

async function deployContract() {
  try {
    const contractName = 'Negotiation';
    // const bool = await agent.authenticate(process.env.ETH_PW);
    const negotiationEnd = moment().add(1, 'months').unix();
    const contract = prepareContract(negotiationContractPath, contractName);
    const newContract: any = await agent.deploy(contract, [responder, negotiationEnd, true]);

    await callDatabase(async (db) => {
      await db.collection('contracts').insertOne({
        name: contractName,
        compiled: contract,
        timestamp: moment().format(),
        address: newContract._address, 
        methods: Object.keys(newContract.methods), 
        options: newContract.options
      });
      console.log('insert complete');
    });
  } catch(error) {
    console.log(error);
  }
}

async function main() {
  try {
    await deployContract();

    // const exampleHash = await ipfsExample();
    // await agent.set(prepareContract(negotiationContractPath, 'Negotiation'), currentTestContract);
    // // const response = await agent.negotiationEnd();
    // // const response = await agent.offer(exampleHash, 7, 102, 3, 40, moment.duration(2, 'weeks').asSeconds(), 1);
    // // console.log(response);
    // const item = await agent.getOffer(-1);
    // console.log(item);
    
  
  
  
  
  
  
  
  
  
  } catch(err) {
    console.log(err);
  }



  console.log('done');
}

main();