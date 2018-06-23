pragma solidity ^0.4.23;

contract Agreement {
  struct Multihash {
    bytes32 hash_value;
    uint8 hash_func;
    uint8 hash_size;
  }

  Multihash agreement;
  
  bool public active;

  constructor(bytes32 _hash_value, uint8 _hash_func, uint8 _hash_size) public {
    agreement = Multihash(_hash_value, _hash_func, _hash_size);
  }

  function setActive(bool x) public {
    active = x;
  }

  function getActive() public view returns (bool retVal) {
    return active;
  }
}
