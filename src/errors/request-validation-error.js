import { CustomError } from './customError.js';

export class RequestValidationError extends CustomError {
  constructor(errors) {
    super('Invalid request parameters');
    this.errors = errors; // Array of validation errors
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  // Implement the abstract-like getter
  get statusCode() {
    return 400;
  }

  // Implement the abstract-like method
  serializeErrors() {
    return this.errors.map(err => {
      console.log('RequestValidationError', err);
      return { message: err.msg, field: err.path };
    });
  }
}