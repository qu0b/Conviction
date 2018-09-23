pragma solidity ^0.4.23;

contract Negotiation {
  enum States { Advisory, Solicited, Acceptable, Rejected, Acceptable_Acknowledge, Binding, Deposited, Disputed, Withdrawn }
  enum Flags { none, yellow, red }

  address initiator;
  address responder;
  string[] public ipfs_references;
  Offer[] public offers;
  mapping(uint => address) payee;
  event depsoitMade(address consumer, uint amount);
  event agreementMade(uint index, uint end, uint deposit);
  event stateChange(uint index, uint8 next);
  event newOffer(uint index, string ipfs_reference, uint deposit, uint duration);
  address referee;
  bool isConsumer;

   struct Offer {
    uint id;
    address creator;
    string ipfs_reference;
    uint deposit;
    uint duration;
    States state;
    Flags flag;
  }
  
  constructor(
      address _responder,
      address _referee,
      bool _isConsumer
  ) public {
    initiator = msg.sender;
    responder = _responder;
    referee = _referee;
    isConsumer = _isConsumer;
  }

  function offer(
    string _ipfs_reference,
    uint _deposit,
    uint _duration
  ) public onlyParticipant returns (uint) {
    uint length = offers.length;
    offers.push(Offer({
      id: length,
      creator: msg.sender,
      ipfs_reference: _ipfs_reference,
      deposit: _deposit,
      duration: _duration,
      state: States.Advisory,
      flag: Flags.none
    }));
    emit newOffer(length, _ipfs_reference, _deposit, _duration);
    return length;
  }

  function counterOffer(
    uint _responseTo, 
    string _ipfs_reference, 
    uint8 _state
    ) public onlyParticipant validStateTransitions(offers[_responseTo].state, States(_state)) {
    require(offers[_responseTo].creator != msg.sender);
    offers[_responseTo].creator = msg.sender;
    offers[_responseTo].state = States(_state);
    offers[_responseTo].ipfs_reference = _ipfs_reference;
    emit stateChange(offers[_responseTo].id, _state);
  }

  function counterOffer(
    uint _responseTo, 
    string _ipfs_reference, 
    uint _deposit,
    uint _duration,
    uint8 _state
    ) public onlyParticipant validStateTransitions(offers[_responseTo].state, States(_state)){
    require(msg.sender != offers[_responseTo].creator);
    offers[_responseTo].creator = msg.sender;
    offers[_responseTo].duration = _duration;
    offers[_responseTo].deposit = _deposit;
    offers[_responseTo].state = States(_state);
    offers[_responseTo].ipfs_reference = _ipfs_reference;
    emit stateChange(offers[_responseTo].id, _state);
  }

  function createAgreement(
    uint _responseTo, 
    string _ipfs_reference
    ) public onlyParticipant {
      require(offers[_responseTo].state == States.Acceptable_Acknowledge);
      require(msg.sender != offers[_responseTo].creator);
      offers[_responseTo].creator = msg.sender;
      offers[_responseTo].state = States.Binding;
      offers[_responseTo].ipfs_reference = _ipfs_reference;
      offers[_responseTo].duration = now + offers[_responseTo].duration;
      emit agreementMade(offers[_responseTo].id, offers[_responseTo].duration, offers[_responseTo].deposit);
  }

  function deposit(uint index) public payable {
    require(isConsumer && msg.sender == initiator || !isConsumer && msg.sender == responder);
    require(offers[index].state == States.Binding);
    require(msg.value == offers[index].deposit, 'Wrong deposit amount.');
    payee[index] = msg.sender;
    offers[index].state = States.Deposited;
    emit depsoitMade(msg.sender, msg.value);
  }

  function withdraw(uint index) public onlyParticipant returns (bool) {
    require(msg.sender != payee[index]);
    require(offers[index].state == States.Deposited, "First deposit money");
    require(now > offers[index].duration, "Agreement not expired");
    
    if(offers[index].deposit > 0) {
      if (msg.sender.send(offers[index].deposit)) {
          offers[index].state = States.Withdrawn;
          offers[index].deposit = 0;
          return true;
        } else {
          return false;
        }
    } else {
      return false;
    }
  }

  function dispute(uint index) public {
    require(msg.sender == payee[index]);
    require(offers[index].state == States.Deposited);
    require(now <= offers[index].duration);
    offers[index].state = States.Disputed;
    // offers[index].duration += 604800; // adds a week
    payee[index].transfer(offers[index].deposit); // transfers the funds back to the payee
  }

  function setFlag(uint index, uint _flag) public {
    require(msg.sender == referee);
    Flags flag = Flags(_flag);
    require(Flags.red == flag || Flags.yellow == flag);
    offers[index].flag = flag;
  }

  modifier onlyParticipant() {
    require(msg.sender == initiator || msg.sender == responder);
    _;
  }

  modifier validStateTransitions(States previous, States next) {
    require(previous != next || previous == States.Advisory && next == States.Advisory || previous == States.Acceptable && next == States.Acceptable);
    bool advToSol = previous == States.Advisory && next == States.Solicited;
    bool solToAcc = previous == States.Solicited && next == States.Acceptable;
    bool accToAck = previous == States.Acceptable && next == States.Acceptable_Acknowledge;
    bool solToRej = previous == States.Solicited && next == States.Rejected;
    bool accToRej = previous == States.Acceptable && next == States.Rejected;
    bool ackToRej = previous == States.Acceptable_Acknowledge && next == States.Rejected;
    bool witToAcc = previous == States.Withdrawn && next == States.Acceptable;
    require(advToSol || solToAcc || accToAck || solToRej || accToRej || ackToRej || witToAcc, 'invalid state transition');
    _;
  }
}
