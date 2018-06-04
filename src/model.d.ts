declare module 'model' {
  export interface Offer {
    name?: string;
    document: Buffer;
  }
  export interface IpfsAddResponse {
    Name:string; 
    Hash: string;
    Size: string
  }
}