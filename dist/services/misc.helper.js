"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function loadExampleFile() {
    return fs_1.default.readFileSync('exampleFile.xml');
}
exports.loadExampleFile = loadExampleFile;
// function init(ipfsURL: string = 'http://localhost:5001/api/v0/', web3URL: string = 'http://localhost:8545') {
// }
exports.default = module.exports;
//# sourceMappingURL=misc.helper.js.map