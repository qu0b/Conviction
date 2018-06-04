declare module 'model' {
  export interface Offer {
    name?: string;
    document?: XMLDocument;
  }
  export interface IpfsAddResponse {
    Name:string; 
    Hash: string;
    Size: string
  }
}