"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultError_1 = require("./defaultError");
// Error Codes
const CODE_NO_BODY = "SERVER_ERROR_NO_BODY";
const CODE_MISSING_ARGUMENT = "SERVER_ERROR_MISSING_ARGUMENT";
const CODE_CONNECT_ETH_NODE = "CONNECTION_ERROR_ETHEREUM_NODE";
const CODE_CONNECT_IPFS_NODE = "CONNECTION_ERROR_IPFS_NODE";
// Errors
const ERROR_NO_BODY = new defaultError_1.defaultError(400, CODE_NO_BODY, "The request body does not have the required parameters");
const ERROR_MISSING_ARGUMENT = new defaultError_1.defaultError(400, CODE_MISSING_ARGUMENT, "One or more parameters are missing");
const ERROR_CONNECT_ETH_NODE = new defaultError_1.defaultError(500, CODE_CONNECT_ETH_NODE, "Could not connect to the ethereum node, make sure the node is running.");
const ERROR_CONNECT_IPFS_NODE = new defaultError_1.defaultError(500, CODE_CONNECT_IPFS_NODE, "Could not connect to the ipfs node");
exports.errors = {
    ERROR_NO_BODY,
    ERROR_MISSING_ARGUMENT,
    ERROR_CONNECT_ETH_NODE,
    ERROR_CONNECT_IPFS_NODE
};
//# sourceMappingURL=errors.js.map