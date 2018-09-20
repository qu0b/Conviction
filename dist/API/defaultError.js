"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class defaultError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
        this.message = message;
        this.toJson = () => {
            const error = { status: this.status, code: this.code, message: this.message };
            return error;
        };
    }
    sendError(res) {
        const error = this.toJson();
        res.status(this.status || 500).json({ result: "", code: error.code, message: this.message });
    }
}
exports.defaultError = defaultError;
//# sourceMappingURL=defaultError.js.map