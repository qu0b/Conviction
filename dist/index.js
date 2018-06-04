"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const solc = require('solc');
function readContract() {
    const contract = fs.readFileSync('/Users/stefan/Documents/Semester 4/Master arbeit/Implementation/Conviction/contracts/simple_storage.sol', 'utf-8');
    return contract;
}
function compileContract() {
}
function test() {
    const input = readContract();
    const output = solc.compile(input, 1);
    console.log(output);
}
test();
