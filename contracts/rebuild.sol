pragma solidity ^0.4.23;

contract OfferFactory {

  struct Offer {
    string ipfs_reference;
    uint duration;
    uint deposit;
  }

  function createOffer(string _ipfs_reference, uint _duration, uint _deposit) returns (string, uint, uint);

}

contract NegotiationFactory is OfferFactory {

  struct Negotiation {
    string[] ipfs_reference;
  }

  struct NegotiationStrategy{
    Offer[] offers;
  }

  mapping(uint => Negotiation) negotiations;
  mapping(uint => NegotiationStrategy) negotiationStrategies;

  function initNegotiation(address consumer, address provider, address referee) returns (uint);


  function negotiate() returns (uint state);
}

// contract AgreementFactory {
//   struct Agreement {
//     string wsa_reference;
//     uint expiration;
//     uint price;
    
//   }

//   function createAgreement

// }