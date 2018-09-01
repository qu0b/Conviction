declare module 'types' {
  export interface contractOffer {
    id: string;
    creator: string;
    ipfs_reference: string;
    deposit: string;
    duration: string;
    state: string;
    [other: string]: string;
  }
  export interface Offer {
    id: number;
    creator: string;
    ipfs_reference: string;
    deposit: number;
    duration: number;
    state: string;
  }
  export interface IpfsAddResponse {
    Name:string; 
    Hash: string;
    Size: string
  }
  export interface ContractDefinition {
    address?: string;
    jsonInterface: any[];
    bytecode: string;
  }
}