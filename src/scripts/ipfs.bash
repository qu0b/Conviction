docker ps -f name=ipfs -q | xargs docker stop | xargs docker rm
docker ps -f name=ipfs -q -a | xargs docker rm

#mkdir /tmp/ipfs-docker-data

docker run -d --name ipfs --network pod -p 5001:5001 ipfs/go-ipfs:latest