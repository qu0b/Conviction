import Web3 from 'web3';
import { ContractDefinition } from 'types';


export default class AgreementAgent {
  gas = 1500000
  gasPrice = 1000000000
  contract
  authenticated

  constructor(
    public web3: Web3, 
    public owner: string,
  ) {
    if(!(web3 instanceof Web3)) throw Error('could not initialize the Agreement class');
  }

  setContract(contractDefinition: ContractDefinition) {
    const { address, jsonInterface } = contractDefinition;
    if(address && jsonInterface && typeof address === 'string') {
        this.contract = new this.web3.eth.Contract(jsonInterface, address, {
          from: this.owner,
          gas: this.gas,
          gasPrice: this.gasPrice
        });
    }
  }

  async authenticate(pass: string = process.env.ETH_PW || '') {
    try {
      //@ts-ignore
      return this.authenticated = await this.web3.eth.personal.unlockAccount(this.owner, pass);
    } catch(error) {
      console.log('Could not authenticate check that your node is running with an active json rpc');
      return false;
    }
  }

  deploy(contractDefinition: ContractDefinition) {
    if(!this.authenticated) throw Error('Please authenticate before deploying a contract');

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
        .then((newContractInstance: any) => {
          this.contract = newContractInstance;
          resolve(newContractInstance);
        })
        .catch((err) => reject(err));
    });
  }

}