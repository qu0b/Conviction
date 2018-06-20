"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("./lib"));
async function main() {
    const conviction = lib_1.default();
    // const document = conviction.loadExampleFile();
    // const agreement: Offer = { name: 'test', document };
    try {
        const web3 = conviction.web3;
        // web3.eth.personal.newAccount('').then(console.log).catch(err => console.log(err));
        // web3.eth.personal.getAccounts().then(console.log)
        // Store an Agreement
        // const hash = await conviction.store(agreement);
        // console.log(hash);
        // Retrieve an agreement
        // const file = await conviction.retrieve(hash);
        // console.log(file);
        // Write a contract.
        const path = "contracts/simple_storage.sol";
        const contracts = conviction.load(path);
        if (!(contracts.length === 1))
            throw Error('Only one contract can be specified in a file');
        const contract = contracts[0];
        const valid = await web3.eth.personal.unlockAccount(conviction.deployAccount, process.env.lol);
        if (!valid)
            throw Error('Could not login');
        const address = await conviction.push(contract);
        console.log('address:', address);
        // console.log('address: ', address);
    }
    catch (err) {
        console.log(err);
    }
}
main();
//# sourceMappingURL=index.js.map