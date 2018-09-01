import NegotiationAgent from "../agents/negotiation.agent";
import { setup, randomOffer, randomIPFSFile } from '../index';
import { prepareContract } from '../services/contract.helper'
import moment from 'moment';
import { Offer, contractOffer } from "types";

let consumerAgent: NegotiationAgent, providerAgent: NegotiationAgent;
const initiator = '0x00a329c0648769a73afac7f9381e08fb43dbea72';
const responder = '0x62a81b5e5c27fb7926f5c4847d5269dffc5128a5';
const negotionEnd = moment().add('1', 'weeks').unix();
const offers: Offer[] = [];



async function counter(index, nextState, isConsumer): Promise<Offer> {
  const hash = await randomIPFSFile();
  if(isConsumer) {
    await consumerAgent.counterOfferState(index, hash, nextState);
  } else {
    await providerAgent.counterOfferState(index, hash, nextState);
  }
  const counterOfferMade: Offer = await consumerAgent.getOffer(index);
  offers[index] = counterOfferMade;
  return counterOfferMade;
}



beforeAll(async () => {
  consumerAgent = setup(initiator);
  providerAgent = setup(responder);
  const source = prepareContract();
  const contract = await consumerAgent.deploy(source, [responder, negotionEnd, true]);
  consumerAgent.contract = contract;
  providerAgent.contract = contract;
});

// test('authenticate', async () => {
//   const auth = consumerAgent.authenticate('');
//   expect(auth).toBeTruthy();
// })

// test('get the consumers balance', async () => {
//   expect.assertions(1);
//   let balance = await consumerAgent.getBalance();
//   if(typeof balance == 'string') 
//     balance = parseInt(balance);
//   expect(balance).toBeGreaterThan(0);
// });

test('Create Advisory Offer', async () => {
  const [hash, deposit, duration] = await randomOffer();
  await consumerAgent.offer(hash, deposit, duration);
  const offerMade: Offer = await consumerAgent.getOffer(0);
  offers.push(offerMade);
  expect(offerMade.creator).toBe(consumerAgent.owner);
  expect(offerMade.deposit).toBe(deposit);
  expect(offerMade.duration).toBe(duration);
  expect(offerMade.state).toBe('Advisory');
  expect(offerMade.ipfs_reference).toBe(hash);
  expect(offerMade.id).toBe((offers.length-1));
});

test('counterOffer: Advisory -> Solicited', async () => {
  const index = 0, nextState = 1;
  const offer = await counter(index, nextState, false);
  expect(offer.state).toBe("Solicited");
});

test('counterOffer: Solicited -> Acceptable', async () => {
  const index = 0, nextState = 2;
  const offer = await counter(index, nextState, true);
  expect(offer.state).toBe("Acceptable");
});

test('counterOffer: Acceptable -> Accept_Acknowledge', async () => {
  const index = 0, nextState = 4;
  const offer = await counter(index, nextState, false);
  expect(offer.state).toBe("Accept_Acknowledge");
});

// test('counterOffer: Accept_Acknowledge -> Binding', async () => {
//   const index = 0, nextState = 5;
//   const offer = await counter(index, nextState, true);
//   expect(offer.state).toBe("Binding");
// });

test('createAgreement: Accept_Acknowledge -> Binding', async () => {
  const index = 0;
  const hash = await randomIPFSFile();
  await providerAgent.createAgreement(index, hash);
  const agreement: Offer = await consumerAgent.getOffer(index);
  expect(agreement.state).toBe('Binding');
});

test('deposit: Binding -> Deposited', async() => {
  const index = 0;
  await consumerAgent.deposit(index, offers[index].deposit);
  const balance = await consumerAgent.getContractBalance();
  const agreement: Offer = await consumerAgent.getOffer(index);
  expect(agreement.state).toBe('Deposited');
  expect(balance).toBeGreaterThan(0);
  expect(balance).toBe(offers[index].deposit);
});

test('withdraw', async() => {
  const index = 0;
  const amount = offers[index].deposit;
  const balance = await providerAgent.getBalance();
  const agreement: Offer = await consumerAgent.getOffer(index);
  const now = moment().unix()
  const seconds = agreement.duration > now ? agreement.duration - now : 0
  await wait(seconds);
  await providerAgent.withdraw(index);
  const newBalance = await providerAgent.getBalance();
  console.log(balance, newBalance);
  expect(newBalance - balance).toBe(offers[index].deposit);
  expect(newBalance).toBe(balance + amount);
}, 60000);

const wait = (seconds) => new Promise(res => setTimeout(res, seconds * 1000 * 1.5))