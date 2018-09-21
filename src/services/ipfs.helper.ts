import { IpfsAddResponse } from 'types';
import FormData from 'form-data';
import fetch from 'cross-fetch';
const domain = `http://${process.env.HOSTNAME_IPFS || 'localhost'}:5001`

export function writeBuffer(buffer: Buffer, baseURL: string = `${domain}/api/v0/`): Promise<IpfsAddResponse> {
  

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

export function readFile(hash: string, baseURL: string = `${domain}/api/v0/`): Promise<string | Error> {
  return fetch(`${baseURL}cat?arg=${hash}`, {
    method: 'GET',
  })
    .then((res) => res.text())
    .catch((err) => {
      console.log(err);
      throw Error('Could not read file from IPFS, check your IPFS connection');
    });
}

export default module.exports;