'use strict';
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { errors } from "./errors";
import { argumentsDefined } from './validationHelper';
import session from "express-session";
import { prepareContract } from '../services/contract.helper';
import { setup } from "../index";
import NegotiationAgent from '../agents/negotiation.agent';
import { writeBuffer, readFile } from "../services/ipfs.helper";
import fs from 'fs';

const contracts = JSON.parse(fs.readFileSync(__dirname + '/contracts.json', 'utf-8')) || {};
console.log(__dirname);
// middleware setup agent
function addAgent(req, res, next) {

  if(req.params.contractId) {
    const agent: NegotiationAgent = contracts[req.params.contractId];
    if(req.body && req.body.address)
      agent.setOwner(req.body.address);
    if(req.body && req.body.pass)
      agent.authenticate(req.body.pass);
      req.agent = agent;

  } else if(req.body && req.body.initiator) {
    req.agent = new NegotiationAgent(req.body.initiator);
  } else {
    req.agent = new NegotiationAgent();
  }
  next();
}

const app = express();
app.use(addAgent);
app.use(logger('dev'));
app.use(helmet());
app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use( (req, res, next) => {
  next();
});

let corsOptions = {
  origin: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'OPTIONS'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

// routes
app.get('/', (req, res) => {
  res.send('<h1> Welcome to Conviction </h1>');
});
// create a new contract
app.post('/create/contract', cors, async (req, res) => {
  if (req.body) {
    const body = {
      initiator: req.body.initiator,
      responder: req.body.responder,
      referee: req.body.agent,
      isConsumer: req.body.isConsumer
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent = req.agent;
      const source = prepareContract();
      const { responder, referee, isConsumer } = body;
      const contract = await agent.deploy(source, [responder, referee, isConsumer]);
      if(contract && contract._address) {
        agent.contract = contract;
        contracts[contract._address] = agent;
        fs.writeFileSync('/contracts.json', contracts);
        res.status(200).json({ result: contract._address, error: ''});
      } else {
        res.status(500).json({ result: "", error: "Something went wrong"});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});
// create a new offer
app.post('/contract/:contractId/offer', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      offer: req.body.offer,
      deposit: req.body.deposit,
      duration: req.body.duration,
      contractId: req.params.contractId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent: NegotiationAgent = req.agent;
      const { Hash } = await writeBuffer(body.offer);
      const result = await agent.offer(Hash, body.deposit, body.duration);
      res.json(result);
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});
//create a counter offer
app.post('/contract/:contractId/offer/:offerId', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      counterOffer: req.body.counterOffer,
      state: req.body.state,
      offerId: req.params.offer,
      contractId: req.params.contractId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent: NegotiationAgent = req.agent;
      const { Hash } = await writeBuffer(body.counterOffer);
      let result = 'unknown';
      if(req.body.duration && req.body.deposit)
        result = await agent.counterOffer(body.offerId, Hash, req.body.deposit, req.body.duration, body.state);
      else
        result = await agent.counterOfferState(body.offerId, Hash, body.state);

        res.json(result);
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});
// create an agreement
app.post('/contract/:contractId/offer/:offerId/createAgreement', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      agreement: req.body.agreement,
      contractId: req.params.contractId,
      offerId: req.params.offerId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent: NegotiationAgent = req.agent;
      const { Hash } = await writeBuffer(body.agreement);
      const result = await agent.createAgreement(body.offerId, Hash);
      res.json(result);
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

// deposit funds
app.post('/contract/:contractId/offer/:offerId/deposit', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      value: req.body.value,
      contractId: req.params.contractId,
      offerId: req.params.offerId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent: NegotiationAgent = req.agent;
      const result = await agent.deposit(body.offerId, body.value);
      res.json(result);
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.post('/contract/:contractId/offer/:offerId/withdraw', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      contractId: req.params.contractId,
      offerId: req.params.offerId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent: NegotiationAgent = req.agent;
      const result = await agent.withdraw(body.offerId);
      res.json(result);
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.post('/contract/:contractId/offer/:offerId/flag/:num', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      flag: req.params.flag,
      contractId: req.params.contractId,
      offerId: req.params.offerId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent: NegotiationAgent = req.agent;
      const result = await agent.flag(body.offerId, body.flag);
      res.json(result);
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.post('/contract/:contractId/offer/:offerId/dispute', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      contractId: req.params.contractId,
      offerId: req.params.offerId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent: NegotiationAgent = req.agent;
      const result = await agent.dispute(body.offerId);
      res.json(result);
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.get('/contract/:contractId/offer/:offerId', async (req: any, res) => {
  const agent: NegotiationAgent = req.agent;
  const result = agent.getOffer(req.params.offerId);
  res.json(result);
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listing at ${PORT}`);
});