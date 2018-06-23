// import lib, { decodeIPFSHash } from './lib';
// import { Offer } from 'model';
// import Web3 from 'web3';



// async function storeAgreement(conviction, agreement) {
//   try {
//     const hash = await conviction.store(agreement);
//     const dhash = decodeIPFSHash(hash);
//   } catch(err) {
//     return Error('Cloud not store the example file to IPFS')
//   }
// }

// async function main() {
//   const conviction = lib();
//   const document = conviction.loadExampleFile();
//   const agreement: Offer = { name: 'test', document };
//   try {
//     const web3: Web3 = conviction.web3;

//     // web3.eth.personal.newAccount('').then(console.log).catch(err => console.log(err));
//     // web3.eth.personal.getAccounts().then(console.log)

//     // Store an Agreement
//     const hash = await storeAgreement(conviction, agreement)

//     // Retrieve an agreement
//     // const file = await conviction.retrieve(hash);
//     // console.log(file);

//     // Write a contract.
//     const path = "contracts/simple_storage.sol";
//     const contracts = conviction.load(path);
//     if (!(contracts.length === 1)) throw Error('Only one contract can be specified in a file');
//     const contract = contracts[0];

//     const valid = await web3.eth.personal.unlockAccount(conviction.deployAccount, process.env.lol);
//     if (!valid) throw Error('Could not login');
//     const address = await conviction.push(contract, dhash);
//     console.log('address:', address);
//   } catch (err) {
//     console.log(err);
//   }
// }

// function callContract() {
//   const contractAddress = "0x240aa1EE0F07447Ec36e82B07073dFA25d6aBC8D";

//   const { web3, deployAccount, load } = lib();

//   const myContract = load('contracts/simple_storage.sol', contractAddress);
//   console.log(myContract);
  

// }

// callContract();
// // main();


// import Web3 from 'web3';
// import { Offer, IpfsAddResponse } from 'model';
// import * as fs from 'fs';
// import fetch from 'cross-fetch';
// import FormData from 'form-data';
// import * as solc from 'solc';
// import base58 from 'bs58';










// async function store(ipfs, offer: Offer): Promise<string> {
//   const { write, baseURL } = ipfs;
//   try {
//     const response = await write(offer.document, baseURL);
//     if (typeof response.Hash === 'string') {
//       return response.Hash;
//     } else {
//       return '';
//     }
//   } catch (err) {
//     console.log('could not write file to IPFS', err);
//     return '';
//   }
// }

// async function retrieve(this: Conviction, hash: string = '') {
//   try {
//     const response = await this.ipfs.read(hash, this.ipfs.baseURL);
//     return response;
//   } catch (err) {
//     console.log('could not read file from IPFS', err);
//     return '';
//   }
// }

// function init(ipfsURL: string = 'http://localhost:5001/api/v0/', web3URL: string = 'http://localhost:8545') {
//   const conviction = {
//     web3: connectToWeb3Provider(web3URL),
//     deployAccount: '0x00D6B14Ff6A34B539FF59f1fFD297525bbcA42b7',
//     contract: {
//       deploy,
//       compile
//     },
//     ipfs: {
//       baseURL: ipfsURL,
//       read: readXMLFromIPFS,
//       write: writeXMLToIPFS
//     },
//     retrieve,
//     store,
//     connectToWeb3Provider,
//     loadExampleFile
//   };
//   return conviction;
// }


// export default init;
