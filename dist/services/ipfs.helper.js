"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const form_data_1 = __importDefault(require("form-data"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const domain = `http://${process.env.HOSTNAME_IPFS || 'localhost'}:5001`;
function writeBuffer(buffer, baseURL = `${domain}/api/v0/`) {
    const data = new form_data_1.default();
    data.append('data', buffer);
    return cross_fetch_1.default(`${baseURL}add`, {
        method: 'POST',
        body: data,
    })
        .then((res) => res.json())
        .catch((err) => {
        console.log(err);
        throw Error('Could not write file to IPFS, check your IPFS connection');
    });
}
exports.writeBuffer = writeBuffer;
function readFile(hash, baseURL = `${domain}/api/v0/`) {
    return cross_fetch_1.default(`${baseURL}cat?arg=${hash}`, {
        method: 'GET',
    })
        .then((res) => res.text())
        .catch((err) => {
        console.log(err);
        throw Error('Could not read file from IPFS, check your IPFS connection');
    });
}
exports.readFile = readFile;
exports.default = module.exports;
//# sourceMappingURL=ipfs.helper.js.map