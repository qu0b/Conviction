"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
class AgreementAgent {
    constructor(web3, owner) {
        this.web3 = web3;
        this.owner = owner;
        this.gas = 1500000;
        this.gasPrice = 1000000000;
        if (!(web3 instanceof web3_1.default))
            throw Error('could not initialize the Agreement class');
    }
    setContract(contractDefinition) {
        const { address, jsonInterface } = contractDefinition;
        if (address && jsonInterface && typeof address === 'string') {
            this.contract = new this.web3.eth.Contract(jsonInterface, address, {
                from: this.owner,
                gas: this.gas,
                gasPrice: this.gasPrice
            });
        }
    }
    async authenticate(pass = process.env.ETH_PW || '') {
        try {
            //@ts-ignore
            return this.authenticated = await this.web3.eth.personal.unlockAccount(this.owner, pass);
        }
        catch (error) {
            console.log('Could not authenticate check that your node is running with an active json rpc');
            return false;
        }
    }
    deploy(contractDefinition) {
        if (!this.authenticated)
            throw Error('Please authenticate before deploying a contract');
        const { jsonInterface, bytecode } = contractDefinition;
        const contract = new this.web3.eth.Contract(jsonInterface, '', {
            from: this.owner,
            gasPrice: this.gasPrice,
        });
        return new Promise((resolve, reject) => {
            contract
                .deploy({
                data: bytecode,
                arguments: [this.owner],
            })
                .send({
                from: this.owner,
                gas: this.gas,
                gasPrice: this.gasPrice,
            })
                .then((newContractInstance) => {
                this.contract = newContractInstance;
                resolve(newContractInstance);
            })
                .catch((err) => reject(err));
        });
    }
}
exports.default = AgreementAgent;
//# sourceMappingURL=agreement.agent.js.map