#parity --chain=dev --jsonrpc-apis 'personal,web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc,shh,shh_pubsub' --reseal-min-period 0 --gasprice 0 --unlock '0x00a329c0648769a73afac7f9381e08fb43dbea72,0x62a81b5e5c27fb7926f5c4847d5269dffc5128a5' --password=pw.txt & ipfs daemon &

#docker run -ti -p 8545:8545 -p 8546:8546 -p 30303:30303 -p 30303:30303/udp ethereum/client-go:stable --dev --rpcapi "db,personal,eth,net,web3" --rpccorsdomain='*' --networkid=1234 --rpc --rpcaddr="0.0.0.0"

#Test IPFS
curl "http://$(docker-machine ip):5001/api/v0/version"

#Test parity
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' http://$(docker-machine ip):8545

#Test server
curl $(docker-machine ip):8080