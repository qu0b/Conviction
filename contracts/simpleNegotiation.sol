contract SimleNegotiation {
  string[] public ipfs_references;
  address initiator;
  address responder;

 constructor(
      address _responder
  ) public {
    initiator = msg.sender;
    responder = _responder;
  }

  function offer(string _ipfs_reference) onlyParticipant returns (uint) {
    uint id = ipfs_references.push(_ipfs_reference);
    return id;
  }

  function counterOffer(uint index, string _ipfs_reference) onlyParticipant {
    ipfs_references[index] = _ipfs_reference;
  }

    modifier onlyParticipant() {
    require(msg.sender == initiator || msg.sender == responder);
    _;
  }
}