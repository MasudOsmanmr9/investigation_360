import { CustomError } from './customError.js';

export class BadRequestError extends CustomError {
    constructor(message) {
      super(message);
      Object.setPrototypeOf(this, BadRequestError.prototype);
    }
  
    get statusCode() {
      return 400; // Override the getter
    }
  
    serializeErrors() {
      return [{ message: this.message }];
    }
  }