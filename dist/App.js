"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const fs = __importStar(require("fs"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const solc = require('solc');
const consumerAddr = '0x0010BAabF441741D621e3Aa7de565E0Dd7453555';
const providerAddr = '0x0062d2F9500295b6Bb0A0E4C3Be28523B11f0d9A';
const testAcc = '0x006635837021Ca02cD930380329D5991A223de0b';
function connectToWeb3Provider(providerUrl = 'http://localhost:8545') {
    //TODO: check if connection already exists (cache web3 instance)
    const httpProvider = new web3_1.default.providers.HttpProvider(providerUrl);
    return new web3_1.default(httpProvider);
}
function checkWeb3Connection() {
    const web3 = connectToWeb3Provider();
    web3.eth.net.isListening().then(console.log);
}
function readContract() {
    const contract = fs.readFileSync('/Users/stefan/Documents/Semester 4/Master arbeit/Implementation/Conviction/contracts/simple_storage.sol', 'utf-8');
    return contract;
}
function createContract(web3, jsonInterface) {
    return new web3.eth.Contract(jsonInterface, '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
        from: testAcc,
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });
}
function callContract() {
}
function addAgreement(contractAddress, agreementHash) {
}
function loadExampleFile() {
    return fs.readFileSync('./exampleFile.xml');
}
function writeXMLToIPFS(xml) {
    let data = new form_data_1.default();
    data.append('agreement', xml);
    return cross_fetch_1.default("http://localhost:5001/api/v0/add", {
        method: "POST",
        body: data
    })
        .then(res => res.json())
        .catch(err => err);
}
function readXMLFromIPFS(hash) {
    return cross_fetch_1.default(`http://localhost:5001/api/v0/cat?arg=${hash}`, {
        method: "GET"
    })
        .then(res => res.text())
        .catch(err => err);
}
function store(offer = {}) {
}
function retrieve(hash = "") {
}
async function main() {
    try {
        // const xml = loadExampleFile();
        // const writeResponse: IpfsAddResponse = await writeXMLToIPFS(xml);
        // console.log(writeResponse);
        // const readResponse = await readXMLFromIPFS(writeResponse.Hash);
        // console.log(readResponse);
        const web3 = connectToWeb3Provider();
        const input = readContract();
        const output = solc.compile(input, 1);
        let jsonInterface = '';
        let bytecode = '0x';
        for (const contractName in output.contracts) {
            jsonInterface = output.contracts[contractName].interface;
            bytecode += output.contracts[contractName].bytecode;
        }
        const contract = createContract(web3, JSON.parse(jsonInterface));
        contract.deploy({
            data: bytecode,
            arguments: [5]
        }).send({
            from: testAcc,
            gas: 1000000,
            gasPrice: '20000000000'
        }).then((newContractInstance) => {
            console.log(newContractInstance.options.address); // instance with the new contract address
        }).catch(err => console.log(err));
    }
    catch (err) {
        console.log(err);
    }
}
main();
