export class defaultError extends Error {
  constructor(public status, public code, public message) {
    super(message);
  }

   toJson = () => {
     const error = { status: this.status, code: this.code, message: this.message }
     return error;
  }

  sendError(res) {
    const error = this.toJson();
    res.status(this.status || 500).json({ result: "", code: error.code, message: this.message });
  }
}