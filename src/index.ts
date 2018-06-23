import ipfsHelper from './services/ipfs.helper';
import miscHelper from './services/misc.helper';
import { connectToWeb3Provider, compile } from './services/contract.helper';
import ContractAgent from './agents/agreement.agent';

async function main() {

  const ipfsURL: string = 'http://localhost:5001/api/v0/';
  const providerURL: string = 'http://localhost:8545';
  const web3 = connectToWeb3Provider(providerURL);
  const consumerAddress = '0x00D6B14Ff6A34B539FF59f1fFD297525bbcA42b7';
  const agreementContractPath = 'contracts/agreement.sol';
  const contractDefinition = {
    ...compile(agreementContractPath)
  }

  const cAgent = new ContractAgent(web3, consumerAddress);
  const bool = await cAgent.authenticate(process.env.ETH_PW);
  console.log(bool);
  // const newContract = await cAgent.deploy(contractDefinition);
  // console.log(newContract);
  

}

main();