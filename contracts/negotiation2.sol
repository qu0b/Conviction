pragma solidity ^0.4.23;
contract state {
  enum States { Advisory, Solicited, Acceptable, Rejected, Acceptable_Acknowledge, Binding, Deposited, Disputed }

  modifier onlyAdvisory(States previous, States next) {
    bool advToSol = previous == States.Advisory && next == States.Solicited;
    bool solToAcc = previous == States.Solicited && next == States.Acceptable;
    bool accToAck = previous == States.Acceptable && next == States.Acceptable_Acknowledge;
    bool solToRej = previous == States.Solicited && next == States.Rejected;
    bool accToRej = previous == States.Acceptable && next == States.Rejected;
    bool ackToRej = previous == States.Acceptable_Acknowledge && next == States.Rejected;
    require(!(advToSol || solToAcc || accToAck || solToRej || accToRej || ackToRej), 'The state transition is not possible');
    _;
  }
}

contract Negotiation is state {
  address initiator;
  address responder;
  uint public negotiationEnd;
  bool consumer;
  Offer[] public offers;

  Offer agreement;
  event depsoitMade(address consumer, uint amount);
  event stateChange(uint index, States previous, States next);

   struct Offer {
    address creator;
    uint id;
    uint responseTo; 
    string ipfs_reference;
    uint RAM;
    uint CPU;
    uint STORAGE;
    uint deposit;
    uint duration;
    States state;
  }
  
  constructor(
      address _responder,
      uint _NegotiationEnd,
      bool _consumer
  ) public {
    consumer = _consumer;
    initiator = msg.sender;
    responder = _responder;
    negotiationEnd = _NegotiationEnd;
  }

  function offer(
    string _ipfs_reference,
    uint _RAM,
    uint _CPU,
    uint _STORAGE,
    uint _deposit,
    uint _duration,
    uint8 _state
  ) public {
    offers.push(Offer({
      creator: msg.sender,
      id: offers.length,
      responseTo: offers.length,
      ipfs_reference: _ipfs_reference,
      RAM: _RAM,
      CPU: _CPU,
      STORAGE: _STORAGE,
      deposit: _deposit,
      duration: _duration,
      state: States(_state)
    }));
  }

  function counterOffer(uint _responseTo, uint8 _state) public arrayBounds(_responseTo) onlyAdvisory(offers[_responseTo].state, States(_state)) {
    States next = States(_state);
    Offer memory previous = offers[_responseTo];

    if(previous.state != next)
      emit stateChange(previous.id, previous.state, next);

    previous.state = next;
    previous.responseTo = previous.id;
    previous.id = offers.length;
    offers.push(previous);
  }

  function counterOffer(
    uint _responseTo,
    string _ipfs_reference,
    uint _RAM,
    uint _CPU,
    uint _STORAGE,
    uint _deposit,
    uint _duration,
    uint8 _state
) public arrayBounds(_responseTo) {
    States next = States(_state);
    Offer memory previous = offers[_responseTo];
    require(previous.state == States.Rejected, 'Couter offers cannot be made for Rejected offers');
    require(next == States.Advisory && previous.state == States.Solicited, 'Advisory counter offers cannot be made for Solicited offers');
    require(next == States.Solicited && previous.state == States.Acceptable, 'Solicited counter offers cannot be made for Acceptable offers');

    if(previous.state != next)
      emit stateChange(previous.id, previous.state, next);

      offers.push(Offer({
        creator: msg.sender,
        id: offers.length,
        responseTo: _responseTo,
        ipfs_reference: _ipfs_reference,
        RAM: _RAM,
        CPU: _CPU,
        STORAGE: _STORAGE,
        deposit: _deposit,
        duration: _duration,
        state: next
      }));
  }

  function createBindingAgreement(uint index) public arrayBounds(index) returns (bool) {
    Offer memory _agreement = offers[index];
    require(_agreement.state == States.Acceptable_Acknowledge, "To create a Binding agreement the negotiation offer needs to be Acceptable Acknowledged");
    _agreement.state = States.Binding;
    _agreement.duration = now + _agreement.duration;
    agreement = _agreement;
    return true;
  }


  function deposit() public payable {
    if(consumer) {
      require(msg.sender == initiator, 'Only the consumer can deposit');
    } else {
      require(msg.sender == responder, 'Only the consumer can deposit');
    }
    require(msg.value == agreement.deposit, 'Wrong deposit amount.');
    agreement.state = States.Deposited;
    emit depsoitMade(msg.sender, msg.value);
  }

  function withdraw() public returns (bool) {
    require(agreement.state == States.Deposited, "First deposit money");
    require(now > agreement.duration, "Payment is only possible after the agreement has expired");
    if(agreement.deposit > 0) {
      if (msg.sender.send(agreement.deposit)) {
          agreement.deposit = 0;
          return true;
        } else {
          return false;
        }
    } else {
      return false;
    }
  }

  // function getOffer(uint id) public view returns (current.id, current.ipfs_reference, current.RAM, current.CPU, current.STORAGE, current.deposit, current.duration, current.state){
  //   Offer memory current = offers[id];
  //   return current;
  // }

  modifier arrayBounds(uint index) {
    require(index >= 0 && index < offers.length, 'Index not in Array bounds for the offers array');
    _;
  }
}
