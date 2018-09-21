"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const fs_1 = __importDefault(require("fs"));
const solc_1 = __importDefault(require("solc"));
// import net from 'net';
function connectToWeb3Provider(providerUrl = `http://${process.env.HOSTNAME_ETH_NODE || 'localhost'}:8545`) {
    const provider = new web3_1.default.providers.HttpProvider(providerUrl);
    //const provider = new Web3.providers.IpcProvider('/var/folders/z9/72tzgdss7sxcj8_bc1snpzmr0000gn/T/geth.ipc', net);
    return new web3_1.default(provider);
}
exports.connectToWeb3Provider = connectToWeb3Provider;
function readSolFile(path = './contracts/simple_storage.sol') {
    if (!path.endsWith('.sol'))
        throw Error("The path specified refers to the wrong file type. Use the .sol extension.");
    const contract = fs_1.default.readFileSync(path, 'utf-8');
    return contract.toString();
}
exports.readSolFile = readSolFile;
function compileSolContract(input, contractName) {
    const output = solc_1.default.compile(input, 1);
    if (!output)
        throw Error('The solc compiler returned an empty output');
    const contract = output.contracts[':' + contractName];
    if (!contract)
        throw Error("The contract with the specificed name " + contractName + "Could not be found");
    return contract;
}
exports.compileSolContract = compileSolContract;
function getByteCode(contract) {
    if (!contract.bytecode)
        throw Error('bytecode is undefined');
    return '0x' + contract.bytecode;
}
exports.getByteCode = getByteCode;
function getJsonInteface(contract) {
    if (!contract.interface)
        throw Error('jsonInterface is undefined');
    return JSON.parse(contract.interface);
}
exports.getJsonInteface = getJsonInteface;
function prepareContract(filePath = 'contracts/negotiation.sol', contractName = 'Negotiation') {
    const input = readSolFile(filePath);
    const contract = compileSolContract(input, contractName);
    const bytecode = getByteCode(contract);
    const jsonInterface = getJsonInteface(contract);
    return { jsonInterface, bytecode, gas: contract.gasEstimates && contract.gasEstimates.creation };
}
exports.prepareContract = prepareContract;
exports.default = module.exports;
//# sourceMappingURL=contract.helper.js.map