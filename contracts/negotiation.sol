pragma solidity ^0.4.23;

contract Negotiation {
  address public provider;
  address public consumer;
  uint public negotiationEnd;

  struct Offer {
    uint id;
    uint responseTo; // 0 is template
    string ipfs_reference;
    uint RAM;
    uint CPU;
    uint STORAGE;
    uint deposit;
    uint serviceEnd;
    uint8 state; // 1. Advisory 2. Solicited and 3. Acceptable 4. Rejected 5. Acceptable Acknowledge 6. Binding
    mapping(address => bool) hasAccepted;
  }

  Offer[] public offers;
  Offer public bindingOffer;
  mapping(address => bool) canMonitor;


  bool isNegotiationComplete;
  bool isDisbute;
  bool isCancled;


  event depsoitMade(address consumer, uint amount);
  event ServiceCancled();

  modifier monitor {
    require(canMonitor[msg.sender] || msg.sender == provider || msg.sender == consumer);
    _;
  }

  modifier advisory(Offer storage offer) {
    require(offer.state != 1, "This action can only be performed while the offer is still in advisory state");
    _;
  }
  modifier solicited(Offer storage offer) {
    require(offer.state != 2, "This action can only be performed while the offer is still in solicited state");
    _;
  }
  modifier acceptable(Offer storage offer) {
    require(offer.state != 3, "This action can only be performed while the offer is still in acceptable state");
    _;
  }
  modifier rejected(Offer storage offer) {
    require(offer.state != 4, "This action can only be performed while the offer is still in rejected state");
    _;
  }
  modifier acceptableAcknowledge(Offer storage offer) {
    require(offer.state != 5, "This action can only be performed while the offer is in acceptableAcknowledge state");
    _;
  }
  modifier binding(Offer storage offer) {
    require(offer.state != 6, "This action can only be performed while the offer is in binding state");
    _;
  }

  modifier onlyParticipant {
    require(msg.sender == consumer || msg.sender == provider, 'Only a negotiation participant can call this function');
    _;
  }

  modifier beforeNegotiationEnd {
    require(now <= negotiationEnd || !isNegotiationComplete, 'Negotiation has ended.');
    _;
  }

  modifier afterNegotiationEnd {
    require(now > negotiationEnd || isNegotiationComplete, 'Negotiation has ended.');
    _;
  }

  modifier afterService(Offer offer) {
    require(now > offer.serviceEnd || isCancled == true, 'The service is no longer available');
    _;
  }

  modifier consensus(Offer storage offer) {
    require(offer.hasAccepted[provider] && offer.hasAccepted[consumer], 'You can only deposit once both parties agree');
    _;
  }


  constructor(
      uint _NegotiationTime,
      address _provider
  ) public {
    consumer = msg.sender;
    provider = _provider;
    negotiationEnd = now + _NegotiationTime;
  }

  function offer(uint id, uint responseTo, string _ipfs_reference, uint _deposit, uint _serviceEnd) public onlyParticipant beforeNegotiationEnd {
    offers.push(Offer({
      id: offers.length + 1,
      responseTo: offers.length + 1,
      ipfs_reference: _ipfs_reference,
      deposit: _deposit,
      state: 0,
      serviceEnd: _serviceEnd
    }));
  }

  function counterOffer(uint _responseTo, uint8 _state, string _ipfs_reference, uint _deposit, uint _serviceEnd) public onlyParticipant beforeNegotiationEnd {
    require(_state == 1 || _state == 2, 'State can either be advisory or solicited');
    offers.push(Offer({
      id: offers.length+1,
      responseTo: _responseTo,
      ipfs_reference: _ipfs_reference,
      deposit: _deposit,
      state: _state,
      serviceEnd: _serviceEnd
    }));
  }

  // Form an Agreement
  function acceptOffer(uint index) public beforeNegotiationEnd onlyParticipant
  {
    Offer storage current = offers[index];
    if(msg.sender == provider)
      current.hasAccepted[provider] = true;
    if(msg.sender == consumer)
      current.hasAccepted[consumer] = true;
  }

    function rejectOffer(uint index) public beforeNegotiationEnd onlyParticipant
  {
    Offer storage current = offers[index];
    current.state = 4;
  }

  function deposit(uint index) public payable beforeNegotiationEnd consensus(offers[index]) {
    require(msg.sender == consumer, 'Only the consumer can deposit');
    require(msg.value == bindingOffer.deposit, 'The deposit amount is too small.');

    Offer storage current = offers[index];
    current.deposit = msg.value;
    bindingOffer = offers[index];
    isNegotiationComplete = true;
    emit depsoitMade(msg.sender, msg.value);
  }


  function withdraw() public afterService(bindingOffer) returns (bool) {
    require(isNegotiationComplete && msg.sender == provider && now > bindingOffer.serviceEnd);
    require(!isDisbute, "You cannot withdraw money until the disbute is settled");
    if(bindingOffer.deposit > 0) {
      if (msg.sender.send(bindingOffer.deposit)) {
          bindingOffer.deposit = 0;  
          return true;
        } else {
          return false;
        }
    } else {
      return false;
    }
  }

  function raiseDispute() public monitor {
    isDisbute = true;
  }

  function addMonitor(address _monitor) public {
    require(msg.sender == consumer);
    canMonitor[_monitor] = true;
  }

  function removeMonitor(address _monitor) public {
    require(msg.sender == consumer);
    canMonitor[_monitor] = false;
  }

  function cancelService() public onlyParticipant {
      // It is a good guideline to structure functions that interact
      // with other contracts (i.e. they call functions or send Ether)
      // into three phases:
      // 1. checking conditions
      // 2. performing actions (potentially changing conditions)
      // 3. interacting with other contracts
      // If these phases are mixed up, the other contract could call
      // back into the current contract and modify the state or cause
      // effects (ether payout) to be performed multiple times.
      // If functions called internally include interaction with external
      // contracts, they also have to be considered interaction with
      // external contracts.

      // 1. Conditions
      require(isNegotiationComplete, 'Negotiation is not complete');
      require(isCancled, 'Service has already been cancled.');

      // 2. Effects
      isCancled = true;
      emit ServiceCancled();

      // 3. Interaction
      provider.transfer(bindingOffer.deposit);
  }
}