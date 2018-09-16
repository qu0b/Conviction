'use strict';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { errors } from "./errors";
import { argumentsDefined } from './validationHelper';
import { prepareContract } from '../services/contract.helper';
import NegotiationAgent from '../agents/negotiation.agent';
import { writeBuffer, readFile } from "../services/ipfs.helper";

const addAgent = (req: express.Request, res: Response, next: NextFunction) => {
  const agent = new NegotiationAgent();
  if(req.body.initiator || req.body.address)
    agent.owner = req.body.initiator || req.body.address;

  if(req.params.contractId) {
    try {
        agent.setContract(prepareContract(), req.params.contractId);
    } catch(err) {
      res.json({ result:"", error: "contract not found" })
    }
  }
    
   if(req.body.pass !== undefined || req.body.pass !== null) {
     console.log('unlocking');
     agent.authenticate(req.body.pass);
   }

  req.body.agent = agent;
  next();
}

let corsOptions = {
  origin: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'OPTIONS'],
  optionsSuccessStatus: 200
}

const app = express();
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/create/contract', addAgent);
app.use('/contract/:contractId/*', addAgent);



// routes
app.get('/', (req, res) => {
  res.send('<h1> Welcome to Conviction </h1>');
});
// create a new contract
app.post('/create/contract', async (req, res) => {
  if (req.body) {
    const body = {
      initiator: req.body.initiator,
      responder: req.body.responder,
      referee: req.body.referee,
      isConsumer: req.body.isConsumer
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const agent = req.body.agent;
      const source = prepareContract();
      const { responder, referee, isConsumer } = body;
      try {
        const contract = await agent.deploy(source, [responder, referee, isConsumer]);
        // agent.contract = contract;
        // fs.writeFileSync(__dirname + '/contracts.json', JSON.stringify(contracts));
        res.status(200).json({ result: contract._address, error: ''});
      } catch (err) {
        console.log(err);
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
      try {
        const agent: NegotiationAgent = req.body.agent;
        const { Hash } = await writeBuffer(body.offer);
        const result = await agent.offer(Hash, body.deposit, body.duration);
        res.json(result);
      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: "Something went wrong"});
      }
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
      offerId: req.params.offerId,
      contractId: req.params.contractId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      try {
        const agent: NegotiationAgent = req.body.agent;
        const { Hash } = await writeBuffer(body.counterOffer);
        let result = {};
        if(req.body.duration && req.body.deposit)
          result = await agent.counterOffer(body.offerId, Hash, req.body.deposit, req.body.duration, body.state);
        else
          result = await agent.counterOfferState(body.offerId, Hash, body.state);
          res.json(result);
      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: "Contract creation reverted, the offer you are referencing does not exist."});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});
// create an agreement
app.post('/contract/:contractId/offer/:offerId/agreement', async (req: any, res) => {
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
      try {

        const agent: NegotiationAgent = req.body.agent;
        const { Hash } = await writeBuffer(body.agreement);
        const result = await agent.createAgreement(body.offerId, Hash);
        res.json(result);

      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: "Something went wrong"});
      }
     
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
      try {
        const agent: NegotiationAgent = req.body.agent;
        const result = await agent.deposit(body.offerId, body.value);
        res.json(result);
      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: "Something went wrong"});
      }
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
      try {
        const agent: NegotiationAgent = req.body.agent;
        const result = await agent.withdraw(body.offerId);
        res.json(result);
      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: "Something went wrong"});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.post('/contract/:contractId/offer/:offerId/flag/:num', async (req: any, res) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      flag: req.params.num,
      contractId: req.params.contractId,
      offerId: req.params.offerId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      try {
        const agent: NegotiationAgent = req.body.agent;
        const result = await agent.flag(body.offerId, body.flag);
        res.json(result);
      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: "Something went wrong"});
      }
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

      try {
        const agent: NegotiationAgent = req.body.agent;
        const result = await agent.dispute(body.offerId);
        res.json(result);
      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: "Something went wrong"});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.get('/contract/:contractId/offer/:offerId', async (req: any, res) => {
  const agent: NegotiationAgent = req.body.agent;
  try {
    const result = await agent.getOffer(req.params.offerId);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "", error: "Something went wrong"});
  }
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listing at ${PORT}`);
});