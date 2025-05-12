import { CustomError } from './customError.js';

export class SystemError extends CustomError {
  constructor(message) {
    super('Something went wrong');
    this.message = message;
    Object.setPrototypeOf(this, SystemError.prototype);
  }

  // Implement the abstract-like getter
  get statusCode() {
    return 500;
  }

  // Implement the abstract-like method
  serializeErrors() {
    return [{ message: this.message }];
  }
}