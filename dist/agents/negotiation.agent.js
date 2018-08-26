"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
class NegotiationAgent {
    constructor(web3, owner) {
        this.web3 = web3;
        this.owner = owner;
        this.gas = 8000000;
        this.gasPrice = 1000000000;
        if (!(web3 instanceof web3_1.default))
            throw Error('could not initialize the Agreement class');
    }
    async authenticate(pass = process.env.ETH_PW || '') {
        try {
            //@ts-ignore
            return this.authenticated = await this.web3.eth.personal.unlockAccount(this.owner, pass);
        }
        catch (error) {
            console.log('Could not authenticate check that your node is running with an active json rpc\n', error);
            return false;
        }
    }
    set(compiledContract, address) {
        const { jsonInterface, gas } = compiledContract;
        if (address && jsonInterface && typeof address === 'string') {
            this.contract = new this.web3.eth.Contract(jsonInterface, address, {
                from: this.owner,
                gas: gas[0] + gas[1],
                gasPrice: this.gasPrice,
            });
        }
        else {
            throw Error('Contract was not properly defined');
        }
    }
    deploy(compiledContract, args) {
        const { jsonInterface, bytecode, gas } = compiledContract;
        const contract = new this.web3.eth.Contract(jsonInterface, '', {
            from: this.owner,
            gasPrice: this.gasPrice,
        });
        return new Promise((resolve, reject) => {
            contract
                .deploy({
                data: bytecode,
                arguments: args,
            })
                .send({
                from: this.owner,
                gas: this.gas,
                gasPrice: this.gasPrice,
            })
                .then((newContractInstance) => {
                console.log('new instance');
                this.contract = newContractInstance;
                resolve(newContractInstance);
            })
                .catch((err) => reject(err));
        });
    }
    // async setHash(hash: string) {
    //   return this.contract.methods.setHash(hash).send({ from: this.owner });
    // }
    // async getHash(): Promise<string> {
    //   if (!this.contract) throw Error('No contract object defined');
    //   return this.contract.methods.getHash().call({ from: this.owner });
    // }
    // async setActive(bool: boolean) {
    //   return this.contract.methods.setActive(bool).send({ from: this.owner });
    // }
    // async getActive(): Promise<boolean> {
    //   if (!this.contract) throw Error('No contract object defined');
    //   return this.contract.methods.getActive().call({ from: this.owner });
    // }
    // string _ipfs_reference,
    //   uint _RAM,
    //   uint _CPU,
    //   uint _STORAGE,
    //   uint _deposit,
    //   uint _duration,
    //   uint8 _state
    async offer(ipfs_reference, ram, cpu, storage, deposit, duration, state) {
        return this.contract.methods.offer(ipfs_reference, ram, cpu, storage, deposit, duration, state).send({ from: this.owner });
    }
    // uint _responseTo,
    // string _ipfs_reference,
    // uint _RAM,
    // uint _CPU,
    // uint _STORAGE,
    // uint _deposit,
    // uint _duration,
    // uint8 _state
    async counterOffer(responseTo, ipfs_reference, ram, cpu, storage, deposit, duration, state) {
        return this.contract.methods.counterOffer(responseTo, ipfs_reference, ram, cpu, storage, deposit, duration, state).send({ from: this.owner });
    }
    async negotiationEnd() {
        return this.contract.methods.negotiationEnd().call({ from: this.owner });
    }
    async getOffer(index) {
        return this.contract.methods.offers(index).call({ from: this.owner });
    }
}
exports.default = NegotiationAgent;
//# sourceMappingURL=negotiation.agent.js.map