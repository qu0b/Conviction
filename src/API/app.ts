'use strict';
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import { errors } from "./errors";
import { argumentsDefined } from './validationHelper';
import { prepareContract } from '../services/contract.helper';
import NegotiationAgent from '../agents/negotiation.agent';

const negotiation = prepareContract();
const simpleNegotiation = prepareContract('contracts/simpleNegotiation.sol', 'SimleNegotiation');

const addAgent = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('setting up agent');
  const agent = new NegotiationAgent();
  if(req.body.initiator || req.body.address)
    agent.owner = req.body.initiator || req.body.address;

  if(req.params.contractId) {
    try {
        agent.setContract(negotiation, req.params.contractId);
    } catch(err) {
      res.json({ result:"", error: "contract not found" })
    }
  }
    
   if(req.body.pass !== undefined && req.body.pass !== null) {
     agent.authenticate(req.body.pass);
   }
   
  req.body.agent = agent;
  next();
}

const corsOptions = {
  origin: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'OPTIONS'],
  optionsSuccessStatus: 200
}

const app = express();
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/create/contract', addAgent);
app.use('/contract/:contractId/*', addAgent);
app.use('/accounts', addAgent);



// routes
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('<h1> Welcome to Conviction </h1>');
});
// create a new contract
app.post('/create/contract', async (req: express.Request, res: express.Response) => {
  console.log('creating contract');
  
  if (req.body) {
    const body = {
      initiator: req.body.initiator,
      responder: req.body.responder
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const referee = req.body.referee;
      const isConsumer = req.body.isConsumer
      const agent = req.body.agent;
      const { responder } = body;
      if(referee && isConsumer) {
        const source = negotiation;
        try {
          const contract = await agent.deploy(source, [responder, referee, isConsumer]);
          // agent.contract = contract;
          // fs.writeFileSync(__dirname + '/contracts.json', JSON.stringify(contracts));
          res.status(200).json({ result: { newContract: contract._address, type: "Negotiation Strategy" } , error: ''});
        } catch (err) {
          console.log(err);
          res.status(500).json({ result: "", error: err.message});
        }
      } else {
        try {
          const source = simpleNegotiation;
          const contract = await agent.deploy(source, [responder]);
          res.status(200).json({ result: { newContract: contract._address, type: "Simple Negotiation" } , error: ''});
        } catch (err) {
          console.log(err);
          res.status(500).json({ result: "", error: err.message});
        }

      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});
// create a new offer
app.post('/contract/:contractId/offer', async (req: express.Request, res: express.Response) => {
  
  if (req.body) {
    const body = {
      address: req.body.address,
      offer: req.body.offer,
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const deposit = req.body.deposit;
      const duration = req.body.duration;
      const contractId = req.params.contractId;
      const agent: NegotiationAgent = req.body.agent;
      if(deposit && duration && contractId) {
        try {
          const result = await agent.offer(body.offer, deposit, duration);
          res.json(result);
        } catch (err) {
          console.log(err);
          res.status(500).json({ result: "", error: err.message});
        }
      } else {
        try {
          agent.setContract(simpleNegotiation, req.params.contractId);
          const result = await agent.offerSimple(body.offer);
          res.json(result);
        } catch (err) {
          console.log(err);
          res.status(500).json({ result: "", error: err.message});
        }
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});
//create a counter offer
app.post('/contract/:contractId/offer/:offerId', async (req: express.Request, res: express.Response) => {
  if (req.body) {
    const body = {
      address: req.body.address,
      counterOffer: req.body.counterOffer,
      offerId: req.params.offerId,
      contractId: req.params.contractId
    }
    const missingArguments = argumentsDefined(body);
    if(missingArguments) {
      const notDefinedError = errors.ERROR_MISSING_ARGUMENT;
      notDefinedError.message += missingArguments;
      errors.ERROR_MISSING_ARGUMENT.sendError(res)
    } else {
      const state = req.body.state;
      const agent: NegotiationAgent = req.body.agent;
      if(state) {
        try {
          let result = {};
          if(req.body.duration && req.body.deposit)
            result = await agent.counterOffer(body.offerId, body.counterOffer, req.body.deposit, req.body.duration, state);
          else
            result = await agent.counterOfferState(body.offerId, body.counterOffer, state);
            res.json(result);
        } catch (err) {
          console.log(err);
          res.status(500).json({ result: "", error: err.message });
        }
      } else {
        try {
            agent.setContract(simpleNegotiation, req.params.contractId);
            const result = await agent.counterOfferSimple(body.offerId, body.counterOffer);
            res.json(result);
        } catch (err) {
          console.log(err);
          res.status(500).json({ result: "", error: err.message });
        }
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});
// create an agreement
app.post('/contract/:contractId/offer/:offerId/agreement', async (req: express.Request, res: express.Response) => {
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
        const result = await agent.createAgreement(body.offerId, body.agreement);
        res.json(result);

      } catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: err.message});
      }
     
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

// deposit funds
app.post('/contract/:contractId/offer/:offerId/deposit', async (req: express.Request, res: express.Response) => {
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
        res.status(500).json({ result: "", error: err.message});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.post('/contract/:contractId/offer/:offerId/withdraw', async (req: express.Request, res: express.Response) => {
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
        res.status(500).json({ result: "", error: err.message});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.post('/contract/:contractId/offer/:offerId/flag/:num', async (req: express.Request, res: express.Response) => {
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
        res.status(500).json({ result: "", error: err.message});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.post('/contract/:contractId/offer/:offerId/dispute', async (req: express.Request, res: express.Response) => {
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
        res.status(500).json({ result: "", error: err.message});
      }
    }
  } else {
    errors.ERROR_NO_BODY.sendError(res);
  }
});

app.get('/contract/:contractId/offer/:offerId', async (req: express.Request, res: express.Response) => {
  const agent: NegotiationAgent = req.body.agent;
  try {
    const result = await agent.getOffer(req.params.offerId);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "", error: err.message});
  }
});

app.get('/accounts', async (req, res) => {
  const accounts = await req.body.agent.accounts();
  console.log(accounts);
  res.json({
    result: accounts
  });

  app.get('/accounts/unlock', async (req, res) => {
    const unlocked = await req.body.agent.authenticate('');
    res.json({ result: unlocked });
  });

  app.get('/accounts/new', async (req, res) => {
    const account = await req.body.agent.newAccount();
    res.json({
      address: account
    });
  });
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listing at ${PORT}`);
});