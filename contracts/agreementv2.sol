pragma solidity ^0.4.23;

contract Agreement {
  struct Hash {
    bytes32 value;
    uint8 func;
    uint8 size;
  }

  Hash agreement;

  address consumer;
  address provider;
  
  bool public active;

  constructor(address _consumer) public {
    consumer = _consumer;
  }

  function setAgreement(bytes32 _value, uint8 _func, uint8 _size) public {
    agreement = Hash(_value, _func, _size);
  }

  function getAgreement() public view returns (bytes32 value, uint8 func, uint8 size) {
    return (agreement.value, agreement.func, agreement.size);
  }

  function setActive(bool x) public {
    active = x;
  }

  function getActive() public view returns (bool retVal) {
    return active;
  }
}
