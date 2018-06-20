pragma solidity ^0.4.23;

contract SimpleStorage {
  uint public hash;
  // andere variables

  constructor(uint initialValue) public {
    hash = initialValue;
  }

  function set(uint x) public {
    hash = x;
  }

  function get() public view returns (uint retVal) {
    return hash;
  }

}
