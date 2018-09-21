'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const errors_1 = require("./errors");
const validationHelper_1 = require("./validationHelper");
const contract_helper_1 = require("../services/contract.helper");
const negotiation_agent_1 = __importDefault(require("../agents/negotiation.agent"));
const addAgent = (req, res, next) => {
    console.log('setting up agent');
    const agent = new negotiation_agent_1.default();
    if (req.body.initiator || req.body.address)
        agent.owner = req.body.initiator || req.body.address;
    if (req.params.contractId) {
        try {
            agent.setContract(contract_helper_1.prepareContract(), req.params.contractId);
        }
        catch (err) {
            res.json({ result: "", error: "contract not found" });
        }
    }
    if (req.body.pass !== undefined && req.body.pass !== null) {
        agent.authenticate(req.body.pass);
    }
    req.body.agent = agent;
    next();
};
const corsOptions = {
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200
};
const app = express_1.default();
app.use(morgan_1.default('dev'));
app.use(cors_1.default(corsOptions));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use('/create/contract', addAgent);
app.use('/contract/:contractId/*', addAgent);
app.use('/accounts', addAgent);
// routes
app.get('/', (req, res) => {
    res.send('<h1> Welcome to Conviction </h1>');
});
// create a new contract
app.post('/create/contract', async (req, res) => {
    console.log('creating contract');
    if (req.body) {
        const body = {
            initiator: req.body.initiator,
            responder: req.body.responder,
            referee: req.body.referee,
            isConsumer: req.body.isConsumer
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            const agent = req.body.agent;
            const source = contract_helper_1.prepareContract();
            const { responder, referee, isConsumer } = body;
            try {
                const contract = await agent.deploy(source, [responder, referee, isConsumer]);
                // agent.contract = contract;
                // fs.writeFileSync(__dirname + '/contracts.json', JSON.stringify(contracts));
                res.status(200).json({ result: { newContract: contract._address }, error: '' });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
// create a new offer
app.post('/contract/:contractId/offer', async (req, res) => {
    if (req.body) {
        const body = {
            address: req.body.address,
            offer: req.body.offer,
            deposit: req.body.deposit,
            duration: req.body.duration,
            contractId: req.params.contractId
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            try {
                const agent = req.body.agent;
                const result = await agent.offer(body.offer, body.deposit, body.duration);
                res.json(result);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
//create a counter offer
app.post('/contract/:contractId/offer/:offerId', async (req, res) => {
    if (req.body) {
        const body = {
            address: req.body.address,
            counterOffer: req.body.counterOffer,
            state: req.body.state,
            offerId: req.params.offerId,
            contractId: req.params.contractId
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            try {
                const agent = req.body.agent;
                let result = {};
                if (req.body.duration && req.body.deposit)
                    result = await agent.counterOffer(body.offerId, body.counterOffer, req.body.deposit, req.body.duration, body.state);
                else
                    result = await agent.counterOfferState(body.offerId, body.counterOffer, body.state);
                res.json(result);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
// create an agreement
app.post('/contract/:contractId/offer/:offerId/agreement', async (req, res) => {
    if (req.body) {
        const body = {
            address: req.body.address,
            agreement: req.body.agreement,
            contractId: req.params.contractId,
            offerId: req.params.offerId
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            try {
                const agent = req.body.agent;
                const result = await agent.createAgreement(body.offerId, body.agreement);
                res.json(result);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
// deposit funds
app.post('/contract/:contractId/offer/:offerId/deposit', async (req, res) => {
    if (req.body) {
        const body = {
            address: req.body.address,
            value: req.body.value,
            contractId: req.params.contractId,
            offerId: req.params.offerId
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            try {
                const agent = req.body.agent;
                const result = await agent.deposit(body.offerId, body.value);
                res.json(result);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
app.post('/contract/:contractId/offer/:offerId/withdraw', async (req, res) => {
    if (req.body) {
        const body = {
            address: req.body.address,
            contractId: req.params.contractId,
            offerId: req.params.offerId
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            try {
                const agent = req.body.agent;
                const result = await agent.withdraw(body.offerId);
                res.json(result);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
app.post('/contract/:contractId/offer/:offerId/flag/:num', async (req, res) => {
    if (req.body) {
        const body = {
            address: req.body.address,
            flag: req.params.num,
            contractId: req.params.contractId,
            offerId: req.params.offerId
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            try {
                const agent = req.body.agent;
                const result = await agent.flag(body.offerId, body.flag);
                res.json(result);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
app.post('/contract/:contractId/offer/:offerId/dispute', async (req, res) => {
    if (req.body) {
        const body = {
            address: req.body.address,
            contractId: req.params.contractId,
            offerId: req.params.offerId
        };
        const missingArguments = validationHelper_1.argumentsDefined(body);
        if (missingArguments) {
            const notDefinedError = errors_1.errors.ERROR_MISSING_ARGUMENT;
            notDefinedError.message += missingArguments;
            errors_1.errors.ERROR_MISSING_ARGUMENT.sendError(res);
        }
        else {
            try {
                const agent = req.body.agent;
                const result = await agent.dispute(body.offerId);
                res.json(result);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ result: "", error: err.message });
            }
        }
    }
    else {
        errors_1.errors.ERROR_NO_BODY.sendError(res);
    }
});
app.get('/contract/:contractId/offer/:offerId', async (req, res) => {
    const agent = req.body.agent;
    try {
        const result = await agent.getOffer(req.params.offerId);
        res.json(result);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ result: "", error: err.message });
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
//# sourceMappingURL=app.js.map