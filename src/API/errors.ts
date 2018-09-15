import { defaultError } from "./defaultError";

// Error Codes
const CODE_NO_BODY = "SERVER_ERROR_NO_BODY";
const CODE_MISSING_ARGUMENT = "SERVIER_ERROR_MISSING_ARGUMENT"


// Errors
const ERROR_NO_BODY = new defaultError(400, CODE_NO_BODY, "The request body does not have the required parameters");
const ERROR_MISSING_ARGUMENT = new defaultError(400, CODE_MISSING_ARGUMENT, "One or more parameters are missing");

export const errors = {
  ERROR_NO_BODY,
  ERROR_MISSING_ARGUMENT
}