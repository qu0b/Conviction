#docker network create pod
docker ps -f name=parity -q | xargs docker stop | xargs docker rm
docker ps -f name=parity -q -a | xargs docker rm

docker run -d -p 8545:8545 -p 8546:8546 -p 30303:30303 -p 30303:30303/udp --name parity --network pod parity/parity:v1.7.0 --chain=dev --ui-interface all --jsonrpc-interface all --jsonrpc-apis 'personal,web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc'