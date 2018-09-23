# A Blockchain enabled WS-Agreement Framework. 

This project seeks to utilize the trust granted by distributed ledger technologies to accomodate trustless negotiations for service level agreements.

## Dependencies

To run this project the following software packages are required. If you run the project with docker the dependencies listed below will be installed not on your machine, but in the docker containers.

### [Parity](https://wiki.parity.io/Parity-Ethereum)
Parity is an ethereum client written in the Rust programming language. [Rust](https://www.rust-lang.org/) is a systems language with a focus on safety. Parity comes as a CLI tool and can expose a JSON-RPC HTTP API via the port 8545. This API can be used to interact with the ethereum blockchain. Partiy relies on openssl to create new accounts and to sign transactions.

An alternative to parity would be the [ethereum-go](https://geth.ethereum.org/) client.

### [IPFS](https://ipfs.io)

> IPFS is a peer-to-peer hypermedia protocol to make the web faster, safer and more open. 

It is essentially a decentralized file system that benefits from the concepts brought forth by git and bitTorrent. It uses a distributed hash table to index the files and a pruning algorithm that hashes all of the data and removes duplicates. IPFS can be accessed over http and the content is spread accross many nodes.

### [Nodejs](https://nodejs.org)

Initially, Javascript would only be run in the browser until the Nodejs project was first released. It is built on Chromes V8 Javascript engine and compiles at runtime. The language only uses a single thread for its processes but takes advantage of asynchronous programming paradigms. Nodejs comes with a widly popular package manager called [npm](https://www.npmjs.com/). The software below is installed with the npm package manager.

#### [Web3](https://web3js.readthedocs.io/en/1.0/getting-started.html)
This is a client library which communicates with the ethereum node, in our case parity, over rpc calls. The man components of the library that we use are `web3.eth.Contract` , `web3.eth.accounts`  and `web3.eth.personal` .

#### [Solc](https://github.com/ethereum/solc-js)
This package provides bindings for us to use the solidity compiler in our Nodejs projcet. The [Solidity](https://solidity.readthedocs.io/en/develop/) language focues on contract creation and allows for the implementation of smart contracts.

##### Node-gyp
This is a build tool that allows for the web3 [scrypt](https://www.tarsnap.com/scrypt.html) dependency to be installed. It uses a wrapper library that can be found [here](https://www.npmjs.com/package/scrypt). The dependencies that are required by node-gyp are python 2, a C compiler and make. For platform specific details visit their [github page](https://github.com/nodejs/node-gyp).

#### [Express](https://expressjs.com/)
This is a Nodejs web framework for creating unopinionated web applications such as a REST API. Bellow are some middleware packages used to extend the web framework.

##### [body-parser](https://www.npmjs.com/package/body-parser)
This is a middleware package for express and parses the request body. For example, the json request body is parsed to a javascript objected by the library.

##### [morgan](https://www.npmjs.com/package/morgan)
This is a middleware package that logs requersts. It logs the endpoint and the status code of each request made.

##### [cors](https://www.npmjs.com/package/cors)
This middleware package adds Cross Origin Resource Sharing (CORS) headers to each response.

#### [cross-fetch](https://www.npmjs.com/package/cross-fetch)
This packages allows the user to create HTTP requests. This library works for Nodejs as well as for the browser and React Native applications.

##### [form-data](https://www.npmjs.com/package/form-data)
This libaray helps create multipart/form-data streams. We use this library to submit files to IPFS.

#### [moment](https://www.npmjs.com/package/moment)
Moment is a library that makes it easy to work with dates. It supports a wide range functions for parsing, manipulating and formatting dates.

## Getting Started
In this section, the process of getting the project up and running is described. The first part is the production build with docker and the second part is the development build locally. To get started either way, clone the repository `$ git clone https://github.com/qu0b/conviction.git && cd conviction`.

### Production - Docker
This is the production build where each service is run in its own container. In total there are three containers. The first is the ethereum node with the hostname parity, the second is IPFS node and the last is the server. All three containers are put into the same network called pod. If you do not already have docker follow the instructions below. After the installation is done your system should have docker-engine, docker-machine and docker-compose.

#### For Windows
Follow the instructions to [install docker for windows](https://docs.docker.com/docker-for-windows/install/), a direct download link can be found [here](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe) otherwise a registration is required.

#### For Mac
Follow the instructions to [install docker for mac](https://docs.docker.com/docker-for-mac/install/), a direct download link can be found [here](https://download.docker.com/mac/edge/Docker.dmg) otherwise a registration is required.


After docker has been successfully installed you should be able to run the following commands:

* `$ docker version` 
* `$ docker-machine version` 
* `$ docker-compose version` 

The launch configuration can be found in the `docker-compose.yml` file. The containers can be launched with the command `$ docker-compose up -d` and can be shutdown with `$ docker-compose down`. To inspect the running containers it is possible to run `$ docker ps -a`. 

To test if the containers are running and that the ports are exposed as expected connect to the server shell 
`$ docker exec -it conviction_server_1 /bin/bash` 
and run:

* Test IPFS: `$ curl "http://ipfs:5001/api/v0/version"`
* Test Parity: `$ curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' http://parity:8545`
* Test Server: `$ curl localhost:8080`

If each of the commands above returns a response all three containers have been constructed successfully. From your host machine you can now interact with the server via `$ curl localhost:8080` or `curl $(docker-machine ip):8080` depending on your setup. For more methods refer to the [API documentation](https://documenter.getpostman.com/view/506234/RWaKU9XG#0ee83dff-4923-4ca3-9e30-f28491ff7a4a).


### Local Development - Without Docker

For local development more packages will be installed that are not essential for production. These packages include mainly [Typescript](https://www.typescriptlang.org/) dependencies that improve the developer expierence. The `$ @types/*` packages are type definitions for typescript. Another important developer dependency is [Nodemon](https://www.npmjs.com/package/nodemon) which listens for changes and restarts the server automatically.

Changes to the Typescript files need to be transpiled to javascript by calling this command: 
`$ npx tsc -p "tsconfig.json"`.

#### Setting up IPFS
To get ipfs running on your machine follow the [install instructions](https://docs.ipfs.io/introduction/install/). After calling `$ ipfs init` it is possible to run an `$ ipfs daemon`. Once the daemon is running it possible to access the IPFS API via `localhost:5001`.

#### Setting up parity

Follow the install instructions for parity that can be found `https://parity.io` https://github.com/paritytech/parity-ethereum. The version used for local development is:
* Parity/v1.10.9-stable-23a9eef-20180707

To run the a parity node call:
```
$ parity --chain=dev \ 
--jsonrpc-apis 'personal,web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc,shh,shh_pubsub' \
--reseal-min-period 0 --gasprice 0
``` 

To see if the node is running it is possible to call:
`$ curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' http://localhost:8545`

#### Setting up the server

Before we can start the server we need to install the dependencies. This can be done by running `npm install`. The server can be launched either with nodemone to track code changes or with node.

* npm start - node (does not restart)
* npm test - nodemon (restarts on code changes)

To test if the server is running execute `curl localhost:8080`. For further commands refer to the [API documentation](https://documenter.getpostman.com/view/506234/RWaKU9XG#0ee83dff-4923-4ca3-9e30-f28491ff7a4a).

For windows you might have to additionally install websocket `npm install websocket`.




