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
const solc = __importStar(require("solc"));
const bs58_1 = __importDefault(require("bs58"));
function decodeIPFSHash(hash) {
    const dec = [
        `0x${bs58_1.default.decode(hash).slice(2).toString('hex')}`,
        bs58_1.default.decode(hash)[0],
        bs58_1.default.decode(hash)[1] // size
    ];
    return dec;
}
exports.decodeIPFSHash = decodeIPFSHash;
function encodeIPFSHash({ hash_value, hash_func, hash_size }) {
}
function connectToWeb3Provider(providerUrl = 'http://localhost:8545') {
    // if (!this.web3) {
    const httpProvider = new web3_1.default.providers.HttpProvider(providerUrl);
    return new web3_1.default(httpProvider);
    // } else {
    // return this.web3;
    // }
}
function readContract(filePath = './contracts/simple_storage.sol') {
    if (!filePath.endsWith('.sol'))
        throw Error("The path specified referes to the wrong file type. Use the .sol extension.");
    const contract = fs.readFileSync(filePath, 'utf-8');
    return contract;
}
function createContract(jsonInterface) {
    if (!(this && this.web3))
        throw new Error('No web3 client specified, bind it to the function');
    return new this.web3.eth.Contract(jsonInterface, '', {
        from: this.deployAccount,
        gasPrice: 10000000000,
    });
}
function deployContract(contract, bytecode, constructorArguments) {
    return new Promise((resolve, reject) => {
        contract
            .deploy({
            data: bytecode,
            arguments: constructorArguments,
        })
            .send({
            from: this.deployAccount,
            gas: 1500000,
            gasPrice: '10000000000',
        })
            .then((newContractInstance) => {
            resolve(newContractInstance.options.address);
        })
            .catch((err) => reject(err));
    });
}
function loadExampleFile() {
    return fs.readFileSync('./exampleFile.xml');
}
function writeXMLToIPFS(xml, baseURL = 'http://localhost:5001/api/v0/') {
    const data = new form_data_1.default();
    data.append('agreement', xml);
    return cross_fetch_1.default(`${baseURL}add`, {
        method: 'POST',
        body: data,
    })
        .then((res) => res.json())
        .catch((err) => err);
}
function readXMLFromIPFS(hash, baseURL, string = 'http://localhost:5001/api/v0/') {
    return cross_fetch_1.default(`${baseURL}cat?arg=${hash}`, {
        method: 'GET',
    })
        .then((res) => res.text())
        .catch((err) => err);
}
async function store(offer) {
    try {
        const response = await this.ipfs.write(offer.document, this.ipfs.baseURL);
        if (typeof response.Hash === 'string') {
            return response.Hash;
        }
        else {
            return '';
        }
    }
    catch (err) {
        console.log('could not write file to IPFS', err);
        return '';
    }
}
async function retrieve(hash = '') {
    try {
        const response = await this.ipfs.read(hash, this.ipfs.baseURL);
        return response;
    }
    catch (err) {
        console.log('could not read file from IPFS', err);
        return '';
    }
}
function loadContract(contractPath = '') {
    const input = readContract(contractPath);
    const output = solc.compile(input.toString(), 1);
    const contracts = [];
    for (const contractName in output.contracts) {
        const jsonInterface = JSON.parse(output.contracts[contractName].interface);
        const bytecode = '0x' + output.contracts[contractName].bytecode;
        contracts.push({ jsonInterface, bytecode });
    }
    return contracts;
}
async function pushContract(contract, contractArguments) {
    const contractInstance = this.create(contract.jsonInterface);
    const address = await this.deploy(contractInstance, contract.bytecode, contractArguments);
    return address;
}
function createConviction(ipfsURL = 'http://localhost:5001/api/v0/', web3URL = 'http://localhost:8545') {
    const conviction = {
        web3: connectToWeb3Provider(web3URL),
        deployAccount: '0x00D6B14Ff6A34B539FF59f1fFD297525bbcA42b7',
        push: pushContract,
        deploy: deployContract,
        create: createContract,
        load: loadContract,
        ipfs: {
            baseURL: ipfsURL,
            read: readXMLFromIPFS,
            write: writeXMLToIPFS
        },
        retrieve,
        store,
        connectToWeb3Provider,
        loadExampleFile
    };
    return conviction;
}
exports.default = createConviction;
//# sourceMappingURL=lib.js.map