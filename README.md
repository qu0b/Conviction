# Conviction

A Blockchain enabled WS-Agreement Framework

## Requirements

To run this project you need to install the following software:

* [Nodejs](https://nodejs.org)
* [IPFS](https://ipfs.io)
* Any Ethereum Node e.g. [Parity](https://parity.io)

## Getting Started

Clone the repository and run the command `> npm install` to install of of the necessary dependencies.

The **API** documentation can be found [HERE](https://documenter.getpostman.com/view/506234/RWaKU9XG#0ee83dff-4923-4ca3-9e30-f28491ff7a4a).

* To launch the Parity development chain run the following command:

```
> parity --chain=dev \ 
--jsonrpc-apis 'personal,web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc,shh,shh_pubsub' \
--reseal-min-period 0 --gasprice 0 \ 
--unlock '0x00a329c0648769a73afac7f9381e08fb43dbea72,0x62a81b5e5c27fb7926f5c4847d5269dffc5128a5' \
--password=pw.txt
```

  * It is not necessary to unlock the account. If you do not unlock the account the password has to be included in the request body (add a variable *pass*).

* To get the ipfs node up and running run: `> ipfs daemon`. If you have not initialized ipfs you might have to do that by running `> ipfs init`.
* In the project folder run
  * `> npx tsc -p "tsconfig.json"` to compile the typescript files.
  * `> npm start` to launch the server.





