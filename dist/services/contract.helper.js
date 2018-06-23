"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const fs_1 = __importDefault(require("fs"));
const solc_1 = __importDefault(require("solc"));
function connectToWeb3Provider(providerUrl = 'http://localhost:8545') {
    const httpProvider = new web3_1.default.providers.HttpProvider(providerUrl);
    return new web3_1.default(httpProvider);
}
exports.connectToWeb3Provider = connectToWeb3Provider;
function readContract(filePath = './contracts/simple_storage.sol') {
    if (!filePath.endsWith('.sol'))
        throw Error("The path specified refers to the wrong file type. Use the .sol extension.");
    const contract = fs_1.default.readFileSync(filePath, 'utf-8');
    return contract;
}
exports.readContract = readContract;
// compiles and returns the first contract in the specified file.
function compile(contractPath = '') {
    const input = readContract(contractPath);
    const output = solc_1.default.compile(input.toString(), 1);
    const contracts = Object.values(output.contracts);
    if (!contracts.length)
        throw Error('The file path you provided contains no contracts');
    const contract = contracts[0];
    const jsonInterface = JSON.parse(contract.interface);
    const bytecode = '0x' + contract.bytecode;
    return { jsonInterface, bytecode, address: '' };
}
exports.compile = compile;
exports.default = module.exports;
//# sourceMappingURL=contract.helper.js.map