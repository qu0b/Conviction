"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bs58_1 = __importDefault(require("bs58"));
function writeBuffer(buffer, baseURL = 'http://localhost:5001/api/v0/') {
    const data = new FormData();
    data.append('data', buffer);
    return fetch(`${baseURL}add`, {
        method: 'POST',
        body: data,
    })
        .then((res) => res.json())
        .catch((err) => {
        console.log(err);
        return Error('Could not write file from IPFS');
    });
}
exports.writeBuffer = writeBuffer;
function readFile(hash, baseURL, string = 'http://localhost:5001/api/v0/') {
    return fetch(`${baseURL}cat?arg=${hash}`, {
        method: 'GET',
    })
        .then((res) => res.text())
        .catch((err) => {
        console.log(err);
        return Error('Could not read file from IPFS');
    });
}
exports.readFile = readFile;
function decodeMultiHash(hash) {
    const dec = [
        `0x${bs58_1.default.decode(hash).slice(2).toString('hex')}`,
        bs58_1.default.decode(hash)[0],
        bs58_1.default.decode(hash)[1] // size
    ];
    return dec;
}
exports.decodeMultiHash = decodeMultiHash;
function encodeMultihash([hash_value, hash_func, hash_size]) {
    return hash_value;
}
exports.encodeMultihash = encodeMultihash;
exports.default = module.exports;
//# sourceMappingURL=ipfs.helper.js.map