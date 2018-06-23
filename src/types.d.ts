declare module 'types' {
  export interface Offer {
    name?: string;
    document: Buffer;
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