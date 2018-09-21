# conviction

A Blockchain enabled WS-Agreement Framework

## Requirements

To run this project you need to install the following software:

* [Nodejs](https://nodejs.org)
* [IPFS](https://ipfs.io)
* Any Ethereum Node e.g. [Parity](https://parity.io)

### Dependencies

#### web3
#### solc
##### node-gyp
This is a build tool that allows for the web3 [scrypt](https://www.tarsnap.com/scrypt.html) dependency to be installed. It uses a wrapper library that can be found [here](https://www.npmjs.com/package/scrypt). The dependencies that are requires by node-gyp are python 2, a C compiler and make. For platform specific details visit their [github page](https://github.com/nodejs/node-gyp).
#### express
##### body-parser
##### morgan
##### cors
#### cross-fetch
##### form-data
#### moment

## Getting Started

### With Docker - production

#### For Windows
[install docker for windows](https://docs.docker.com/docker-for-windows/install/)

### For Mac
[install docker for mac](https://docs.docker.com/docker-for-mac/install/)


### Without Docker - development

Clone the repository and run the command `> npm install` to install of of the necessary dependencies.

The **API** documentation can be found [HERE](https://documenter.getpostman.com/view/506234/RWaKU9XG#0ee83dff-4923-4ca3-9e30-f28491ff7a4a).

### To get the project up and running perform the following steps:
* Launch paritys develpment chain
  * It is not necessary to unlock the account. If you do not unlock the account the password has to be included in the request body (add a variable *pass*).
  * The account in the parity command below is a default account provided by the parity dev chain. To create a new account execute the command `> parity --chain=dev account new`.

```
> parity --chain=dev \ 
--jsonrpc-apis 'personal,web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc,shh,shh_pubsub' \
--reseal-min-period 0 --gasprice 0 \ 
--unlock '0x00a329c0648769a73afac7f9381e08fb43dbea72,0x62a81b5e5c27fb7926f5c4847d5269dffc5128a5' \
--password=pw.txt
```

* Get the ipfs node up and running: `> ipfs daemon`. 
  * If you have not initialized ipfs you might have to do that by running `> ipfs init`.
* Start the server by running:
  * `> npx tsc -p "tsconfig.json"` to compile the typescript files.
  * `> npm start` to launch the server.







