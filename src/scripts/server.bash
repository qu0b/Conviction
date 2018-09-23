docker ps -f name=server -q | xargs docker stop | xargs docker rm
docker ps -f name=server -q -a | xargs docker rm

docker build -t conviction/server .

none=$(docker images | grep "<none>" | awk '{print $1}')
if [ "$none" == *"<none>"* ]
 then
  docker images | grep "<none>" | awk '{print $3;}' | xargs docker rmi
fi

serverId=$(docker run -p 8080:8080 --network pod -h server --name server -d conviction/server)
echo "started server: $serverId"

# connect to the shell
# docker exec -it server /bin/bash
# ping parity