pragma solidity ^0.4.23;

contract Agreement {

  string ipfs_hash;
  address consumer;
  address provider;

  bool public active;

  constructor(address _consumer) public {
    consumer = _consumer;
  }

  function setHash(string _hash) public {
    ipfs_hash = _hash;
  }

  function getHash() public view returns(string) {
    return ipfs_hash;
  }

  function setActive(bool x) public {
    active = x;
  }

  function getActive() public view returns (bool retVal) {
    return active;
  }
}
