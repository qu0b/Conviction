# Conviction
A Blockchain enabled WS-Agreement Framework

## Requirements
To run this project you need to install Nodejs.

* [Nodejs](https://nodejs.org)
* [IPFS](https://ipfs.io)
* A Ethereum node e.g. [Parity](https://parity.io)

## Getting started.

Clone the repository and run the command `npm install` to install of of the necessary dependencies.

The **API** documentation can be found [here](https://documenter.getpostman.com/view/506234/RWaKU9XG#0ee83dff-4923-4ca3-9e30-f28491ff7a4a).

To launch the Parity node in development mode run the following command:

```{shell}
parity --chain=dev \ 
--jsonrpc-apis 'personal,web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc,shh,shh_pubsub' \
--reseal-min-period 0 --gasprice 0 \ 
--unlock '0x00a329c0648769a73afac7f9381e08fb43dbea72,0x62a81b5e5c27fb7926f5c4847d5269dffc5128a5' --password=pw.txt
```





