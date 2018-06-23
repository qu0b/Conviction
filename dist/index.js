"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contract_helper_1 = require("./services/contract.helper");
const agreement_agent_1 = __importDefault(require("./agents/agreement.agent"));
async function main() {
    const ipfsURL = 'http://localhost:5001/api/v0/';
    const providerURL = 'http://localhost:8545';
    const web3 = contract_helper_1.connectToWeb3Provider(providerURL);
    const consumerAddress = '0x00D6B14Ff6A34B539FF59f1fFD297525bbcA42b7';
    const agreementContractPath = 'contracts/agreement.sol';
    const contractDefinition = Object.assign({}, contract_helper_1.compile(agreementContractPath));
    const cAgent = new agreement_agent_1.default(web3, consumerAddress);
    const bool = await cAgent.authenticate(process.env.ETH_PW);
    console.log(bool);
    // const newContract = await cAgent.deploy(contractDefinition);
    // console.log(newContract);
}
main();
//# sourceMappingURL=index.js.map