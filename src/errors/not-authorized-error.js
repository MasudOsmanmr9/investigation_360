import { CustomError } from './customError.js';

export class NotAuthorizedError extends CustomError {
  constructor(message) {
    super('Not authorized');
    this.message = message;
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  // Implement the abstract-like getter
  get statusCode() {
    return 401;
  }

  // Implement the abstract-like method
  serializeErrors() {
    console.log('NotAuthorizedError serializeErrors',this.message);
    return [{ message: this.message?this.message:'Not authorized' }];
  }
}