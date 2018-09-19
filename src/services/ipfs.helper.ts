import { IpfsAddResponse } from 'types';
import base58 from 'bs58';
import FormData from 'form-data';
import fetch from 'cross-fetch';

export function writeBuffer(buffer: Buffer, baseURL: string = 'http://localhost:5001/api/v0/'): Promise<IpfsAddResponse> {
  const data: any = new FormData();
  data.append('data', buffer);
  return fetch(`${baseURL}add`, {
    method: 'POST',
    body: data,
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
      throw Error('Could not write file to IPFS, check your IPFS connection');
    });
}

export function readFile(hash: string, baseURL: string = 'http://localhost:5001/api/v0/'): Promise<string | Error> {
  return fetch(`${baseURL}cat?arg=${hash}`, {
    method: 'GET',
  })
    .then((res) => res.text())
    .catch((err) => {
      console.log(err);
      throw Error('Could not read file from IPFS, check your IPFS connection');
    });
}

export function decodeMultiHash(hash: string) {
  const dec = [
    `0x${base58.decode(hash).slice(2).toString('hex')}`, // hash value
    base58.decode(hash)[0], // type of hash function
    base58.decode(hash)[1] // size
  ]
  return dec;
}

export function encodeMultihash([hash_value, hash_func, hash_size]) {
  return hash_value;
}

export default module.exports;