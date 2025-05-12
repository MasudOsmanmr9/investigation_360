import { CustomError } from './customError.js';

export class NotFoundError extends CustomError {
  constructor(message) {
    super('Resource not found');
    this.message = message || 'Resource not found';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  // Implement the abstract-like getter
  get statusCode() {
    return 404;
  }

  // Implement the abstract-like method
  serializeErrors() {
    return [{ message: this.message }];
  }
}