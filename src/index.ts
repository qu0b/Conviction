import { writeBuffer } from './services/ipfs.helper';
import { loadExampleFile } from './services/misc.helper';
import { connectToWeb3Provider, prepareContract } from './services/contract.helper';
import NegotiationAgent from './agents/negotiation.agent';
import moment from 'moment';

const initiator = '0x00a329c0648769a73afac7f9381e08fb43dbea72';
const responder = '0xa63c2558080a784b1cffc9ef345b1c8f967dc71d';
const ipfsURL: string = 'http://localhost:5001/api/v0/';
const providerURL: string = 'http://localhost:8545';
const negotiationContractPath = 'contracts/negotiation2.sol';
const agent = setup(initiator);

async function ipfsExample() {
  const example = loadExampleFile();
  const { Hash, Name, Size } = await writeBuffer(example, ipfsURL);
  return Hash;
}

export function setup(initiator) {
  const web3 = connectToWeb3Provider(providerURL);
  return new NegotiationAgent(web3, initiator);
}

export async function deployContract(contractName, contractPath, args) {
  try {
    const contract = prepareContract(contractPath, contractName);
    const newContract: any = await agent.deploy(contract, args);
    console.log('contract created', newContract._address);
    
    return newContract;
  } catch(error) {
    console.log(error);
  }
}


export function randomDuration() {
 return moment.duration(Math.floor(Math.random() * 5) + 10, 'seconds').asSeconds()
}

export function randomDeposit() {
  return Math.floor(Math.random() * 100000000000) + 1000000000
}

export function randomState(): number {
  return Math.floor(Math.random() * 8);
}

export function randomIPFSFile() {
  return ipfsExample();
}

export async function randomOffer() {
  const hash = await randomIPFSFile();
 return [hash, randomDeposit(), randomDuration(), randomState()];
}

async function randomCounterOffer(index) {
  return [0, ]
}

export async function sampleNegotiation(initiator, responder, negotiationEnd) {
  console.log("Starting up a sample negotiation");
  const consumerAgent = setup(initiator);
  const providerAgent = setup(responder);
  await consumerAgent.authenticate('');
  console.log("Creating a negotiation contract")
  const contract = await deployContract('Negotiation', negotiationContractPath, [
      responder,
      negotiationEnd, 
      true
    ]);
    consumerAgent.contract = contract;
    providerAgent.contract = contract;
    const [hash, deposit, duration, state] = await randomOffer();
    console.log(" creating offer: ", hash, deposit, duration, state);
    await consumerAgent.authenticate('');
    const index = await consumerAgent.offer(hash, deposit, duration);
    const offerMade = await consumerAgent.getOffer(0);
    
    await providerAgent.authenticate('');
    const id = 0, nextState = 5;
    const counterOffer = await providerAgent.counterOfferState(id, hash, nextState);
    const counterOfferMade = await consumerAgent.getOffer(0);
    console.log(index, counterOffer, offerMade, counterOfferMade);

    await consumerAgent.authenticate('');
    const depositMade = await consumerAgent.deposit(0, deposit);
    let balance = await consumerAgent.getContractBalance();
    console.log('balance:', balance, '\n', 'deposit:', depositMade);
    
    await providerAgent.authenticate('');
    console.log('balance before: ',await providerAgent.getBalance());
    await providerAgent.withdraw(0);
    console.log('balance after: ', await providerAgent.getBalance());
    console.log('done');
    
}

// async function main() {
//   try {

//     await sampleNegotiation(initiator, "0x4a6dc979139b694b5f65e8b14a61ba5280537b94", moment().add('1', 'weeks').unix())
//     // console.log(await agent.authenticate(''));
    

//     // const exampleHash = await ipfsExample();
//     // await agent.set(prepareContract(negotiationContractPath, 'Negotiation'), currentTestContract);
//     // // const response = await agent.negotiationEnd();
//     // // const response = await agent.offer(exampleHash, 7, 102, 3, 40, moment.duration(2, 'weeks').asSeconds(), 1);
//     // // console.log(response);
//     // const item = await agent.getOffer(-1);
//     // console.log(item);
  
//   } catch(err) {
//     console.log(err);
//   }
//   console.log('done');
// }

// main();