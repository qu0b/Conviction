import lib, { decodeIPFSHash } from './lib';
import { Offer } from 'model';
import Web3 from 'web3';

async function main() {
  const conviction = lib();
  const document = conviction.loadExampleFile();
  const agreement: Offer = { name: 'test', document };
  try {
    const web3: Web3 = conviction.web3;

    // web3.eth.personal.newAccount('').then(console.log).catch(err => console.log(err));
    // web3.eth.personal.getAccounts().then(console.log)

    // Store an Agreement
    const hash = await conviction.store(agreement);

    console.log(hash);

    const dhash = decodeIPFSHash(hash);
    console.log(dhash);
    // Retrieve an agreement
    // const file = await conviction.retrieve(hash);
    // console.log(file);

    // Write a contract.
    const path = "contracts/simple_storage.sol";
    const contracts = conviction.load(path);
    if (!(contracts.length === 1)) throw Error('Only one contract can be specified in a file');
    const contract = contracts[0];

    const valid = await web3.eth.personal.unlockAccount(conviction.deployAccount, process.env.lol);
    if (!valid) throw Error('Could not login');
    const address = await conviction.push(contract, dhash);
    console.log('address:', address);
  } catch (err) {
    console.log(err);
  }
}

function callContract() {
  const contract = "0x240aa1EE0F07447Ec36e82B07073dFA25d6aBC8D";
}

callContract();
// main();