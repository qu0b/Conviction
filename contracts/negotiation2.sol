pragma solidity ^0.4.23;

contract Negotiation {
  enum States { Advisory, Solicited, Acceptable, Rejected, Acceptable_Acknowledge, Binding, Deposited, Disputed }
  address initiator;
  address responder;
  uint public negotiationEnd;
  bool isConsumer;
  Offer[] public offers;

  event depsoitMade(address consumer, uint amount);
  event agreementMade(uint index, uint end, uint deposit);
  event stateChange(uint index, uint8 next);
  event newOffer(uint index, string ipfs_reference, uint deposit, uint duration);

   struct Offer {
    uint id;
    address creator;
    string ipfs_reference;
    uint deposit;
    uint duration;
    States state;
  }
  
  constructor(
      address _responder,
      uint _NegotiationEnd,
      bool _isConsumer
  ) public {
    isConsumer = _isConsumer;
    initiator = msg.sender;
    responder = _responder;
    negotiationEnd = _NegotiationEnd;
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
      state: States.Advisory
    }));
    emit newOffer(length, _ipfs_reference, _deposit, _duration);
    return length;
  }

  function counterOffer(
    uint _responseTo, 
    string _ipfs_reference, 
    uint8 _state
    ) public {
    require(offers[_responseTo].state != States(_state));
    bool advToSol = offers[_responseTo].state == States.Advisory && States(_state) == States.Solicited;
    bool solToAcc = offers[_responseTo].state == States.Solicited && States(_state) == States.Acceptable;
    bool accToAck = offers[_responseTo].state == States.Acceptable && States(_state) == States.Acceptable_Acknowledge;
    bool solToRej = offers[_responseTo].state == States.Solicited && States(_state) == States.Rejected;
    bool accToRej = offers[_responseTo].state == States.Acceptable && States(_state) == States.Rejected;
    bool ackToRej = offers[_responseTo].state == States.Acceptable_Acknowledge && States(_state) == States.Rejected;
    require(advToSol || solToAcc || accToAck || solToRej || accToRej || ackToRej, 'invalid state transition');
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
    ) public {
    States next = States(_state);
    require(offers[_responseTo].state != States(_state));
    bool advToSol = offers[_responseTo].state == States.Advisory && States(_state) == States.Solicited;
    bool solToAcc = offers[_responseTo].state == States.Solicited && States(_state) == States.Acceptable;
    bool accToAck = offers[_responseTo].state == States.Acceptable && States(_state) == States.Acceptable_Acknowledge;
    bool solToRej = offers[_responseTo].state == States.Solicited && States(_state) == States.Rejected;
    bool accToRej = offers[_responseTo].state == States.Acceptable && States(_state) == States.Rejected;
    bool ackToRej = offers[_responseTo].state == States.Acceptable_Acknowledge && States(_state) == States.Rejected;
    require(advToSol || solToAcc || accToAck || solToRej || accToRej || ackToRej, 'invalid state transition');
    offers[_responseTo].creator = msg.sender;
    offers[_responseTo].duration = _duration;
    offers[_responseTo].deposit = _deposit;
    offers[_responseTo].state = next;
    offers[_responseTo].ipfs_reference = _ipfs_reference;
    emit stateChange(offers[_responseTo].id, uint8(next));
  }

  function createAgreement(
    uint _responseTo, 
    string _ipfs_reference
    ) public {
    offers[_responseTo].creator = msg.sender;
    offers[_responseTo].state = States.Binding;
    offers[_responseTo].ipfs_reference = _ipfs_reference;
    offers[_responseTo].duration = now + offers[_responseTo].duration;
    emit agreementMade(offers[_responseTo].id, offers[_responseTo].duration, offers[_responseTo].deposit);
  }

  function deposit(uint index) public payable {
    // require(isConsumer && msg.sender == responder || !isConsumer && msg.sender == initiator, 'Only the consumer can deposit');
    require(offers[index].state == States.Binding);
    require(msg.value == offers[index].deposit, 'Wrong deposit amount.');
    offers[index].state = States.Deposited;
    emit depsoitMade(msg.sender, msg.value);
  }

  function withdraw(uint index) public returns (bool) {
    require(offers[index].state == States.Deposited, "First deposit money");
    require(now > offers[index].duration, "Agreement not expired");
    if(offers[index].deposit > 0) {
      if (msg.sender.send(offers[index].deposit)) {
          offers[index].deposit = 0;
          return true;
        } else {
          return false;
        }
    } else {
      return false;
    }
  }

  modifier onlyParticipant() {
    require(msg.sender == initiator || msg.sender == responder);
    _;
  }
}
