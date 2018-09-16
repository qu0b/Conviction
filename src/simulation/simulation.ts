// import { loadExampleFile } from '../services/misc.helper';
// import { connectToWeb3Provider, prepareContract } from '../services/contract.helper';
// import NegotiationAgent from '../agents/negotiation.agent';
// import moment from 'moment';

// const url = 'mongodb://localhost:27017';
// const currentTestContract = '0xa6ab5ddF87fcc0ae350B6e234D84f9e22F968DFC';

// // const initiator = '0x00D6B14Ff6A34B539FF59f1fFD297525bbcA42b7';
// let initiator = '';
// let responder = '';
// let ipfsURL: string = 'http://localhost:5001/api/v0/';
// let providerURL: string = 'http://localhost:8545';
// let agreementContractPath = 'contracts/agreement.sol';
// let negotiationContractPath = 'contracts/negotiation2.sol';
// let agent

const initiate = () => {
  // console.log('initiate');
  
  // const node =  document.getElementById('initiator') as HTMLInputElement || "";
  // initiator = node.value;
}


const getContracts = async () => {
     
}

// async function setup() {
//   console.log('main');
//   initiate();
//   await getContracts();
// }

// setup();

const getOffer = async () => {
  const contractInputElement = document.getElementById('contract');
  const offerInputElement = document.getElementById('offerId');
  if(contractInputElement && offerInputElement) {
    const contractId = (contractInputElement as HTMLInputElement).value;
    const offerId = (offerInputElement as HTMLInputElement).value;
    
    if(contractId && offerId) {
      let result = await fetch(`http://localhost:8080/contract/${contractId}/offer/${offerId}`);
      result = await result.json();
      console.log(result);
      
      const field = document.getElementById('offerField');
      if(field) {
        (field as HTMLPreElement).innerHTML = '<code>' + JSON.stringify(result, null, 4) + '</code>';
      }

    } else {
      alert('please specify the contract address and the offerId')
    }
  }

  
}


// const address = '0x91E8263CE5aA842c6C841aCc714ECD5970F8E2D4';
// const address = '0xD7eBd04081923e01D64A5F318303235BF2cd0c5f';

// async function ipfsExample() {
//   const example = loadExampleFile();
//   const { Hash, Name, Size } = await writeBuffer(example, ipfsURL);
//   return Hash;
// }

// function setup() {
//   const web3 = connectToWeb3Provider(providerURL);
//   return new NegotiationAgent(web3, initiator);
// }

// async function deployContract(contractName, contractPath, args) {
//   try {
//     const contract = prepareContract(contractPath, contractName);
//     const newContract: any = await agent.deploy(contract, args);
//     console.log('contract created', newContract._address);
    
//     await callDatabase(async (db) => {
//       await db.collection('contracts').insertOne({
//         name: contractName,
//         compiled: contract,
//         timestamp: moment().format(),
//         address: newContract._address, 
//         methods: Object.keys(newContract.methods), 
//         options: newContract.options
//       });
//       console.log('insert complete');
//     });
//   } catch(error) {
//     console.log(error);
//   }
// }

// async function main() {
//   try {

//     simulation();
//     // console.log(await agent.authenticate(''));
//     // await deployContract('Negotiation', negotiationContractPath, [
//     //   responder,
//     //   moment().add(1, 'months').unix(), 
//     //   true
//     // ]);

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


















