FROM node:8
WORKDIR /usr/src/app
ENV HOSTNAME_ETH_NODE='parity'
ENV HOSTNAME_IPFS='ipfs'
ENV NODE_ENV="production"
COPY package.json ./
RUN npm install
RUN ls
COPY . .

EXPOSE 8080
CMD ["npm", "start"]


